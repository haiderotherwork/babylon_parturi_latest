import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Grid2x2 as Grid, SlidersHorizontal } from 'lucide-react';
import HoursContactSection from '../components/HoursContactSection';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';

interface HomePageProps {
  onOpenBooking: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenBooking }) => {
  const [activeServiceTab, setActiveServiceTab] = useState<'hair' | 'beard'>('hair');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);


    const [showSliderView, setShowSliderView] = useState(true);
  const [isAutoSlidingPaused] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    const reviewDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInDays < 7) {
      return diffInDays === 0 ? 'tänään' : diffInDays === 1 ? '1 pv sitten' : `${diffInDays} pv sitten`;
    } else if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 vk sitten' : `${diffInWeeks} vk sitten`;
    } else {
      return diffInMonths === 1 ? '1 kk sitten' : `${diffInMonths} kk sitten`;
    }
  };



    // Google icon component using uploaded image
  const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <img
      src="/google__g__logo.svg.png"
      alt="Google"
      className={className}
    />
  );

  // Function to toggle between grid and slider view
  const toggleReviewView = () => {
    setShowSliderView(!showSliderView);
  };

  // Navigation functions for review slider
  const handlePreviousReview = () => {
    setCurrentReviewIndex((prevIndex) =>
      prevIndex === 0 ? googleReviews.length - 1 : prevIndex - 1
    );
  };

  const handleNextReview = () => {
    setCurrentReviewIndex((prevIndex) =>
      prevIndex === googleReviews.length - 1 ? 0 : prevIndex + 1
    );
  };

 // Real Static Google Reviews data 
  const googleReviews = [
    {
      id: 1,
      name: 'Camilla Johansson',
      rating: 5,
      text: 'Todella miellyttävä hyvä palvelu ja ekstra päälle ❤️pojalta varmistettiin hyvin, minkälaisen mallin haluaa ja leikkauksen aikana kysyttiin lapsen mielipidettä, minusta on hienoa huomiota ja kertoo kokemusta lasten hiusten leikkauksesta. Palvelu oli otettiin huomioon monella tapaa. Hiukset ovat perfecto ja kokemus perfecto',
      date: '2025-09-25T12:34:56.789Z',
      imageUrl: '/customer_images/customer_1.png'
    },
    {
      id: 2,
      name: 'Jose Apolinario',
      rating: 5,
      text: 'Good service. Friendly and relaxed environment',
      date: "2025-12-25T12:34:56.789Z",
      imageUrl: null
    },
    {
      id: 3,
      name: 'Oscar Tibiyea',
      rating: 5,
      text: "Tosi hyvää palvelua ja osaamista. Myös kiharat hiukset osataan leikata ongelmitta! Toiminta on nopeaa, mutta laadukasta",
      date: "2025-10-25T12:34:56.789Z",
      imageUrl: '/customer_images/customer_2.png'
    },
    {
      id: 4,
      name: 'Kevin D',
      rating: 5,
      text: "I've been a customer of this barbershop for many years and was never disappointed. The owner and his staff are top notch, very professional. Today I got a perfect cut and beard trim by Aymen, with very friendly and careful service on top. Thanks a lot! Pricing is also extremely reasonable for the quality of service so I warmly recommend this place!",
      date: "2024-01-25T12:34:56.789Z",
      imageUrl: null
    },
    {
      id: 5,
      name: 'Lauri Erlamo',
      rating: 5,
      text: "Pääsin ilman ajanvarausta suoraan hiustenleikkuuseen. Palvelu oli nopeaa, ja parturi-kampaaja löysi minun pääni muotoihin sopivan kampauksen taidokkaasti. Olen työn jälkeen erittäin tyytyväinen. Kampaaja oli niin ystävällinen, että auttoi minua ottamaan itsestäni uuden kampauksen kanssa kuvan päivitettävää profiilikuvaani varten kampaamon edustalla.",
      date: "2025-07-25T12:34:56.789Z",
      imageUrl: null
    },
    {
      id: 6,
      name: 'Aija Kivisaari-Martínez',
      rating: 5,
      text: "Oikein miellyttävä, asiantunteva ja edullinen hiustenleikkuukokemus. Ulkosesti paikka on varsin maskuliinen mutta hienosti onnistui myös naisten hiuksien käsittely. Kommunikointi hyvin helppoa, maksu onnistui kortilla (huomasin että joskus aiemmin ilmeisesti ei, nyt onnistuu). Lämmin suositus!",
      date: "2025-09-25T12:34:56.789Z",
      imageUrl: null
    },
  ];

  
  
  // Auto-slide functionality for reviews
  useEffect(() => {
    if (!showSliderView || isAutoSlidingPaused) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) =>
        prevIndex === googleReviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [showSliderView, isAutoSlidingPaused, googleReviews.length]);


  return (
    <>
      {/* Hero Section - Video with Logo Only */}
      <section className="bg-black text-white h-[70vh] md:h-[75vh] flex items-center justify-center relative overflow-hidden">
        {/* Placeholder Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(/placeholder.jpg)',
            opacity: (!videoLoaded || videoError) ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        />

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/placeholder.jpg"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            setVideoError(true);
            setVideoLoaded(false);
          }}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{
            opacity: videoLoaded && !videoError ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <source
            src="/hero-video.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        {/* Centered Logo */}
        <div className="relative z-30 px-4">
          <img
            src="/babylon_parturi_logo_transparent.png"
            alt="Babylon Parturi Logo"
            className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] object-contain filter drop-shadow-2xl animate-fade-in"
          />
        </div>
      </section>

      {/* Welcome Section - Content Below Video */}
      <section className="bg-gray-900 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-yellow-500 text-black px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8">
              PREMIUM BARBERSHOP
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight">
              BABYLON
              <span className="block text-yellow-500">PARTURI</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto px-2">
              Laatupalvelua koko perheelle – ammattitaitoista hiustenleikkausta ja parturipalveluja.
              Tervetuloa kokemaan premium-palvelua sydämessä Turkua.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-10 md:mb-12 px-4">
              <button
                className="bg-yellow-500 text-black px-8 sm:px-10 py-4 sm:py-5 rounded-lg text-base sm:text-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                onClick={() => {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'booking_intent', {
                      event_category: 'booking',
                      event_label: 'hero_book_button',
                      value: 1
                    });
                  }
                  onOpenBooking();
                }}
              >
                VARAA AIKA
              </button>
              <a
                href="tel:+358456131884"
                className="border-2 border-yellow-500 text-yellow-500 px-8 sm:px-10 py-4 sm:py-5 rounded-lg text-base sm:text-lg font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300 w-full sm:w-auto"
                onClick={() => {
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_call', {
                      event_category: 'contact',
                      event_label: 'hero_phone_click',
                      value: 1
                    });
                  }
                }}
              >
                SOITA NYT
              </a>
            </div>

            {/* Special Offer */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/40 p-6 sm:p-8 rounded-lg max-w-2xl mx-auto">
              <div className="text-yellow-500 font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3">
                TARJOAMME MYÖS KOTIPALVELUA – VARAUS PUHELIMITSE
              </div>
              <div className="text-white text-sm sm:text-base md:text-lg">
                Ammattitaitoinen parturi palvelee sinua mukavasti omassa kodissasi.
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Google Reviews Section - Temporarily Hidden */}
      
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                ASIAKKAIDEN ARVOSTELUT
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Katso mitä asiakkaamme sanovat palvelustamme
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="flex space-x-1">{renderStars(5)}</div>
                <span className="text-2xl font-bold text-white">4.9</span>
                <GoogleIcon className="w-5 h-5" />
                <span className="text-white">Google-arvostelut</span>
              </div>
            </div>

            <div className="text-center mb-12">
              <button
                onClick={toggleReviewView}
                className="inline-flex items-center border border-yellow-500 text-yellow-500 px-6 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300"
              >
                {showSliderView ? (
                  <Grid className="w-4 h-4 mr-2" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                )}
                {showSliderView ? 'Näytä ruudukossa' : 'Näytä liukuna'}
              </button>
            </div>

            {showSliderView ? (
              // Slider View
              <div className="relative max-w-4xl mx-auto mb-12 overflow-hidden">
                <div className="bg-gray-50 rounded-2xl shadow-lg min-h-[200px] relative">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentReviewIndex * 100}%)`,
                    }}
                  >
                    {googleReviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="w-full flex-shrink-0 p-4 sm:p-8 flex items-center"
                      >
                        <div className="w-full px-2 sm:px-8 md:px-16">
                          <div className="flex items-center justify-center mb-6">
                            {review.imageUrl ? (
                              <img
                                src={review.imageUrl}
                                alt={review.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-3 sm:mr-6 flex-shrink-0 border-2 border-yellow-500"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-full flex items-center justify-center mr-3 sm:mr-6 flex-shrink-0">
                                <span className="text-white font-bold text-lg sm:text-2xl">
                                  {review.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="text-left min-w-0 flex-1">
                              <h4 className="font-bold text-gray-900 text-lg sm:text-xl mb-2">
                                {review.name}
                              </h4>
                              <div className="flex items-center justify-start space-x-2">
                                <div className="flex space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                                <GoogleIcon className="w-5 h-5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {getTimeAgo(review.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-center sm:text-left text-sm sm:text-base md:text-lg">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePreviousReview}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-20"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                  </button>

                  <button
                    onClick={handleNextReview}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-20"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                  </button>
                </div>

                
                <div className="flex justify-center space-x-2 mt-6">
                  {googleReviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentReviewIndex(index);
                        setIsAutoSlidingPaused(true);
                        setTimeout(() => setIsAutoSlidingPaused(false), 10000);
                      }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        index === currentReviewIndex
                          ? 'bg-yellow-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Grid View (Original)
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {googleReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-4 space-x-3">
                      {review.imageUrl ? (
                        <img
                          src={review.imageUrl}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-yellow-500"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {review.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900">
                          {review.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <GoogleIcon className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <a
                href="https://share.google/e7MABCWkS9qBBcD5W"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-yellow-500 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="bg-white rounded-lg p-1 mr-3 flex-shrink-0">
                  <GoogleIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                </div>
                LUE LISÄÄ GOOGLE-ARVOSTELUJA
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-900 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                PALVELUMME
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 px-4">
                PREMIUM PARTURIPALVELUT
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
                Tarjoamme laadukkaita hiustenleikkauksia ja parturipalveluja
                ammattitaitoisesti ja henkilökohtaisella palvelulla.
              </p>
            </div>

            <div className="sticky top-0 z-40 bg-gray-900 py-4 mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b-2 border-gray-800">
              <div className="flex justify-center gap-2 sm:gap-3 max-w-6xl mx-auto">
                <button
                  onClick={() => setActiveServiceTab('hair')}
                  className={`flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 whitespace-nowrap ${
                    activeServiceTab === 'hair'
                      ? 'bg-yellow-500 text-black shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  HIUSPALVELUT
                </button>
                <button
                  onClick={() => setActiveServiceTab('beard')}
                  className={`flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 whitespace-nowrap ${
                    activeServiceTab === 'beard'
                      ? 'bg-yellow-500 text-black shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  PARTAPALVELUT
                </button>
              </div>
            </div>

            {activeServiceTab === 'hair' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                <ServiceCard
                  title="Parturileikkaus"
                  description="Klassinen parturileikkaus ammattitaitoisesti toteutettuna."
                  price="25€"
                  icon="/scissor.svg"
                  iconSize={12}
                />
                <ServiceCard
                  title="Hiustenleikkaus ja Parta"
                  description="Hiustenleikkaus ja parran siistiminen samassa käynnissä."
                  price="40€"
                  icon="/hair-style.svg"
                  iconSize={18}
                />
                <ServiceCard
                  title="Lasten Hiustenleikkaus"
                  description="Erikoisesti alle 10 vuotiaille lapsille suunnattu hiustenleikkaus turvallisessa ympäristössä."
                  price="20€"
                  icon="/kid_haircut.svg"
                />
                <ServiceCard
                  title="Koneajo"
                  description="Hiusten ajo koneella, koko  
pää samalla pituudella."
                  price="15€"
                  icon="/hair_clipper.svg"
                />
                <ServiceCard
                  title="Opiskelijan Hiustenleikkaus"
                  description="Erityinen opiskelijahinnoitelu ammattitaitoisesta palvelusta."
                  price="20€"
                  icon="/student.svg"
                />
                <ServiceCard
                  title="Babylon VIP Paketii"
                  description="Kaikki mitä tarvitset edulliseen hintaan: Hiustenleikkaus, Hiusten pesu, Parranleikkaus, Hiusten muotoilu, Karvanpoisto langalla, Korvien karvojen poisto, Kulmien muotoilu."
                  price="50€"
                  icon="/crown.svg"
                />
                <ServiceCard
                  title="Lahjakortti"
                  description="Lahjakortti hiustenleikkaus ja parran siistimiseen."
                  price="50€"
                  icon="/gift-card.svg"
                />
              </div>
            )}

            {activeServiceTab === 'beard' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                <ServiceCard
                  title="Viikisien Muotoilu"
                  description="Viikisien muotoilu koneella ammattitaitoisesti."
                  price="10€"
                  icon="/mustache.svg"
                />
                <ServiceCard
                  title="Amerikkalainen Parranajo"
                  description="Sisältää pyyhehatueen, parranajoin veitsellä ja kasvohieronnan."
                  price="18€"
                  icon="/shaving_with_blade .svg"
                />
                <ServiceCard
                  title="Parran ja Viikisien Muotoilu"
                  description="Parran ja viikisien muotoilu koneella samassa käynnissä."
                  price="18€"
                  icons={["/mustache.svg", "/beard-trimming.svg"]}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                GALLERIA
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 px-4">
                TYÖT PUHUVAT PUOLESTAAN
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">
                Katso esimerkkejä ammattitaitoisista hiustenleikkauksistamme
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => {
                const galleryImages = [
                  '/babylon-parturi-haircut-1.jpg',
                  '/babylon-parturi-haircut-2.jpg',
                  '/babylon-parturi-haircut-3.jpg',
                  '/babylon-parturi-haircut-4.jpg',
                  '/babylon-parturi-haircut-5.jpg',
                  '/babylon-parturi-haircut-6.jpg',
                  '/babylon-parturi-haircut-7.jpg',
                  '/babylon-parturi-haircut-8.jpg',
                ];
                const altTexts = [
                  'Ammattitaitoinen miesten hiustenleikkaus Turku - Babylon Parturi',
                  'Parturipalvelut ja parran ajo Turku - Babylon Parturi',
                  'Miesten kampaamopalvelut Turku - Babylon Parturi',
                  'Trendikkäät miesten hiustyylit Turku - Babylon Parturi',
                  'Lasten hiustenleikkaus Turku - Babylon Parturi',
                  'Erikoishiustenleikkaukset Turku - Babylon Parturi',
                  'Parran trimaus ja muotoilu Turku - Babylon Parturi',
                  'Hiustenleikkaus koko perheelle Turku - Babylon Parturi',
                ];
                const imagePath = galleryImages[item - 1];
                const altText = altTexts[item - 1];

                return (
                  <div key={item} className="group relative overflow-hidden">
                    <div className="aspect-square bg-gray-800 overflow-hidden">
                      <img
                        src={imagePath}
                        alt={altText}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-yellow-500 text-xl">+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:mt-12 px-4">
              <a
                href="https://www.instagram.com/babylon_parturi/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                KATSO LISÄÄ TÖITÄMME
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                  MEISTÄ
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
                  AMMATTITAITOA JA LAATUA
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 mb-6 leading-relaxed">
                  Babylon on koko perheen parturi-kampaamo Turussa joka tarjoaa ajankohtaisimmat trendit hiusmuotoilussa ja hiusten hoidossa. Poikkeamme kampaamojen valtavirrasta siten, että käytämme aina mahdollisimman hajusteettomia ja allergisoimattomia tuotteita palveluissamme. Tarjoamme modernia hiusmuotoilua ja kauneudenalan erikoisosaamista miehille, naisille, lapsille ja opiskeljialle.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-yellow-400 transition-all duration-300 w-full sm:w-auto"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'booking_intent', {
                          event_category: 'booking',
                          event_label: 'about_section_book_button',
                          value: 1
                        });
                      }
                      onOpenBooking();
                    }}
                  >
                    VARAA AIKA
                  </button>
                  <a
                    href="tel:+358456131884"
                    className="border-2 border-yellow-500 text-yellow-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300 w-full sm:w-auto text-center"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'phone_call', {
                          event_category: 'contact',
                          event_label: 'about_section_phone_click',
                          value: 1
                        });
                      }
                    }}
                  >
                    SOITA NYT
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="bg-yellow-500/10 p-6 sm:p-8 border border-yellow-500/30">
                  <img
                    src="/babylon_parturi_logo.jpeg"
                    alt="Babylon Parturi"
                    className="w-full max-w-md mx-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Contact Section */}
      <HoursContactSection onOpenBooking={onOpenBooking} />

      {/* Map Section */}
      <section className="bg-gray-900 py-0">
        <div className="w-full h-64 sm:h-80 md:h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3935.286395855919!2d22.25654791312494!3d60.4511056206244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x468c76f8d0315555%3A0x3600f41d0832a95c!2sBABYLON%20PARTURI!5e0!3m2!1sen!2sfi!4v1766332723435!5m2!1sen!2sfi"
            width="100%"
            height="100%"
            style={{border:0}}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Babylon Parturi Location"
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <img
                src="/babylon_parturi_logo_transparent.png"
                alt="Babylon Parturi Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto object-contain opacity-80"
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2025 BABYLON PARTURI. Kaikki oikeudet pidätetään.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;