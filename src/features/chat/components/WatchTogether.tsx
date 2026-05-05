import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { X, Maximize2, RotateCcw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WatchTogetherProps {
  url: string;
  chatId: string;
  currentUserId: string;
  watchState: any;
  updateWatchState: (updates: any) => Promise<void>;
  onClose: () => void;
}

const Player = ReactPlayer as any;

export default function WatchTogether({ 
  url, 
  chatId, 
  currentUserId, 
  watchState, 
  updateWatchState, 
  onClose 
}: WatchTogetherProps) {
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = (url || '').match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const [iframeKey, setIframeKey] = useState(0);

  // Sync with incoming Firestore state (Primitive for iframe)
  useEffect(() => {
    if (!watchState || !watchState.currentTime) return;
    
    // If the server time is significantly different from what we might expect, or manually synced
    // Since we can't easily get iframe time, we'll just allow manual sync or initial sync
  }, [watchState?.currentTime]);

  const youtubeId = extractYoutubeId(url);

  const syncNow = () => {
    // Incrementing key forces iframe reload with new start time
    setIframeKey(prev => prev + 1);
  };

  if (!youtubeId) {
    return (
      <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center text-white/50 text-xs">
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full bg-black relative z-[45] shadow-inner overflow-hidden flex flex-col"
    >
      <div className="aspect-video w-full max-h-[35dvh] bg-zinc-900 flex items-center justify-center relative group">
        <iframe 
          key={iframeKey}
          width="100%" 
          height="100%" 
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&start=${Math.floor(watchState?.currentTime || 0)}&rel=0&modestbranding=1`}
          title="Watch Together"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        <button 
          onClick={onClose}
          className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 backdrop-blur-md border border-white/20 active:scale-90"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="px-4 py-2 bg-black border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[9px] text-white font-black uppercase tracking-[0.2em]">Watch Party</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={syncNow}
            className="text-[9px] font-bold text-white/40 hover:text-white transition-colors uppercase flex items-center gap-1 active:scale-95"
          >
            <RotateCcw size={10} />
            Sync & Refresh
          </button>
          
          <button 
            onClick={() => updateWatchState({ currentTime: (watchState?.currentTime || 0) + 30 })}
            className="text-[9px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase flex items-center gap-1 active:scale-95"
          >
            Jump +30s
          </button>
        </div>
      </div>
    </motion.div>
  );
}
