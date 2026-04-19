import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Globe, 
  Shield, 
  Plus, 
  X, 
  Search,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

export default function BrowserScreen() {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com/search?igu=1', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputValue, setInputValue] = useState('https://www.google.com/search?igu=1');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    setInputValue(activeTab.url);
  }, [activeTabId, activeTab.url]);

  const addTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab: Tab = {
      id: newId,
      title: 'New Tab',
      url: 'https://www.google.com/search?igu=1',
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputValue;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}&igu=1`;
      }
    }
    
    updateTab(activeTabId, { url: targetUrl, title: targetUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] });
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const reload = () => {
    if (iframeRef.current) {
      const currentUrl = activeTab.url;
      updateTab(activeTabId, { url: '' });
      setTimeout(() => updateTab(activeTabId, { url: currentUrl }), 10);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden font-sans">
      {/* GxBrowser Header (Settings Style) */}
      <div className="shrink-0 bg-[var(--header-bg)] text-[var(--header-text)] shadow-lg rounded-b-3xl z-50 border-b border-white/10">
        {/* Tabs Row */}
        <div className="flex items-center px-4 h-12 gap-2 overflow-x-auto no-scrollbar pt-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2 min-w-[120px] max-w-[180px] rounded-xl cursor-pointer transition-all text-[11px] font-bold uppercase tracking-wider whitespace-nowrap
                  ${activeTabId === tab.id 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-white/60 hover:bg-white/5'}
                `}
              >
                <Globe size={12} className={activeTabId === tab.id ? 'text-white' : 'text-white/40'} />
                <span className="truncate flex-1">{tab.title}</span>
                <button 
                  onClick={(e) => closeTab(e, tab.id)}
                  className={`p-1 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity ${activeTabId === tab.id ? 'opacity-100' : ''}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              onClick={addTab}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 shrink-0"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* URL Bar Row */}
        <div className="flex items-center px-4 h-16 gap-3 pb-2">
          <div className="flex items-center gap-1">
            <button onClick={reload} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <RotateCw size={20} className={!activeTab.url ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => updateTab(activeTabId, { url: 'https://www.google.com/search?igu=1', title: 'Google' })} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Home size={20} />
            </button>
          </div>

          <form onSubmit={handleUrlSubmit} className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/40">
              <Shield size={16} className="text-emerald-400" />
            </div>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white/10 border border-white/5 rounded-2xl py-2.5 pl-12 pr-12 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/15 transition-all shadow-inner"
              placeholder="Search or type URL"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <button type="submit" className="text-white/40 hover:text-white transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white relative">
        {activeTab.url ? (
          <iframe 
            ref={iframeRef}
            src={activeTab.url}
            className="w-full h-full border-none"
            title="browser-content"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Security Disclaimer Overlay (Small) */}
        <div className="absolute bottom-4 right-4 max-w-[200px] bg-white/90 backdrop-blur border border-zinc-200 p-2 rounded-lg shadow-xl text-[9px] text-zinc-500 pointer-events-none">
          <div className="flex items-center gap-1 mb-1 font-bold text-zinc-700">
            <Shield size={10} />
            <span>GxBrowser Security</span>
          </div>
          Note: Some websites block embedding for security. If a site doesn't load, try searching on Google.
        </div>
      </div>
    </div>
  );
}
