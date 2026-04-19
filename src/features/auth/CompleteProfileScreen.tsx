import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.ts';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { User, AtSign, Lock, Check, Eye, EyeOff } from 'lucide-react';

export default function CompleteProfileScreen() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Check if username is unique
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Username is already taken. Please choose another one.");
      }

      // 2. Update Profile & Password
      await updateProfile(auth.currentUser, { displayName: fullName });
      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      // 3. Save to Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        fullName: fullName,
        username: username.toLowerCase().trim(),
        photoURL: auth.currentUser.photoURL || `https://cdn-icons-png.flaticon.com/512/149/149071.png`,
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
        isGoogleUser: true
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8faff] flex flex-col items-center relative">
      {/* Dynamic Multi-color Gradient Background */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] opacity-95"></div>
      
      <div className="w-full px-6 pt-12 pb-12 z-10 flex flex-col items-center min-h-full">
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-10 text-white">
          <img 
            src={APP_CONFIG.LOGO_URL} 
            alt={`${APP_CONFIG.NAME} Logo`} 
            className="w-16 h-16 mb-4 object-contain brightness-0 invert"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-black tracking-tighter italic">GrixChat</h1>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 px-8 py-10 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Complete Your Profile.</h2>
            <p className="text-zinc-500 text-sm font-medium">Set up your identity to continue.</p>
          </div>

          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <AtSign size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Set Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-indigo-600 text-white text-sm font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              {loading ? 'Saving...' : (
                <>
                  <span>Complete Setup</span>
                  <Check size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 pb-6 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 GrixChat</span>
          <span className="text-[9px] font-medium text-zinc-300 uppercase tracking-[0.2em]">from Gothwad technologies</span>
        </div>
      </div>
    </div>
  );
}
