import React, { useState } from 'react';
import { ArrowLeft, Bell, MessageSquare, Phone, Users, Volume2, Vibrate, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingHeader from '../../components/layout/SettingHeader.tsx';

export default function NotificationsSettingsScreen() {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    conversationTones: true,
    highPriority: true,
    reactionNotifications: true,
    groupHighPriority: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-primary' : 'bg-zinc-300'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      <SettingHeader title="Notifications" />

      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-6">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <Volume2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Conversation tones</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Play sounds for incoming messages</p>
              </div>
            </div>
            <Toggle active={settings.conversationTones} onClick={() => toggleSetting('conversationTones')} />
          </div>
        </div>

        {/* Messages Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">MESSAGES</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-6">
          <button className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Notification tone</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Default (Skyline)</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-40" />
          </button>
          <button className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-500">
                <Vibrate size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Vibrate</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Default</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-40" />
          </button>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">High priority notifications</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Show previews at top of screen</p>
              </div>
            </div>
            <Toggle active={settings.highPriority} onClick={() => toggleSetting('highPriority')} />
          </div>
        </div>

        {/* Groups Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">GROUPS</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-6">
          <button className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Users size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Group notification tone</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Default (Breeze)</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-40" />
          </button>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">High priority notifications</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Show previews at top of screen</p>
              </div>
            </div>
            <Toggle active={settings.groupHighPriority} onClick={() => toggleSetting('groupHighPriority')} />
          </div>
        </div>

        {/* Calls Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">CALLS</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)]">
          <button className="w-full flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Phone size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Ringtone</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Default (GrixChat)</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-40" />
          </button>
        </div>
      </div>
    </div>
  );
}
