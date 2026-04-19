import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, UserCheck } from 'lucide-react';
import { db, auth } from '../../services/firebase.ts';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function FollowListScreen() {
  const { id: userId, type } = useParams(); // type will be 'followers' or 'following'
  const navigate = useNavigate();
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !type) return;
      setLoading(true);
      try {
        // Fetch current user data for follow/unfollow logic
        if (auth.currentUser) {
          const myDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (myDoc.exists()) setCurrentUserData(myDoc.data());
        }

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const ids = type === 'followers' ? (userData.followers || []) : (userData.following || []);
          
          if (ids.length > 0) {
            // Fetch details for all users in the list
            const usersData: any[] = [];
            for (const id of ids) {
              const uDoc = await getDoc(doc(db, "users", id));
              if (uDoc.exists()) {
                usersData.push({ id: uDoc.id, ...uDoc.data() });
              }
            }
            setUserList(usersData);
          }
        }
      } catch (error) {
        console.error("Error fetching follow list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, type]);

  const handleToggleFollow = async (targetId: string, isCurrentlyFollowing: boolean) => {
    if (!auth.currentUser || !targetId) return;
    
    try {
      const myDocRef = doc(db, "users", auth.currentUser.uid);
      const targetDocRef = doc(db, "users", targetId);
      
      await updateDoc(myDocRef, {
        following: !isCurrentlyFollowing ? arrayUnion(targetId) : arrayRemove(targetId)
      });
      
      await updateDoc(targetDocRef, {
        followers: !isCurrentlyFollowing ? arrayUnion(auth.currentUser.uid) : arrayRemove(auth.currentUser.uid)
      });

      // Update local state
      setCurrentUserData((prev: any) => ({
        ...prev,
        following: !isCurrentlyFollowing 
          ? [...(prev.following || []), targetId] 
          : (prev.following || []).filter((id: string) => id !== targetId)
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const filteredUsers = userList.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 h-16 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] z-50 shadow-lg border-b border-white/10">
        <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-black text-white tracking-tight uppercase">
          {type === 'followers' ? 'Followers' : 'Following'}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-zinc-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Loading List...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-bold text-sm">No users found</p>
            <p className="text-zinc-400 text-xs mt-1">Try searching with a different name</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filteredUsers.map((u) => {
              const isMe = auth.currentUser?.uid === u.id;
              const amIFollowing = currentUserData?.following?.includes(u.id);

              return (
                <div key={u.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                  <div 
                    onClick={() => navigate(`/user/${u.id}`)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <img 
                      src={u.photoURL || DEFAULT_LOGO} 
                      className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 tracking-tight">{u.fullName}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">@{u.username}</p>
                    </div>
                  </div>

                  {!isMe && (
                    <button 
                      onClick={() => handleToggleFollow(u.id, amIFollowing)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        amIFollowing 
                        ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' 
                        : 'bg-primary text-white shadow-lg shadow-[var(--primary-shadow)]'
                      }`}
                    >
                      {amIFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
