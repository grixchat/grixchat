import React, { useRef, useEffect } from 'react';
import { BrowserTab } from '../types';
import { Shield, Globe } from 'lucide-react';

interface BrowserContentProps {
  tab: BrowserTab;
  isActive: boolean;
}

export const BrowserContent: React.FC<BrowserContentProps> = ({ tab, isActive }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Focus iframe on activation? (Note: may not work due to cross-origin)
  useEffect(() => {
    if (isActive && iframeRef.current) {
      iframeRef.current.focus();
    }
  }, [isActive]);

  if (!isActive) return null;

  // Fixed scaling to ensure it fills the viewport correctly
  const scale = tab.zoom;
  const invScale = 1 / scale;

  return (
    <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
      <div 
        className="flex-1 w-full relative origin-top-left overflow-hidden"
        style={{ 
          transform: `scale(${scale})`,
          width: `${invScale * 100}%`,
          height: `${invScale * 100}%` 
        }}
      >
        <iframe 
          ref={iframeRef}
          src={tab.url}
          className="w-full h-full border-none bg-white"
          title={`browser-tab-${tab.id}`}
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
