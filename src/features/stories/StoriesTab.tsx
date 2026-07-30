import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { supabase } from '../../lib/supabase';
import Avatar from '../../components/common/Avatar';
import { CommonSearchBar } from '../../components/common/CommonSearchBar';

export default function StoriesTab() {
  const navigate = useNavigate();
  const { user: authUser, userData } = useAuth();
  
  const [stories, setStories] = useState<any[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch hidden user IDs
  useEffect(() => {
    if (!supabase || !authUser?.id || !userData?.hiddenChats || userData.hiddenChats.length === 0) {
      setHiddenUserIds([]);
      return;
    }
    const fetchHiddenUserIds = async () => {
      try {
        const { data } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', userData.hiddenChats)
          .neq('user_id', authUser.id);
        
        if (data) {
          setHiddenUserIds(data.map(d => d.user_id));
        }
      } catch (e) {
        console.warn("Failed to fetch hidden user ids inside stories tab:", e);
      }
    };
    fetchHiddenUserIds();
  }, [userData?.hiddenChats, authUser?.id]);

  const fetchStories = useCallback(async () => {
    if (!supabase || !authUser?.id) return;
    setStoriesLoading(true);
    try {
      // Clean up expired stories (> 24 hours) defensively at database level before fetching
      try {
        await supabase.rpc('cleanup_expired_stories');
      } catch (rpcErr) {
        console.warn('Defensive cleanup_expired_stories call failed (migration might not be run yet):', rpcErr);
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*, users:user_id(username, full_name, photo_url)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStories(data);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setStoriesLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const storiesGroupedByUser = useMemo(() => {
    const groups: { [key: string]: { userId: string; username: string; fullName: string; photoURL: string; stories: any[] } } = {};
    
    stories.forEach((story: any) => {
      if (hiddenUserIds.includes(story.user_id)) return;

      const uid = story.user_id;
      const userObj = story.users;
      const username = userObj?.username || 'User';
      const fullName = userObj?.full_name || username;
      const photoURL = userObj?.photo_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
      
      if (!groups[uid]) {
        groups[uid] = {
          userId: uid,
          username,
          fullName,
          photoURL,
          stories: []
        };
      }
      groups[uid].stories.push(story);
    });

    return Object.values(groups);
  }, [stories, hiddenUserIds]);

  const myStoriesGroup = storiesGroupedByUser.find(g => g.userId === authUser?.id);
  const otherStoriesGroups = useMemo(() => {
    const list = storiesGroupedByUser.filter(g => g.userId !== authUser?.id);
    if (!searchTerm) return list;
    const query = searchTerm.toLowerCase();
    return list.filter(g => 
      (g.fullName || '').toLowerCase().includes(query) || 
      (g.username || '').toLowerCase().includes(query)
    );
  }, [storiesGroupedByUser, authUser?.id, searchTerm]);

  const formatStoryTime = (createdAtString: string) => {
    if (!createdAtString) return '';
    const date = new Date(createdAtString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const isToday = date.toDateString() === now.toDateString();
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], options)}`;
    }
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], options)}`;
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString([], options);
  };

  const myStoryName = userData?.fullName || authUser?.email?.split('@')[0] || "My Story";

  const AVATAR_COLORS = ['#E17076','#7BC862','#65AADD','#E78A2F','#956FE4','#3CAFE5','#F57244','#49A0E9'];
  const getAvatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const myAvatarInitial = (myStoryName)[0].toUpperCase();

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] overflow-hidden animate-fade-in touch-pan-y font-sans relative">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-[var(--bg-card)]">

        {/* Search bar inside scroll viewport */}
        <CommonSearchBar 
          placeholder="Search stories..."
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />

        {/* Unified Top-to-Bottom List */}
        <div className="flex flex-col mt-1 bg-[var(--bg-card)]">
          
          {/* MY STATUS TILE */}
          <div 
            onClick={() => {
              if (myStoriesGroup) {
                navigate(`/stories/view/${authUser?.id}`);
              } else {
                navigate('/stories/create');
              }
            }}
            className="relative flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group cursor-pointer select-none"
          >
            {/* Left: Avatar with dynamic Ring or Plus Overlay */}
            <div className="relative shrink-0 w-[54px] h-[54px]">
              {userData?.photoURL && userData.photoURL !== '' && userData.photoURL !== 'https://cdn-icons-png.flaticon.com/512/149/149071.png' ? (
                <img src={userData.photoURL} alt={myStoryName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getAvatarColor(myStoryName), fontSize: '22px', fontWeight: 500 }}
                >
                  {myAvatarInitial}
                </div>
              )}
              
              {!myStoriesGroup && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[20px] h-[20px] bg-[#0494f4] text-white rounded-full flex items-center justify-center border-2 border-[var(--bg-card)] shadow-md">
                  <Plus size={12} strokeWidth={3.5} />
                </div>
              )}
            </div>

            {/* Middle: Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
              <h3 className="text-[16px] truncate font-medium text-[var(--text-primary)] mb-[2px]">
                {myStoryName}
              </h3>
              <p className="text-[15px] text-[var(--text-secondary)] truncate">
                {myStoriesGroup 
                  ? formatStoryTime(myStoriesGroup.stories[0].created_at)
                  : 'Tap to publish a status update'
                }
              </p>
            </div>

            {/* Right: navigation chevron */}
            <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-15 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
            
            <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
          </div>

          {/* FRIENDS' STATUSES (RECENT UPDATES) */}
          {storiesLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="animate-spin text-[#0494f4]" size={20} />
              <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-secondary)]">Loading stories...</span>
            </div>
          ) : otherStoriesGroups.length === 0 ? (
            <div className="px-5 py-8 text-center bg-[var(--bg-card)] border-b border-[var(--border-color)]/5 last:border-b-0">
              <p className="text-xs text-[var(--text-secondary)] opacity-75 italic">No shared status updates from other friends yet.</p>
            </div>
          ) : (
            otherStoriesGroups.map(group => {
              const groupInitial = (group.fullName || group.username || '?')[0].toUpperCase();
              return (
                <div 
                  key={group.userId}
                  onClick={() => navigate(`/stories/view/${group.userId}`)}
                  className="relative flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group cursor-pointer select-none"
                >
                  {/* Left: Avatar with brand themed ring */}
                  <div className="relative shrink-0 w-[54px] h-[54px]">
                    {group.photoURL && group.photoURL !== '' && group.photoURL !== 'https://cdn-icons-png.flaticon.com/512/149/149071.png' ? (
                      <img src={group.photoURL} alt={group.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: getAvatarColor(group.fullName || group.username), fontSize: '22px', fontWeight: 500 }}
                      >
                        {groupInitial}
                      </div>
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                    <h3 className="text-[16px] truncate font-medium text-[var(--text-primary)] mb-[2px]">
                      {group.fullName || group.username}
                    </h3>
                    <p className="text-[15px] text-[var(--text-secondary)] truncate">
                      {formatStoryTime(group.stories[0].created_at)}
                    </p>
                  </div>

                  {/* Right: navigation chevron */}
                  <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-15 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  
                  <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
