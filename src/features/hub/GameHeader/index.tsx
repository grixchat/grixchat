import React, { useState, useEffect } from 'react';
import { ChevronLeft, Maximize2, RotateCcw, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../services/firebase.ts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';

interface GameHeaderProps {
  title: string;
  onRefresh?: () => void;
  onFullscreen?: () => void;
}

export default function GameHeader({ title, onRefresh, onFullscreen }: GameHeaderProps) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => doc.data().isRead === false);
      setUnreadCount(unread.length);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full bg-[var(--header-bg)] px-4 h-14 flex justify-between items-center z-50 shrink-0 relative border-b border-white/10 shadow-lg rounded-b-2xl">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft size={24} className="text-[var(--header-text)]" />
        </button>
        <h1 className="text-lg font-black text-[var(--header-text)] tracking-tight uppercase">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1 text-[var(--header-text)]">
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        )}
        
        <button 
          onClick={() => navigate('/chats')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
        >
          <MessageCircle size={22} />
          {unreadCount > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[var(--header-bg)] shadow-sm z-10"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </button>

        {onFullscreen && (
          <button 
            onClick={onFullscreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Maximize2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
