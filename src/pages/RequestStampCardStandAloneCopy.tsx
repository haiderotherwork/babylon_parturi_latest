import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Star, Users, Award } from 'lucide-react';
import RequestStampCardForm from '../components/RequestStampCardForm';
import Footer from '../components/Footer';

const RequestStampCardStandAloneCopy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Takaisin etusivulle</span>
          </button>
        </div>
      </div>

      <div className="flex-grow px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-xl">
                  <Gift className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Liity kanta-asiakasohjelmaamme
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Hanki leimakortti ja aloita keräämään etuja jokaisesta käynnistä!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Ilmainen leikkaus</h3>
                <p className="text-sm text-gray-600">
                  Kerää 10 leimaa ja saat seuraavan hiustenleikkauksen ilmaiseksi
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Suosittele ystävää</h3>
                <p className="text-sm text-gray-600">
                  Jaa koodisi ja saatte molemmat 5€ alennuksen
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Helppo seuranta</h3>
                <p className="text-sm text-gray-600">
                  Seuraa leimakorttisi tilaa ja etujasi helposti verkossa
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <RequestStampCardForm />
          </div>

          <div className="text-center mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-400 max-w-lg mx-auto opacity-50">
              <img src="/scissor.svg" alt="" className="w-12 h-12 mx-auto" />
              <img src="/comb.svg" alt="" className="w-12 h-12 mx-auto" />
              <img src="/razor.svg" alt="" className="w-12 h-12 mx-auto" />
              <img src="/hair_clipper.svg" alt="" className="w-12 h-12 mx-auto" />
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-8 text-center shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Onko sinulla jo leimakortti?</h3>
            <p className="mb-6 opacity-90 text-lg">
              Kirjaudu sisään ja katso leimakorttisi tila!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors inline-block"
            >
              Avaa leimakortti
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RequestStampCardStandAloneCopy;
