import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    iFrameResize?: (options: any, selector: string) => void;
  }
}

const BookingStandAlone: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-between items-center px-4 py-4 sm:px-6 sm:py-6 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Varaa aika
        </h2>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Takaisin</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <iframe
          id="reservationIframe31794"
          width="100%"
          frameBorder="0"
          src="https://varaa.timma.fi/reservation/parturibabylons.a"
          style={{
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

export default BookingStandAlone;