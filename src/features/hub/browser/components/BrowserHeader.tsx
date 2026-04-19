import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Plus, 
  Search, 
  MoreVertical,
  Shield,
  Star,
  Settings,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { BrowserTabItem } from './BrowserTabItem';
import { BrowserTab } from '../types';

interface BrowserHeaderProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onActivateTab: (id: string) => void;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onSetZoom: (zoom: number) => void;
  onAppBack: () => void;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  tabs,
  activeTabId,
  onAddTab,
  onCloseTab,
  onActivateTab,
  onNavigate,
  onBack,
  onForward,
  onSetZoom,
  onAppBack
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId)!;
  const [urlInput, setUrlInput] = useState(activeTab.url);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTab.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(urlInput);
  };

  return (
    <div className="flex flex-col bg-[#dee1e6] border-b border-zinc-300 shrink-0 relative">
      {/* Tab Strip - Row 1 */}
      <div className="flex items-end px-2 pt-1 gap-1 overflow-x-auto no-scrollbar h-10">
        <button 
          onClick={onAppBack}
          className="p-1 px-2 mb-1 mr-1 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-700 flex items-center gap-1 shrink-0"
          title="Return to Hub"
        >
          <ArrowLeft size={16} strokeWidth={3} />
        </button>
        <div className="flex items-end gap-0 overflow-x-auto no-scrollbar flex-1">
          {tabs.map(tab => (
            <BrowserTabItem 
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onActivate={onActivateTab}
              onClose={onCloseTab}
            />
          ))}
          <button 
            onClick={onAddTab}
            className="p-1 mb-1 ml-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600 shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar - Row 2 */}
      <div className="bg-white px-2 py-1.5 flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button 
            disabled={activeTab.historyIndex === 0}
            onClick={onBack}
            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-600 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          <button 
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            onClick={onForward}
            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-600 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => onNavigate(activeTab.url)}
            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-600"
          >
            <RotateCw size={18} className={activeTab.isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Omnibox / Address Bar */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 max-w-4xl flex items-center bg-[#f1f3f4] rounded-full px-4 h-8 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-sm border border-transparent focus-within:border-blue-500/50 transition-all">
          <div className="flex items-center gap-2 shrink-0">
            {activeTab.url.startsWith('https') ? (
              <Shield size={14} className="text-zinc-500 group-focus-within:text-blue-500" />
            ) : (
              <Search size={14} className="text-zinc-500" />
            )}
          </div>
          <input 
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-2 text-[13px] text-zinc-800 placeholder:text-zinc-500 font-normal min-w-0"
            placeholder="Search Google or type a URL"
          />
          <button type="button" className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-full shrink-0">
            <Star size={14} />
          </button>
        </form>

        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-full transition-colors ${showSettings ? 'bg-zinc-200 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowSettings(false)} />
          <div className="absolute top-24 right-4 w-64 bg-white shadow-2xl rounded-xl border border-zinc-200 z-[70] p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Page Controls</span>
              <button 
                onClick={() => {
                  onNavigate('https://www.google.com/search?igu=1');
                  setShowSettings(false);
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <Home size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Home Page</span>
                  <span className="text-[10px] text-zinc-400">Back to Google Search</span>
                </div>
              </button>
            </div>

            <div className="h-[1px] bg-zinc-100 mx-2" />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Zoom</span>
              <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-xl">
                <button 
                  onClick={() => onSetZoom(activeTab.zoom - 0.1)}
                  className="w-10 h-10 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-zinc-600 transition-all border border-transparent hover:border-zinc-200"
                >
                  <ZoomOut size={20} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-zinc-800">{Math.round(activeTab.zoom * 100)}%</span>
                  <button onClick={() => onSetZoom(1)} className="text-[9px] text-blue-500 hover:underline">Reset</button>
                </div>
                <button 
                  onClick={() => onSetZoom(activeTab.zoom + 0.1)}
                  className="w-10 h-10 hover:bg-white hover:shadow-sm rounded-lg flex items-center justify-center text-zinc-600 transition-all border border-transparent hover:border-zinc-200"
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-zinc-100 mx-2" />
            
            <div className="flex flex-col gap-1">
               <button className="flex items-center gap-3 w-full p-2 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-colors">
                <Settings size={16} className="text-zinc-400" />
                <span className="text-sm">Browser Settings</span>
              </button>
              <button className="flex items-center gap-3 w-full p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors">
                <MoreVertical size={16} className="text-rose-400" />
                <span className="text-sm">Advanced Tools</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
