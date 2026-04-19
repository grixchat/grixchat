import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Film, MapPin, ChevronRight, User, Music, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { ImageService } from '../../services/ImageService.ts';

export default function CreatePostScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userData, setUserData] = useState<any>(null);

  React.useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (s) => {
        setUserData(s.data());
      });
      return () => unsub();
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleShare = async () => {
    if (!image || !auth.currentUser) return;

    setLoading(true);
    try {
      const url = await ImageService.uploadImage(image, (p) => setUploadProgress(p));
      
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser.uid,
        userName: userData?.username || auth.currentUser.displayName || 'User',
        userAvatar: userData?.photoURL || '',
        imageUrl: url,
        caption,
        location,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp()
      });

      navigate('/');
    } catch (error) {
      console.error("Error sharing post:", error);
      alert("Failed to share post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={28} />
          </button>
          <h2 className="text-xl font-bold text-white">New post</h2>
        </div>
        <button 
          onClick={handleShare}
          disabled={loading || !image}
          className="text-white font-bold text-lg hover:bg-white/10 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Share'}
        </button>
      </div>

      {loading && (
        <div className="bg-blue-50 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-600">Uploading... {uploadProgress}%</span>
          <div className="w-32 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex gap-4 border-b border-zinc-100">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 bg-zinc-100 rounded-md overflow-hidden cursor-pointer flex items-center justify-center border-2 border-dashed border-zinc-200"
        >
          {previewUrl ? (
            <img src={previewUrl} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-zinc-400" />
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        <textarea 
          placeholder="Write a caption..."
          className="flex-1 py-2 text-sm focus:outline-none resize-none"
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* Options */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3 flex-1">
            <MapPin size={20} className="text-zinc-500" />
            <input 
              type="text" 
              placeholder="Add location" 
              className="text-sm focus:outline-none flex-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <User size={20} className="text-zinc-500" />
            <span className="text-sm">Tag people</span>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <Music size={20} className="text-zinc-500" />
            <span className="text-sm">Add music</span>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
      </div>

      {/* Footer / Gallery hint */}
      <div className="p-4 mt-auto">
        <p className="text-xs text-zinc-400">Your post will be shared with your followers.</p>
      </div>
    </div>
  );
}
