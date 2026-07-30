import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Bell, 
  MessageSquare, 
  Sliders, 
  Star, 
  VolumeX, 
  UserMinus, 
  HelpCircle, 
  Lock, 
  ChevronRight,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../providers/AuthProvider';
import { CommonSearchBar } from '../../../components/common/CommonSearchBar';
import Avatar from '../../../components/common/Avatar';
import { truncateToChars } from '../../../utils/bioHelper';
import { MultiAccountService, StoredAccount } from '../../../services/MultiAccountService';

export default function ProfileSettingsContent() {
  const { user: authUser, userData } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [switchableAccounts, setSwitchableAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    const list = MultiAccountService.getAccounts().filter((acc) => acc.userId !== authUser?.id);
    setSwitchableAccounts(list);
  }, [authUser]);

  const settingsItems = [
    { icon: Users, label: 'Account Settings', sub: 'Change email, password, delete account', onClick: () => navigate('/account-settings') },
    { icon: Lock, label: 'Privacy Settings', sub: userData?.isPrivate ? 'Private Account' : 'Public Account', onClick: () => navigate('/privacy-settings') },
    { icon: Shield, label: 'App Lock PIN', sub: 'Enable PIN/Passcode protection', onClick: () => navigate('/app-lock') },
    { icon: Bell, label: 'Notifications & Sounds', sub: 'Ringtones, Vibrations & Alerts', onClick: () => navigate('/notifications-settings') },
    { icon: MessageSquare, label: 'Chat Customizer & Wallpaper', sub: 'Bubbles shape, text size, wallpapers', onClick: () => navigate('/chat-settings') },
    { icon: Sliders, label: 'System Preferences', sub: 'App theme, network download, local database Backups', onClick: () => navigate('/app-preferences') },
    { icon: Star, label: 'Favorites Feed', sub: 'Manage star list curation', onClick: () => navigate('/favorites') },
    { icon: VolumeX, label: 'Muted Accounts', sub: 'Silenced chat channels', onClick: () => navigate('/muted-accounts') },
    { icon: UserMinus, label: 'Blocked Accounts', sub: 'Banned chat list users', onClick: () => navigate('/blocked-accounts') },
    { icon: HelpCircle, label: 'Grixvibe FAQ & Support', sub: 'Knowledgebase and system status', onClick: () => navigate('/help') },
    { icon: InfoIcon, label: 'About App', sub: 'Grixvibe V1.2.0 Stable Build', onClick: () => navigate('/app-info') },
  ];

  const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const profilePic = userData?.photoURL || (userData as any)?.photo_url || authUser?.user_metadata?.avatar_url || DEFAULT_LOGO;

  const filteredItems = settingsItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sub && item.sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const AVATAR_COLORS = ['#E17076','#7BC862','#65AADD','#E78A2F','#956FE4','#3CAFE5','#F57244','#49A0E9'];
  const getAvatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const avatarInitial = (userData?.fullName || userData?.username || '?')[0].toUpperCase();

  return (
    <div className="w-full flex flex-col bg-[var(--bg-card)] overflow-hidden animate-fade-in touch-pan-y">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-[var(--bg-card)]">
        {/* Scrollable Reusable Search Bar */}
        <CommonSearchBar 
          placeholder="Search settings..."
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Settings options list */}
        <div className="flex flex-col mt-1 bg-[var(--bg-card)]">
          {searchQuery === '' && (
            <>
              {/* Profile card click element */}
              <div 
                onClick={() => navigate('/edit-profile')}
                className="relative flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group cursor-pointer select-none"
              >
                <div className="relative shrink-0 w-[54px] h-[54px]">
                  {profilePic && profilePic !== '' && profilePic !== DEFAULT_LOGO ? (
                    <img src={profilePic} alt={userData?.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getAvatarColor(userData?.fullName || userData?.username), fontSize: '22px', fontWeight: 500 }}
                    >
                      {avatarInitial}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                  <h3 className="text-[16px] font-medium text-[var(--text-primary)] truncate mb-[2px]">
                    {userData?.fullName || 'GrixChat User'}
                  </h3>
                  <p className="text-[15px] text-[var(--text-secondary)] truncate">
                    @{userData?.username || 'username'}
                  </p>
                </div>
                <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
              </div>

              {/* Bio block display */}
              {userData?.bio && (
                <div 
                  onClick={() => navigate('/edit-profile')}
                  className="relative flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group cursor-pointer select-none"
                >
                  <div className="relative shrink-0 w-[54px] h-[54px] flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary)]/10 shadow-sm shrink-0 group-hover:scale-[1.02] transition-transform">
                      <InfoIcon size={22} className="stroke-[2.2]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full select-none">
                    <span className="text-[12px] font-semibold text-[#0494f4] uppercase tracking-wider block font-sans opacity-95 mb-[2px]">
                      Bio
                    </span>
                    <p className="text-[15px] text-[var(--text-primary)] truncate">
                      "{truncateToChars(userData.bio)}"
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
                </div>
              )}

              {/* Other registered accounts list */}
              {switchableAccounts.map((acc) => {
                const accInitial = (acc.fullName || acc.username || '?')[0].toUpperCase();
                return (
                  <button 
                    key={acc.userId}
                    onClick={() => MultiAccountService.switchAccount(acc.userId)}
                    className="relative w-full flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group text-left cursor-pointer select-none bg-transparent"
                  >
                    <div className="relative shrink-0 w-[54px] h-[54px]">
                      {acc.photoURL && acc.photoURL !== '' && acc.photoURL !== DEFAULT_LOGO ? (
                        <img src={acc.photoURL} alt={acc.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: getAvatarColor(acc.fullName || acc.username), fontSize: '22px', fontWeight: 500 }}
                        >
                          {accInitial}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                      <h3 className="text-[16px] font-medium text-[var(--text-primary)] truncate mb-[2px]">
                        Switch Profile
                      </h3>
                      <p className="text-[15px] text-[var(--text-secondary)] truncate">
                        @{acc.username}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
                  </button>
                );
              })}
            </>
          )}

          {/* Render filtered settings option list */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2 select-none px-4">
              <p className="text-[13px] font-bold text-[var(--text-secondary)]">No settings matched your search</p>
              <p className="text-[11px] text-[var(--text-secondary)]/60 max-w-xs">Try searching for app preferences, account, password, sound, block etc.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button 
                key={item.label}
                onClick={item.onClick}
                className="relative w-full flex items-center gap-[12px] px-[12px] py-[8px] min-h-[72px] hover:bg-[var(--border-color)]/5 active:bg-[var(--border-color)]/10 transition-colors duration-200 group text-left cursor-pointer select-none bg-transparent"
              >
                <div className="relative shrink-0 w-[54px] h-[54px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary)]/10 shadow-sm group-hover:scale-[1.02] transition-transform">
                    <item.icon size={22} className="stroke-[2.2]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                  <h3 className="text-[16px] font-medium text-[var(--text-primary)] truncate mb-[2px]">
                    {item.label}
                  </h3>
                  {item.sub && (
                    <p className="text-[15px] text-[var(--text-secondary)] truncate">
                      {item.sub}
                    </p>
                  )}
                </div>
                <div className="absolute bottom-0 left-[78px] right-0 h-[0.5px] bg-[var(--border-color)]/25" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
