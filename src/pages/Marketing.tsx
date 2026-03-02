import { useState, useRef, useCallback } from 'react';
import DSMLoader from '../components/DSMLoader';

const Marketing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isContentReady, setIsContentReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = useCallback(() => {
    // Give extra time for iframe's own assets and animations to initialize
    setTimeout(() => {
      setIsContentReady(true);
    }, 1000);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* DSM 3D Holographic Loader */}
      {isLoading && (
        <DSMLoader 
          onLoadComplete={handleLoadComplete} 
          isContentReady={isContentReady}
        />
      )}

      {/* Marketing Page iframe - loads in background */}
      <iframe
        ref={iframeRef}
        src="/marketing/index.html"
        title="DSM Marketing Portfolio"
        className="w-full h-full border-0"
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: isLoading ? 1 : 9999,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 500ms ease-out'
        }}
        onLoad={handleIframeLoad}
        allowFullScreen
      />
    </div>
  );
};

export default Marketing;
