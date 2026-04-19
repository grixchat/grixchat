import React from 'react';
import SettingHeader from '../../components/layout/SettingHeader.tsx';
import { Bell, UserPlus, Heart, MessageSquare } from 'lucide-react';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: '1',
      type: 'follow',
      user: 'Rahul Sharma',
      action: 'started following you',
      time: '2m ago',
      icon: UserPlus,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'like',
      user: 'Priya Patel',
      action: 'liked your reel',
      time: '15m ago',
      icon: Heart,
      color: 'text-rose-500'
    },
    {
      id: '3',
      type: 'comment',
      user: 'Amit Kumar',
      action: 'commented on your post',
      time: '1h ago',
      icon: MessageSquare,
      color: 'text-emerald-500'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <SettingHeader title="Notifications" />
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className="flex items-center gap-4 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm">
                  <div className={`w-10 h-10 rounded-full bg-[var(--bg-main)] flex items-center justify-center ${notif.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {notif.user} <span className="font-medium text-[var(--text-secondary)]">{notif.action}</span>
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <Bell size={48} className="text-[var(--text-secondary)] mb-4" />
            <p className="text-[var(--text-primary)] font-bold">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
