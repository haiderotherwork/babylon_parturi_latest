import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import HoursContactSection from '../components/HoursContactSection';
// import StampCardContent from '../components/StampCardContent';
// import Footer from '../components/Footer';

const QRcodePage: React.FC = () => {
  return (
    <div>
      {/* Header - Commented out */}
      {/*<header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Takaisin etusivulle</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <img
                src="/logo_only_k.png"
                alt="K-Parturi Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">K-PARTURI</h1>
                <p className="text-sm text-gray-600">Kokkola</p>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main>
        {/* Hours & Contact Section */}
        <HoursContactSection 
          customCtaContent={
            <Link
              to="/"
              className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-xl text-xl font-bold hover:bg-orange-50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              TAKAISIN ETUSIVULLE
            </Link>
          }
        />

        {/* Commented out sections */}
        {/*
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={onOpenBooking}
            className="bg-white text-orange-600 px-8 py-4 rounded-xl text-xl font-bold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            VARAA AIKA
          </button>
          <a
            href="tel:+358407736334"
            className="border-2 border-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300"
          >
            SOITA NYT
          </a>
        </div>
        */}

        {/* Stamp Card Section */}
        {/*
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                  LEIMAKORTTI
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Kerää leimoja ja saat ilmaisen hiustenleikkauksen! 
                  Syötä sähköpostiosoitteesi tai suosittelukoodisi nähdäksesi leimakorttisi tiedot.
                </p> 
                </div>
  
              <StampCardContent 
                onOpenBooking={onOpenBooking}
                showContactInfo={false}
              />
            
            </div>
          </div>

        </section>
          */}
      </main>

      {/* Footer - Commented out */}
      {/* <Footer /> */}
    </div>
  );
};

export default QRcodePage;