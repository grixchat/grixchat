import React from 'react';
import { X, Globe } from 'lucide-react';
import { BrowserTab } from '../types';

interface BrowserTabItemProps {
  tab: BrowserTab;
  isActive: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}

export const BrowserTabItem: React.FC<BrowserTabItemProps> = ({ tab, isActive, onActivate, onClose }) => {
  return (
    <div
      onClick={() => onActivate(tab.id)}
      className={`
        group relative flex items-center h-9 px-3 min-w-[120px] max-w-[200px] cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-white text-zinc-800 rounded-t-lg shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-10' 
          : 'text-zinc-600 hover:bg-zinc-200/50 hover:rounded-t-lg'}
      `}
      style={{
        clipPath: isActive ? 'none' : 'inset(0 1px 0 0)',
      }}
    >
      {/* Decorative separators for inactive tabs */}
      {!isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-zinc-300 group-hover:bg-transparent" />
      )}
      
      <div className="flex items-center gap-2 truncate flex-1 pr-2">
        <div className={`shrink-0 ${tab.isLoading ? 'animate-spin' : ''}`}>
          {tab.favIcon ? (
            <img src={tab.favIcon} alt="" className="w-4 h-4" referrerPolicy="no-referrer" />
          ) : (
            <Globe size={14} className={isActive ? 'text-blue-500' : 'text-zinc-400'} />
          )}
        </div>
        <span className="text-xs font-medium truncate select-none">
          {tab.title || 'New Tab'}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        className={`
          p-1 rounded-sm hover:bg-zinc-200 transition-opacity
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        <X size={12} />
      </button>
    </div>
  );
};
