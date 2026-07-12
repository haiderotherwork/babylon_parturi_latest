import React, { useState, useEffect } from 'react';
import { Clock, Phone, MapPin, Loader2 } from 'lucide-react';
import {
  PiInstagramLogo,
  PiTiktokLogo,
  PiFacebookLogo,
  PiWhatsappLogo,
} from 'react-icons/pi';
import { supabase } from '../lib/supabase';

interface Holiday {
  id: string;
  date: string;
  name: string | null;
}

interface HoursContactSectionProps {
  onOpenBooking?: () => void;
  customCtaContent?: React.ReactNode;
}

const HoursContactSection: React.FC<HoursContactSectionProps> = ({ onOpenBooking, customCtaContent }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setHolidaysLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 10);
        const todayStr = today.toISOString().split('T')[0];
        const twoWeeksStr = twoWeeksLater.toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', todayStr)
          .lte('date', twoWeeksStr)
          .order('date', { ascending: true });
        if (error) {
          console.error('Error fetching holidays:', error);
          setHolidays([]);
        } else {
          setHolidays(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching holidays:', error);
        setHolidays([]);
      } finally {
        setHolidaysLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-black text-white border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
              YHTEYSTIEDOT
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 px-4">
              OTA YHTEYTTÄ
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-8 px-4">
              Ei aikaa varattu? Ei hätää – tule käymään tai varaa heti!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <div className="bg-gray-900 border border-gray-800 p-6 sm:p-8 hover:border-yellow-500 transition-all duration-300">
              <div className="flex items-center mb-4 sm:mb-6">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-yellow-500 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">AUKIOLOAJAT</h3>
              </div>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-300">
                <div className="flex justify-between">
                  <span>MA - PE</span>
                  <span className="font-bold text-yellow-500">10-19</span>
                </div>
                <div className="flex justify-between">
                  <span>LA</span>
                  <span className="font-bold text-yellow-500">10-19</span>
                </div>
                <div className="flex justify-between">
                  <span>SU</span>
                  <span className="font-bold text-red-500">SULJETTU</span>
                </div>
              </div>

              {holidaysLoading ? (
                <div className="flex items-center justify-center pt-4">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Ladataan...</span>
                </div>
              ) : holidays.length > 0 ? (
                <div className="pt-6 border-t border-white/30">
                  <h4 className="text-lg font-bold mb-3 text-yellow-200">LOMAT & SULJETUT PÄIVÄT</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="text-sm bg-white/10 rounded p-3 border border-white/20">
                        <div className="font-semibold text-white">{formatDateDisplay(holiday.date)}</div>
                        {holiday.name && (
                          <div className="text-white/90 mt-1">{holiday.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 sm:p-8 hover:border-yellow-500 transition-all duration-300">
              <div className="flex items-center mb-4 sm:mb-6">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-yellow-500 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">YHTEYSTIEDOT</h3>
              </div>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-300">
                <a
                  href="tel:+358456131884"
                  className="flex items-center hover:text-yellow-500 transition-colors break-all"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'phone_call', {
                        event_category: 'contact',
                        event_label: 'header_phone_click',
                        value: 1
                      });
                    }
                  }}
                >
                  <Phone className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0" />
                  +358 45 6131884
                </a>
                <a
                  href="https://maps.app.goo.gl/RzSo3E8EEqZUhemL7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start hover:text-yellow-500 transition-colors"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'whatsapp_click', {
                        event_category: 'contact',
                        event_label: 'whatsapp_contact',
                        value: 1
                      });
                    }
                  }}
                >
                  <MapPin className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-1" />
                  <span className="break-words">Humalistonkatu 7 A, Turku 20100</span>
                </a>
                <div className="flex items-center space-x-4 pt-4">
                  <a
                    href="https://www.instagram.com/babylon_parturi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-500 transition-colors text-yellow-500"
                    title="Instagram"
                  >
                    <PiInstagramLogo className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@babylonparturi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-500 transition-colors text-yellow-500"
                    title="TikTok"
                  >
                    <PiTiktokLogo className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.facebook.com/p/Babylon-Parturi-SA-100085768275512/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-500 transition-colors text-yellow-500"
                    title="Facebook"
                  >
                    <PiFacebookLogo className="w-6 h-6" />
                  </a>
                  <a
                    href="https://wa.me/358456131884?text=Hei%2C%20haluaisin%20tiedustella%20palveluistanne%20ja%20ajanvarauksesta.%20Voisitteko%20auttaa%20minua%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-500 transition-colors text-yellow-500"
                    title="WhatsApp"
                  >
                    <PiWhatsappLogo className="w-6 h-6" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm opacity-75">
                  LÖYDÄT MEIDÄT SOMESTA: @BABYLON_PARTURI
                </p>
              </div>
            </div>
          </div>

          <div className={`text-center ${customCtaContent ? 'mt-6' : 'mt-8 sm:mt-12'} px-4`}>
            {customCtaContent ? (
              customCtaContent
            ) : onOpenBooking ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <button
                  className="bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl font-bold hover:bg-yellow-400 transition-all duration-300 w-full sm:w-auto"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'booking_intent', {
                        event_category: 'booking',
                        event_label: 'contact_section_book_button',
                        value: 1
                      });
                    }
                    if (onOpenBooking) onOpenBooking();
                  }}
                >
                  VARAA AIKA NYT
                </button>
                <a
                  href="tel:+358456131884"
                  className="border-2 border-yellow-500 text-yellow-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl font-bold hover:bg-yellow-500 hover:text-black transition-all duration-300 w-full sm:w-auto text-center"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'phone_call', {
                        event_category: 'contact',
                        event_label: 'contact_section_phone_click',
                        value: 1
                      });
                    }
                  }}
                >
                  TAI SOITA
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HoursContactSection;