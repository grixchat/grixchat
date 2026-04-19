import React, { useState } from 'react';
import { MoreVertical, Heart, MessageCircle, Send, Music, Camera, ChevronLeft } from 'lucide-react';
import TabBottom from '../../components/layout/TabBottom.tsx';
import { useNavigate } from 'react-router-dom';

export default function ReelsScreen() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const reels = [
    {
      id: 1,
      user: 'travel_vibes',
      caption: 'Exploring the hidden gems of the world 🌍✨ #travel #reels',
      audio: 'Original Audio - travel_vibes',
      likes: '124K',
      comments: '1.2K',
      youtubeId: 'qM79_itR0Nc' // Example YouTube Short ID
    }
  ];

  const reel = reels[0];

  return (
    <div className="h-full flex flex-col bg-black text-white relative overflow-hidden w-full font-sans">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition-all">
            <ChevronLeft size={28} />
          </button>
          <h2 className="text-xl font-black uppercase tracking-tight">Reels</h2>
        </div>
        <button onClick={() => navigate('/reels/create')} className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
          <Camera size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-zinc-900">
        {/* YouTube Embed */}
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${reel.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${reel.youtubeId}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
            className="w-full h-full border-0 pointer-events-none scale-[1.3]"
            allow="autoplay; encrypted-media"
            title="Reel Video"
          />
        </div>
        
        {/* Interaction Overlay (to capture clicks/swipes if needed, and to hide YT controls) */}
        <div className="absolute inset-0 z-10 bg-transparent"></div>

        {/* Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-20"></div>

        {/* Side Actions */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-30">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setLiked(!liked)}
              className={`p-3 rounded-full transition-all ${liked ? 'text-red-500 scale-125' : 'text-white'}`}
            >
              <Heart size={32} fill={liked ? "currentColor" : "none"} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest">{reel.likes}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="p-3 text-white">
              <MessageCircle size={32} />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest">{reel.comments}</span>
          </div>
          <button className="p-3 text-white">
            <Send size={32} />
          </button>
          <button className="p-3 text-white">
            <MoreVertical size={28} />
          </button>
          <div className="w-10 h-10 rounded-xl border-2 border-white/30 overflow-hidden rotate-12 shadow-xl">
            <img src="https://picsum.photos/seed/audio/100/100" className="w-full h-full object-cover" alt="Audio" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute left-4 bottom-24 right-20 z-30">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/user1/100/100" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                alt="User"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <span className="font-black text-sm uppercase tracking-tight">{reel.user}</span>
            <button className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
              Follow
            </button>
          </div>
          <p className="text-sm mb-4 line-clamp-2 font-medium leading-relaxed drop-shadow-md">
            {reel.caption}
          </p>
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10">
            <Music size={14} className="animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">
              {reel.audio}
            </span>
          </div>
        </div>
      </div>

      <TabBottom />
    </div>
  );
}
