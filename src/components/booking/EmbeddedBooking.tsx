import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface EmbeddedBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    iFrameResize?: (options: any, selector: string) => void;
  }
}

const EmbeddedBooking: React.FC<EmbeddedBookingProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/2.8.3/iframeResizer.min.js';
      script.async = true;
      script.onload = () => {
        if (window.iFrameResize) {
          window.iFrameResize({ checkOrigin: false }, '#reservationIframe31794');
        }
      };
      document.body.appendChild(script);

      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {
          // Script already removed
        }
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: '#191a1c' }}>
      <div className="flex justify-between items-center px-4 py-4 sm:px-6 sm:py-6 border-b border-gray-700 flex-shrink-0" style={{ backgroundColor: '#191a1c' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Varaa aika
        </h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ backgroundColor: '#191a1c' }}>
            <div className="mb-6">
              <img
                src="/babylon_parturi_logo_transparent.png"
                alt="Babylon Parturi"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-pulse"
              />
            </div>
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
            <p className="text-gray-200 text-lg font-medium">Ladataan varausjärjestelmää...</p>
            <p className="text-gray-400 text-sm mt-2">Hetkinen, ole hyvä</p>
          </div>
        )}
        <iframe
          id="reservationIframe31794"
          width="100%"
          frameBorder="0"
          src="https://varaa.timma.fi/reservation/parturibabylons.a"
          onLoad={handleIframeLoad}
          style={{
            height: '100%',
            border: 'none',
            display: 'block',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

export default EmbeddedBooking;
