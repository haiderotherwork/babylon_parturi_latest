import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import EmbeddedBooking from './pyyda_leimakortticomponents/pyyda_leimakorttibooking/pyyda_leimakorttiEmbeddedBooking';
import StampCardModal from './pyyda_leimakortticomponents/pyyda_leimakorttiStampCardModal';
import HolidayBar from './pyyda_leimakortticomponents/pyyda_leimakorttiHolidayBar';
import { HolidayBarProvider, useHolidayBar } from './pyyda_leimakortticontext/pyyda_leimakorttiHolidayBarContext';
import HomePage from './pyyda_leimakorttipages/pyyda_leimakorttiHomePage';
import QRcodePage from './pyyda_leimakorttipages/pyyda_leimakorttiQRcodePage';
import BookingStandAlone from './pyyda_leimakorttipages/pyyda_leimakorttiBookingStandAlone';
import NotFoundPage from './pyyda_leimakorttipages/pyyda_leimakorttiNotFoundPage';
import RequestStampCardStandAlone from './pyyda_leimakorttipages/pyyda_leimakorttiRequestStampCardStandAlone';

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

  /pyyda_leimakortti/pyyda_leimakortti Prevent body scroll when stamp card modal is open
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
      <HolidayBar /pyyda_leimakortti>

      {/pyyda_leimakortti* Sticky Stamp Card Button - Hidden on Request Stamp Card page */pyyda_leimakortti}
      {location.pathname !== '/pyyda_leimakorttipyyda_leimakortti' && (
        <button
          onClick={() => setIsStampCardOpen(true)}
          className={`fixed right-3 sm:right-4 z-50 bg-yellow-500 text-black px-4 py-3 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-300 flex items-center space-x-2 font-bold text-sm sm:text-sm border border-yellow-600 ${
            isHolidayBarVisible ? 'top-11 sm:top-12' : 'top-3 sm:top-4'
          }`}
        >
          <Ticket className="w-4 h-4 sm:w-4 sm:h-4" /pyyda_leimakortti>
          <span>Leimakortti</pyyda_leimakorttispan>
        </pyyda_leimakorttibutton>
      )}

      {/pyyda_leimakortti* Routes */pyyda_leimakortti}
      <Routes>
        <Route
          path="/pyyda_leimakortti"
          element={<HomePage onOpenBooking={() => setIsBookingOpen(true)} /pyyda_leimakortti>}
        /pyyda_leimakortti>
        <Route
          path="/pyyda_leimakorttiqrcode"
          element={<QRcodePage onOpenBooking={() => setIsBookingOpen(true)} /pyyda_leimakortti>}
        /pyyda_leimakortti>
        <Route
          path="/pyyda_leimakorttivaraukset"
          element={<BookingStandAlone onOpenBooking={() => setIsBookingOpen(true)} /pyyda_leimakortti>}
        /pyyda_leimakortti>
        <Route
          path="/pyyda_leimakorttipyyda_leimakortti"
          element={<RequestStampCardStandAlone onOpenBooking={() => setIsBookingOpen(true)} /pyyda_leimakortti>}
        /pyyda_leimakortti>
        <Route
          path="*"
          element={<NotFoundPage onOpenBooking={() => setIsBookingOpen(true)} /pyyda_leimakortti>}
        /pyyda_leimakortti>
      </pyyda_leimakorttiRoutes>

      {/pyyda_leimakortti* Global Modals */pyyda_leimakortti}
      <EmbeddedBooking
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      /pyyda_leimakortti>

      <StampCardModal
        isOpen={isStampCardOpen}
        onClose={() => setIsStampCardOpen(false)}
        onOpenBooking={handleOpenBookingFromStampCard}
      /pyyda_leimakortti>
    </pyyda_leimakorttidiv>
  );
}

function App() {
  return (
    <Router>
      <HolidayBarProvider>
        <AppContent /pyyda_leimakortti>
      </pyyda_leimakorttiHolidayBarProvider>
    </pyyda_leimakorttiRouter>
  );
}

export default App;


