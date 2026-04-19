import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Camera, X, Youtube, Type, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import SettingHeader from '../../components/layout/SettingHeader.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../providers/AuthProvider';
import { getYouTubeVideoId } from '../../lib/youtubeUtils';

export default function ReelsMakerScreen() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    youtubeLink: '',
    description: '',
    coverImage: ''
  });
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 500KB for Firestore base64 storage)
      if (file.size > 500 * 1024) {
        alert("Cover image is too large. Please select an image under 500KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    const videoId = getYouTubeVideoId(formData.youtubeLink);
    
    if (!videoId) {
      alert("Please enter a valid YouTube link.");
      return;
    }
    
    if (!formData.description) {
      alert("Please enter a description.");
      return;
    }

    if (!formData.coverImage) {
      alert("Please upload a cover image.");
      return;
    }

    if (!user) {
      alert("You must be logged in to post a reel.");
      return;
    }

    setIsPosting(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'reels'), {
        youtubeId: videoId,
        caption: formData.description,
        cover: formData.coverImage,
        userUid: user.uid,
        userName: userData?.displayName || user.displayName || 'Anonymous',
        userAvatar: userData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        audio: `Original Audio - ${userData?.displayName || user.displayName || 'User'}`
      });

      setIsPosting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/reels');
      }, 2000);
    } catch (error) {
      console.error("Error posting reel:", error);
      alert("Failed to post reel. Please try again.");
      setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
      <SettingHeader 
        title="Post a Reel" 
        rightElement={
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-zinc-100/10 transition-all"
          >
            <X size={24} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Cover Image Upload */}
          <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] block">Reel Cover</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[9/16] w-52 mx-auto rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-chat)] flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden group shadow-sm"
            >
              {formData.coverImage ? (
                <>
                  <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={32} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)]">
                  <div className="p-5 bg-[var(--bg-main)] rounded-3xl shadow-sm border border-[var(--border-color)]">
                    <ImageIcon size={36} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Upload Cover</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          {/* YouTube Link Input */}
          <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] block">YouTube Video Link</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500">
                <Youtube size={22} />
              </div>
              <input 
                type="text"
                placeholder="https://youtube.com/shorts/..."
                value={formData.youtubeLink}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeLink: e.target.value }))}
                className="w-full bg-[var(--bg-chat)] border border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-[var(--text-secondary)]/50"
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] px-2 font-medium leading-relaxed">
              Paste a YouTube Short or Video link to use as your Reel.
            </p>
          </div>

          {/* Description Input */}
          <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] block">Description</label>
            <div className="relative">
              <div className="absolute left-5 top-5 text-[var(--text-secondary)]">
                <Type size={22} />
              </div>
              <textarea 
                placeholder="Write a catchy description for your reel..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-[var(--bg-chat)] border border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-5 text-sm font-medium text-[var(--text-primary)] min-h-[140px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none placeholder:text-[var(--text-secondary)]/50"
              />
            </div>
          </div>

          {/* Post Button */}
          <button 
            onClick={handlePost}
            disabled={isPosting}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all ${
              isPosting 
              ? 'bg-[var(--bg-chat)] text-[var(--text-secondary)]/50 cursor-not-allowed border border-[var(--border-color)]' 
              : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isPosting ? (
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Post Reel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tight">Reel Posted!</h2>
            <p className="text-zinc-500 text-sm">Your reel is being processed and will be live shortly.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
