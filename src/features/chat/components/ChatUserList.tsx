import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Lock, Archive, Check, Trash, VolumeX, Pin } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { supabase } from '../../../lib/supabase';
import { aiService } from '../../../services/AIService';
import { useLayout } from '../../../contexts/LayoutContext';
import Avatar from '../../../components/common/Avatar';
import { storage } from '../../../services/StorageService';
import { LocalDataCache } from '../../../services/LocalDataCache';

interface ChatItem {
  id: string;
  user: string;
  username: string;
  fullName: string;
  lastMsg: string;
  time: string;
  avatar: string;
  unread: boolean;
  unreadCount?: number;
  isOnline: boolean;
  otherUserId: string;
  type?: 'direct' | 'group';
  lastMsgStatus?: 'Sent' | 'Received';
}

interface OtherUser {
  uid: string;
  username: string;
  fullName: string;
  photoURL: string;
  isOnline: boolean;
}

const DoubleTick = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" className="shrink-0">
    <path d="M11 1L5 9L2 6" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M15 1L9 9L7.5 7.2" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ChatItemRow: React.FC<{
  chat: ChatItem;
  isChatSelectMode: boolean;
  isSelected: boolean;
  isPinned?: boolean;
  onToggleSelect: (chatId: string) => void;
  setChatSelectMode: (val: boolean) => void;
  setSelectedChatIds: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({
  chat,
  isChatSelectMode,
  isSelected,
  isPinned = false,
  onToggleSelect,
  setChatSelectMode,
  setSelectedChatIds
}) => {
  const navigate = useNavigate();
  const timerRef = React.useRef<any>(null);
  const startXRef = React.useRef<number>(0);
  const startYRef = React.useRef<number>(0);
  const isLongPressActiveRef = React.useRef<boolean>(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [draft, setDraft] = React.useState<any>(null);

  React.useEffect(() => {
    if (!chat.otherUserId) return;
    setDraft(LocalDataCache.get<any>(`draft_${chat.otherUserId}`));
    
    return LocalDataCache.subscribe(`draft_status_${chat.otherUserId}`, (payload) => {
      setDraft(payload);
    });
  }, [chat.otherUserId]);

  const { isDraft, displayLastMsg } = React.useMemo(() => {
    if (draft && (draft.text?.trim() || (draft.files && draft.files.length > 0))) {
      let msg = '';
      if (draft.text?.trim()) {
        msg = draft.text;
      } else if (draft.files && draft.files.length > 0) {
        const firstFile = draft.files[0];
        if (firstFile.type?.startsWith('image/')) {
          msg = '🖼️ Photo';
        } else if (firstFile.type?.startsWith('video/')) {
          msg = '🎥 Video';
        } else {
          msg = '📁 Attachment';
        }
      }
      return { isDraft: true, displayLastMsg: msg };
    }
    return { isDraft: false, displayLastMsg: chat.lastMsg };
  }, [draft, chat.lastMsg]);

  React.useEffect(() => {
    if (!supabase || !chat.id || !chat.otherUserId) return;
    
    const channel = supabase.channel(`typing:${chat.id}`);
    let timeoutId: any = null;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload && payload.userId === chat.otherUserId) {
          setIsTyping(payload.isTyping);
          
          if (timeoutId) clearTimeout(timeoutId);
          if (payload.isTyping) {
            timeoutId = setTimeout(() => {
              setIsTyping(false);
            }, 6000);
          }
        }
      })
      .subscribe();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [chat.id, chat.otherUserId]);

  const startPress = (e: any) => {
    isLongPressActiveRef.current = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startXRef.current = clientX;
    startYRef.current = clientY;

    timerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setChatSelectMode(true);
      setSelectedChatIds(prev => prev.includes(chat.id) ? prev : [...prev, chat.id]);
      if (navigator.vibrate) navigator.vibrate(40);
    }, 600);
  };

  const handleMove = (e: any) => {
    if (!timerRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffX = Math.abs(clientX - startXRef.current);
    const diffY = Math.abs(clientY - startYRef.current);
    
    if (diffX > 10 || diffY > 10) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressActiveRef.current) {
      e.preventDefault();
      return;
    }
    cancelPress();
    
    if (isChatSelectMode) {
      onToggleSelect(chat.id);
    } else {
      navigate(`/chat/${chat.otherUserId}`);
    }
  };

  const AVATAR_COLORS = ['#E17076','#7BC862','#65AADD','#E78A2F','#956FE4','#3CAFE5','#F57244','#49A0E9'];
  const getAvatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const avatarInitial = (chat.user || chat.fullName || '?')[0].toUpperCase();

  // Assuming muted state is not in interface but part of design
  const isMuted = false;

  return (
    <div
      onTouchStart={startPress}
      onTouchMove={handleMove}
      onTouchEnd={cancelPress}
      onMouseDown={startPress}
      onMouseMove={handleMove}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={handleClick}
      className={`relative flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] transition-colors duration-200 cursor-pointer select-none ${
        isSelected 
          ? 'bg-[var(--primary)]/10' 
          : 'bg-[var(--bg-card)] active:bg-[var(--border-color)]/8'
      }`}
    >
      <div className="relative shrink-0 w-[54px] h-[54px]">
        {chat.avatar && chat.avatar !== '' && chat.avatar !== 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder' ? (
          <img src={chat.avatar} alt={chat.user} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div 
            className="w-full h-full rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: getAvatarColor(chat.user || chat.fullName), fontSize: '22px', fontWeight: 500 }}
          >
            {avatarInitial}
          </div>
        )}
        
        {chat.isOnline && !isSelected && (
          <div className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-[#4CAF50] border-2 border-[var(--bg-card)] z-10" />
        )}

        {isSelected && (
          <div className="absolute inset-0 rounded-full bg-[var(--primary)] flex items-center justify-center z-20">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-1">
        <div className="flex justify-between items-center mb-[2px]">
          <div className="flex items-center gap-1 min-w-0 flex-1 mr-2">
            <h3 className={`text-[16px] truncate text-[var(--text-primary)] ${chat.unread ? 'font-semibold' : 'font-medium'}`}>
              {chat.user}
            </h3>
            {isMuted && <VolumeX size={14} className="text-[var(--text-secondary)] shrink-0" />}
            {isPinned && !isMuted && <Pin size={14} className="fill-[var(--text-secondary)] text-[var(--text-secondary)] shrink-0" />}
          </div>
          <span className={`text-[13px] whitespace-nowrap shrink-0 ${chat.unread ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
            {chat.time}
          </span>
        </div>

        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            {isTyping ? (
              <span className="text-[var(--primary)] text-[15px] truncate">
                typing...
              </span>
            ) : (
              <p className={`text-[15px] truncate m-0 ${chat.unread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {isDraft ? (
                  <>
                    <span className="text-[#E53935] mr-1">Draft: </span>
                    <span className="text-[var(--text-primary)]">{displayLastMsg}</span>
                  </>
                ) : (
                  <>
                    {chat.lastMsgStatus === 'Sent' && (
                      <span className="text-[var(--text-secondary)]">You: </span>
                    )}
                    {chat.lastMsg}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0 min-w-[20px]">
            {chat.unread ? (
              <div 
                className={`min-w-[20px] h-[20px] px-1.5 rounded-[10px] flex items-center justify-center ${isMuted ? 'bg-[var(--text-secondary)]/50' : 'bg-[var(--primary)]'}`}
              >
                <span className="text-[12px] text-white font-semibold leading-none">
                  {chat.unreadCount && chat.unreadCount > 99 ? '99+' : chat.unreadCount || 1}
                </span>
              </div>
            ) : isPinned ? (
              <Pin size={16} className="fill-[var(--text-secondary)]/60 text-[var(--text-secondary)]/60" />
            ) : chat.lastMsgStatus === 'Sent' ? (
              <DoubleTick />
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
    </div>
  );
};

const GrixAIRow: React.FC = () => {
  const navigate = useNavigate();
  const [aiDraft, setAiDraft] = useState<any>(null);

  useEffect(() => {
    setAiDraft(LocalDataCache.get<any>('draft_grix-ai'));
    return LocalDataCache.subscribe('draft_status_grix-ai', (payload) => {
      setAiDraft(payload);
    });
  }, []);

  const aiMessages = aiService.getMessages();
  const lastAiMsg = aiMessages[aiMessages.length - 1];
  
  let lastAiText = lastAiMsg ? lastAiMsg.text : "Ask me anything! I'm here to help.";
  let isAiDraft = false;

  if (aiDraft && (aiDraft.text?.trim() || (aiDraft.files && aiDraft.files.length > 0))) {
    isAiDraft = true;
    if (aiDraft.text?.trim()) {
      lastAiText = aiDraft.text;
    } else if (aiDraft.files && aiDraft.files.length > 0) {
      const firstFile = aiDraft.files[0];
      if (firstFile.type?.startsWith('image/')) {
        lastAiText = '🖼️ Photo';
      } else if (firstFile.type?.startsWith('video/')) {
        lastAiText = '🎥 Video';
      } else {
        lastAiText = '📁 Attachment';
      }
    }
  }
  
  let lastAiTime = "Online";
  if (lastAiMsg) {
    const msgDate = new Date(lastAiMsg.timestamp);
    const now = new Date();
    if (msgDate.toDateString() === now.toDateString()) {
      lastAiTime = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      lastAiTime = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  return (
    <div 
      onClick={() => navigate('/chat/grix-ai')}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-all duration-205 border-b border-[var(--border-color)]/5 group cursor-pointer border-l-[4px] border-l-transparent select-none"
    >
      <div 
        className="relative shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/profile/grix-ai');
        }}
      >
        <Avatar url="/assets/favicon.png" type="direct" name="Grix AI" isOnline={true} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="text-[14.5px] truncate font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
            Grix AI
          </h3>
          <span className="text-[10px] whitespace-nowrap text-[var(--text-secondary)] opacity-60">
            {lastAiTime}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[13px] truncate text-[var(--text-secondary)] font-medium opacity-75">
            {isAiDraft ? (
              <>
                <span className="text-rose-500 dark:text-rose-400 font-bold mr-1">Draft:</span>
                <span className="text-[var(--text-primary)] dark:text-zinc-200">{lastAiText}</span>
              </>
            ) : (
              lastAiText
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ChatUserListProps {
  conversations: ChatItem[];
  otherUsers?: OtherUser[];
  showGrixAI?: boolean;
  archivedCount?: number;
  showSecretHeader?: boolean;
  onSecretHeaderClick?: () => void;
  secretCount?: number;
  emptyMessage?: string;
  emptySubMessage?: string;
  loading?: boolean;
  usersWithStories?: string[];
  showHiddenChatsEntry?: boolean;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({
  conversations,
  otherUsers = [],
  showGrixAI = false,
  archivedCount = 0,
  showSecretHeader = false,
  onSecretHeaderClick,
  secretCount = 0,
  emptyMessage = "No messages yet",
  emptySubMessage = "Start a conversation with your friends.",
  loading = false,
  usersWithStories = [],
  showHiddenChatsEntry = true
}) => {
  const navigate = useNavigate();
  const { isChatSelectMode, setChatSelectMode, selectedChatIds, setSelectedChatIds } = useLayout();
  const { user: authUser, userData, refreshUserData } = useAuth();
  const [settingsMap, setSettingsMap] = useState<Record<string, { nickname?: string; customPhotoUrl?: string }>>({});
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);

  useEffect(() => {
    const loadPinned = () => {
      try {
        const pinned = JSON.parse(storage.getItem('app-pinned-chats') || '[]');
        setPinnedChatIds(pinned);
      } catch (_) {}
    };

    loadPinned();
    window.addEventListener('pinned-chats-changed', loadPinned);
    return () => window.removeEventListener('pinned-chats-changed', loadPinned);
  }, []);

  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aPinned = pinnedChatIds.includes(a.id);
      const bPinned = pinnedChatIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0; // retain original order
    });
  }, [conversations, pinnedChatIds]);

  useEffect(() => {
    if (!authUser?.id || !supabase) return;
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('chat_settings')
          .select('receiver_id, nickname, custom_photo_url')
          .eq('user_id', authUser.id);
        
        const mapping: Record<string, { nickname?: string; customPhotoUrl?: string }> = {};
        (data || []).forEach((item: any) => {
          if (item.receiver_id) {
            mapping[item.receiver_id] = {
              nickname: item.nickname || undefined,
              customPhotoUrl: item.custom_photo_url || undefined,
            };
          }
        });
        setSettingsMap(mapping);
      } catch (err) {
        console.warn("Failed to load chat settings map:", err);
      }
    };
    fetchSettings();
  }, [authUser?.id]);

  const handleSwipeArchive = async (chatId: string) => {
    if (userData && authUser) {
      try {
        const currentArchived = Array.isArray(userData.archivedChats) ? userData.archivedChats : [];
        if (!currentArchived.includes(chatId)) {
          const updatedArchived = [...currentArchived, chatId];
          if (supabase) {
            const targetId = authUser.id || authUser.uid;
            await supabase
              .from('users')
              .update({ archived_chats: updatedArchived })
              .eq('id', targetId);
            if (refreshUserData) {
              await refreshUserData();
            }
          }
        }
      } catch (err) {
        console.error('Failed to swipe-archive:', err);
      }
    }
  };

  const handleSwipeDelete = async (chatId: string) => {
    if (userData && authUser) {
      try {
        const currentHidden = Array.isArray(userData.hiddenChats) ? userData.hiddenChats : [];
        if (!currentHidden.includes(chatId)) {
          const updatedHidden = [...currentHidden, chatId];
          if (supabase) {
            const targetId = authUser.id || authUser.uid;
            await supabase
              .from('users')
              .update({ hidden_chats: updatedHidden })
              .eq('id', targetId);
            if (refreshUserData) {
              await refreshUserData();
            }
          }
        }
      } catch (err) {
        console.error('Failed to swipe-delete:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Loading Chats...</p>
      </div>
    );
  }

  const handleToggleSelect = (chatId: string) => {
    setSelectedChatIds(prev => {
      const isAlreadySelected = prev.includes(chatId);
      const nextSelected = isAlreadySelected 
        ? prev.filter(id => id !== chatId) 
        : [...prev, chatId];
      
      if (nextSelected.length === 0) {
        setChatSelectMode(false);
      }
      return nextSelected;
    });
  };

  const renderOtherUser = (user: OtherUser) => {
    const customSetts = settingsMap[user.uid];
    const finalName = customSetts?.nickname || user.fullName || user.username;
    const finalPhoto = customSetts?.customPhotoUrl || user.photoURL;

    return (
      <Link 
        to={`/chat/${user.uid}`} 
        key={user.uid} 
        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-all duration-205 border-b border-[var(--border-color)]/5 last:border-b-0 group border-l-[4px] border-l-transparent select-none"
      >
        <Avatar url={finalPhoto} type="direct" name={finalName} isOnline={user.isOnline} />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="text-[14.5px] truncate font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
              {finalName}
            </h3>
            <span className="text-[10px] whitespace-nowrap text-[var(--text-secondary)] uppercase font-semibold tracking-tight opacity-40">
              Suggested
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[13px] truncate text-[var(--text-secondary)] opacity-70 italic">
              Say hi 👋
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col bg-[var(--bg-card)]">
      {/* Secret Code Header */}
      {showSecretHeader && (
        <div 
          onClick={onSecretHeaderClick}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-all duration-205 border-b border-[var(--border-color)]/5 group cursor-pointer border-l-[4px] border-l-transparent select-none"
        >
          <div className="relative shrink-0 z-10">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-zinc-800 flex items-center justify-center text-indigo-500 group-hover:scale-[1.02] transition-transform border border-[var(--border-color)]/10">
              <Lock size={19} className="text-indigo-500 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="text-[14.5px] truncate font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                Hidden Chats
              </h3>
              <span className="text-[9.5px] whitespace-nowrap text-indigo-500 font-semibold tracking-tight bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Unlocked
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] truncate text-[var(--text-secondary)] font-medium opacity-75">
                {secretCount > 0 ? `${secretCount} hidden conversations available` : 'Private conversations space'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grix AI */}
      {showGrixAI && <GrixAIRow />}

      {/* Archived Chats Pinned Shortcut */}
      {showGrixAI && (
        <div 
          onClick={() => navigate('/chats/archived')}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-all duration-205 border-b border-[var(--border-color)]/5 group cursor-pointer border-l-[4px] border-l-transparent select-none"
        >
          <div className="relative shrink-0 z-10">
            <div className="w-12 h-12 rounded-full bg-[#0494f4]/10 dark:bg-zinc-800 flex items-center justify-center text-[var(--primary)] group-hover:scale-[1.02] transition-transform border border-[var(--border-color)]/15">
              <Archive size={19} className="text-[var(--primary)]" />
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="text-[14.5px] truncate font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                Archived Chats
              </h3>
              <span className="text-[10px] whitespace-nowrap text-[#0494f4] font-semibold tracking-tight bg-[#0494f4]/10 px-2 py-0.5 rounded-full">
                {archivedCount > 0 ? archivedCount : 'View'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] truncate text-[var(--text-secondary)] font-medium opacity-75">
                Saved and hidden from main mailbox
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Chats Pinned Shortcut */}
      {showGrixAI && showHiddenChatsEntry && !showSecretHeader && (
        <div 
          onClick={() => navigate('/chats/hidden')}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-all duration-205 border-b border-[var(--border-color)]/5 group cursor-pointer border-l-[4px] border-l-transparent select-none"
        >
          <div className="relative shrink-0 z-10">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-zinc-800 flex items-center justify-center text-indigo-500 group-hover:scale-[1.02] transition-transform border border-[var(--border-color)]/15">
              <Lock size={19} className="text-indigo-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="text-[14.5px] truncate font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                Hidden Chats
              </h3>
              <span className="text-[10px] whitespace-nowrap text-indigo-500 font-semibold tracking-tight bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Secret
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[13px] truncate text-[var(--text-secondary)] font-medium opacity-75">
                Private conversations protected with secret code
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      {sortedConversations.length > 0 && (
        <div className="flex flex-col">
          {sortedConversations.map(chat => (
            <ChatItemRow
              key={chat.id}
              chat={chat}
              isChatSelectMode={isChatSelectMode}
              isSelected={selectedChatIds.includes(chat.id)}
              isPinned={pinnedChatIds.includes(chat.id)}
              onToggleSelect={handleToggleSelect}
              setChatSelectMode={setChatSelectMode}
              setSelectedChatIds={setSelectedChatIds}
            />
          ))}
        </div>
      )}

      {/* Empty State when no chats are loaded */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
          <div className="p-4 bg-[var(--bg-main)] rounded-xl text-[var(--text-secondary)] shadow-sm border border-[var(--border-color)]/10">
            <MessageCircle size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{emptyMessage}</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed opacity-70">
              {emptySubMessage}
            </p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="mt-2 bg-[var(--primary)] text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg shadow-[var(--primary-shadow)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Find Friends
          </button>
        </div>
      )}

    </div>
  );
};
