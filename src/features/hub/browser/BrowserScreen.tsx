import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBrowser } from './hooks/useBrowser';
import { BrowserHeader } from './components/BrowserHeader';
import { BrowserContent } from './components/BrowserContent';

export default function BrowserScreen() {
  const navigate = useNavigate();
  const { 
    tabs, 
    activeTabId, 
    addTab, 
    closeTab, 
    setActiveTabId, 
    navigateTo, 
    goBack, 
    goForward,
    setZoom 
  } = useBrowser();

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* The Chrome Browser Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <BrowserHeader 
          tabs={tabs}
          activeTabId={activeTabId}
          onAddTab={addTab}
          onCloseTab={closeTab}
          onActivateTab={setActiveTabId}
          onNavigate={navigateTo}
          onBack={goBack}
          onForward={goForward}
          onSetZoom={setZoom}
          onAppBack={() => navigate(-1)}
        />
        
        <div className="flex-1 relative bg-[#f1f3f4] overflow-hidden flex flex-col">
          {tabs.map(tab => (
            <BrowserContent 
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

