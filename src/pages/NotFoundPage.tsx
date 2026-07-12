import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Scissors, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

interface NotFoundPageProps {
  onOpenBooking: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onOpenBooking }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 opacity-20 blur-3xl rounded-full"></div>
              <Scissors className="w-24 h-24 text-yellow-500 relative animate-pulse" />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-8xl font-bold text-white mb-2">404</h1>
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Sivua ei löytynyt</h2>
            </div>
          </div>

          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Oho! Näyttää siltä, että olet eksyksissä. Etsimäsi sivu ei valitettavasti ole olemassa tai se on siirretty toiseen paikkaan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Home className="w-5 h-5 text-white" />
              Palaa etusivulle
            </button>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 bg-gray-900 text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Calendar className="w-5 h-5 text-white" />
              Varaa aika
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-600 max-w-lg mx-auto">
            <img src="/scissor.svg" alt="" className="w-12 h-12 mx-auto opacity-30 brightness-200 invert" />
            <img src="/comb.svg" alt="" className="w-12 h-12 mx-auto opacity-30 brightness-200 invert" />
            <img src="/razor.svg" alt="" className="w-12 h-12 mx-auto opacity-30 brightness-200 invert" />
            <img src="/hair_clipper.svg" alt="" className="w-12 h-12 mx-auto opacity-30 brightness-200 invert" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
