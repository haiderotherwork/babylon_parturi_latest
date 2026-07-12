import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import EmbeddedBooking from './components/booking/EmbeddedBooking';
import StampCardModal from './components/StampCardModal';
import HolidayBar from './components/HolidayBar';
import { HolidayBarProvider, useHolidayBar } from './context/HolidayBarContext';
import HomePage from './pages/HomePage';
import QRcodePage from './pages/QRcodePage';
import BookingStandAlone from './pages/BookingStandAlone';
import NotFoundPage from './pages/NotFoundPage';
import RequestStampCardStandAlone from './pages/RequestStampCardStandAlone';

function AppContent() {
  const location = useLocation();
  const { isHolidayBarVisible } = useHolidayBar();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isStampCardOpen, setIsStampCardOpen] = useState(false);
  const [openedBookingFromStampCard, setOpenedBookingFromStampCard] =
    useState(false);

  const handleOpenBookingFromStampCard = () => {
    setIsBookingOpen(true);
    setOpenedBookingFromStampCard(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setOpenedBookingFromStampCard(false);
  };

  // Prevent body scroll when stamp card modal is open
  useEffect(() => {
    if (isStampCardOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isStampCardOpen]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <HolidayBar />

      {/* Sticky Stamp Card Button - Hidden on Request Stamp Card page */}
      {location.pathname !== '/pyyda-leimakortti' && (
        <button
          onClick={() => setIsStampCardOpen(true)}
          className={`fixed right-3 sm:right-4 z-50 bg-yellow-500 text-black px-4 py-3 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-300 flex items-center space-x-2 font-bold text-sm sm:text-sm border border-yellow-600 ${
            isHolidayBarVisible ? 'top-11 sm:top-12' : 'top-3 sm:top-4'
          }`}
        >
          <Ticket className="w-4 h-4 sm:w-4 sm:h-4" />
          <span>Leimakortti</span>
        </button>
      )}

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={<HomePage onOpenBooking={() => setIsBookingOpen(true)} />}
        />
        <Route
          path="/qrcode"
          element={<QRcodePage onOpenBooking={() => setIsBookingOpen(true)} />}
        />
        <Route
          path="/varaukset"
          element={<BookingStandAlone onOpenBooking={() => setIsBookingOpen(true)} />}
        />
        <Route
          path="/pyyda-leimakortti"
          element={<RequestStampCardStandAlone onOpenBooking={() => setIsBookingOpen(true)} />}
        />
        <Route
          path="*"
          element={<NotFoundPage onOpenBooking={() => setIsBookingOpen(true)} />}
        />
      </Routes>

      {/* Global Modals */}
      <EmbeddedBooking
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

      <StampCardModal
        isOpen={isStampCardOpen}
        onClose={() => setIsStampCardOpen(false)}
        onOpenBooking={handleOpenBookingFromStampCard}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <HolidayBarProvider>
        <AppContent />
      </HolidayBarProvider>
    </Router>
  );
}

export default App;

