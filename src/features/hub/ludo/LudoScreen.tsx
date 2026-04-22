import React, { useRef } from 'react';
import GameHeader from '../GameHeader';

export default function LudoScreen() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)]">
      <GameHeader 
        title="Ludo Stars" 
        onRefresh={handleRefresh}
        onFullscreen={handleFullscreen}
      />
      
      <div className="flex-1 w-full bg-zinc-900 relative">
        <iframe 
          ref={iframeRef}
          src="https://zv1y2i8p.play.gamezop.com/g/SkhljT2fdgb"
          className="w-full h-full border-0"
          allow="fullscreen"
          title="Ludo Game"
          style={{ width: '100%', height: '100%', border: '0px' }}
        />
      </div>
    </div>
  );
}
