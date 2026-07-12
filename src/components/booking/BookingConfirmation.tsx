import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BookingData } from './BookingFlow';

interface BookingConfirmationProps {
  bookingData: BookingData;
  onConfirm: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleConfirmBooking = async () => {
    if (!bookingData.selectedService) return;

    setIsSubmitting(true);
    setSubmissionError(null); // Clear previous errors

    try {
      // Calculate total duration including add-ons
      const totalDuration =
        bookingData.selectedService.duration_minutes +
        bookingData.selectedAddOns.reduce(
          (sum, addOn) => sum + addOn.duration_minutes,
          0
        );

      // Calculate end_at_time
      const [hours, minutes] = bookingData.selectedTime.split(':').map(Number);
      const startTimeMinutes = hours * 60 + minutes;
      const endTimeMinutes = startTimeMinutes + totalDuration;
      const endHours = Math.floor(endTimeMinutes / 60);
      const endMins = endTimeMinutes % 60;
      const endAtTime = `${endHours.toString().padStart(2, '0')}:${endMins
        .toString()
        .padStart(2, '0')}`;

      // Create booking for main service
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_name: bookingData.userDetails.name,
            user_phone: bookingData.userDetails.phone,
            user_email: bookingData.userDetails.email,
            booking_date: bookingData.selectedDate,
            booking_time: bookingData.selectedTime,
            end_at_time: endAtTime,
            total_duration_minutes: totalDuration,
            notes: bookingData.userDetails.notes,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Create array of all services (main service + add-ons)
      const allServices = [bookingData.selectedService, ...bookingData.selectedAddOns];
      
      // Insert all services into booking_services table
      const bookingServicesData = allServices.map(service => ({
        booking_id: newBooking.id,
        service_id: service.id
      }));
      
      const { error: servicesError } = await supabase
        .from('booking_services')
        .insert(bookingServicesData);
      
      if (servicesError) throw servicesError;

      setIsSuccess(true);
      
      // Track successful booking completion
      if (typeof gtag !== 'undefined') {
        gtag('event', 'booking_completed', {
          event_category: 'booking',
          event_label: 'successful_booking',
          value: totalPrice,
          custom_parameters: {
            booking_id: newBooking.id.substring(0, 8),
            service_name: bookingData.selectedService.name,
            total_duration: totalDuration
          }
        });
      }
      
      // Send booking confirmation email to customer
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: newBooking.id,
            customerName: bookingData.userDetails.name,
            customerEmail: bookingData.userDetails.email,
            customerPhone: bookingData.userDetails.phone,
            bookingDate: bookingData.selectedDate,
            bookingTime: bookingData.selectedTime,
            endTime: endAtTime,
            totalDuration: totalDuration,
            services: allServices.map((service, index) => ({
              name: service.name,
              price: service.price,
              isMainService: index === 0 // First service is the main service
            })),
            totalPrice: bookingData.selectedService.price + 
              bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0),
            notes: bookingData.userDetails.notes || undefined
          }),
        });

        if (emailResponse.ok) {
          console.log('Booking confirmation email sent successfully');
        } else {
          console.error('Failed to send booking confirmation email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
        // Don't fail the booking process if email sending fails
      }
      
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Check if it's a network-related error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = error instanceof TypeError ||
                            errorMessage.includes('Failed to fetch') ||
                            errorMessage.includes('NetworkError') ||
                            errorMessage.includes('fetch') ||
                            !navigator.onLine;
      
      if (isNetworkError) {
        setSubmissionError('Varauksen vahvistaminen epäonnistui verkkoyhteyden vuoksi. Tarkista internetyhteytesi ja yritä uudelleen.');
      } else {
        setSubmissionError('Varauksen vahvistaminen epäonnistui. Tarkista tiedot ja yritä uudelleen. Jos ongelma jatkuu, ota yhteyttä asiakaspalveluun.');
        
        // Send error report email for server-side errors (not network errors)
        try {
          // Extract detailed error message
          let detailedErrorMessage = 'Unknown error occurred'
          
          if (error instanceof Error) {
            detailedErrorMessage = error.message
          } else if (error && typeof error === 'object') {
            // Handle Supabase errors and other object-based errors
            if ('message' in error && typeof error.message === 'string') {
              detailedErrorMessage = error.message
            } else if ('error' in error && typeof error.error === 'string') {
              detailedErrorMessage = error.error
            } else if ('details' in error && typeof error.details === 'string') {
              detailedErrorMessage = error.details
            } else if ('hint' in error && typeof error.hint === 'string') {
              detailedErrorMessage = `${error.message || 'Database error'}: ${error.hint}`
            } else {
              // Try to stringify the error object for debugging
              try {
                detailedErrorMessage = JSON.stringify(error, null, 2)
              } catch {
                detailedErrorMessage = `Error object could not be serialized: ${Object.prototype.toString.call(error)}`
              }
            }
          } else {
            detailedErrorMessage = String(error)
          }
          
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/report-booking-error`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              errorMessage: detailedErrorMessage,
              bookingData: JSON.stringify(bookingData),
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            }),
          }).catch(reportError => {
            // Don't let error reporting failure affect the user experience
            console.error('Failed to send error report:', reportError);
          });
        } catch (reportError) {
          // Don't let error reporting failure affect the user experience
          console.error('Failed to send error report:', reportError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl sm:text-[14px] font-bold text-gray-900 mb-4">
          Varaus vahvistettu!
        </h3>
        <p className="text-xl sm:text-[14px] text-gray-600 mb-8">
          Vahvistus on lähetetty sähköpostiisi.
        </p>
        <p className="text-gray-500">
          Tämä ikkuna sulkeutuu automaattisesti...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        { /*     <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Takaisin
        </button>*/}
        <h3 className="text-xl sm:text-[14px] font-bold text-gray-900">
          Vahvista varaus
        </h3>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
            <h4 className="text-lg sm:text-[14px] font-bold text-gray-900 mb-4 sm:mb-6">
              Varauksen tiedot
            </h4>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">
                    Päivämäärä
                  </p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.selectedDate
                      ? new Date(bookingData.selectedDate).toLocaleDateString(
                          'fi-FI',
                          {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : 'Ei valittu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">Aika</p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    klo {bookingData.selectedTime || 'Ei valittu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">Nimi</p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.userDetails.name || 'Ei annettu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">
                    Puhelin
                  </p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.userDetails.phone || 'Ei annettu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">
                    Sähköposti
                  </p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.userDetails.email || 'Ei annettu'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-base sm:text-[14px] font-semibold">
                    Arvioitu kesto
                  </p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.selectedService
                      ? `${
                          bookingData.selectedService.duration_minutes +
                          bookingData.selectedAddOns.reduce(
                            (sum, addOn) => sum + addOn.duration_minutes,
                            0
                          )
                        } min`
                      : 'Ei määritelty'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tämä on palvelun enimmäiskesto. Todellinen kesto voi olla
                    lyhyempi.
                  </p>
                </div>
              </div>

              {bookingData.userDetails.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-base sm:text-[14px] font-semibold mb-2">
                    Lisätiedot
                  </p>
                  <p className="text-sm sm:text-[14px] text-gray-600">
                    {bookingData.userDetails.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-[14px] font-bold text-gray-900 mb-4 sm:mb-6">
            YHTEENVETO JA EHDOT
          </h3>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6 mb-6">
            <p className="text-orange-800 font-semibold mb-2 text-sm sm:text-[14px]">
              Tärkeää!
            </p>
            <p className="text-orange-700 text-sm">
              Pidätämme oikeuden veloittaa 50 % varauksen hinnasta, jos asiakas
              ei saavu paikalle tai peruuttaa ajan alle 24 tuntia ennen varattua
              aikaa.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
              <p className="sm:text-[16px] text-[16px] text-gray-600 mb-2">
                {bookingData.selectedDate
                  ? new Date(bookingData.selectedDate).toLocaleDateString(
                      'fi-FI',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )
                  : 'Päivä ei valittu'}
                , klo {bookingData.selectedTime || 'Aika ei valittu'}
              </p>
              <p className="font-bold text-[14px] text-base sm:text-[14px]">
                Babylon Parturi, Turku
              </p>
              <p className="text-sm sm:text-[14px] text-gray-600">
                Humalistonkatu 7 A, 20100 Turku
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm sm:text-[14px] font-bold">Palvelu</span>
              <span className="text-sm sm:text-[14px] font-bold">Hinta</span>
            </div>

          {/* Submission Error Display */}
          {submissionError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Varauksen vahvistus epäonnistui</h4>
                  <p className="text-red-700 text-sm">{submissionError}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSubmissionError(null)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Sulje ilmoitus
                </button>
                <a
                  href="tel:+358407736334"
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors underline"
                >
                  Soita asiakaspalveluun
                </a>
              </div>
            </div>
          )}

            {/* Main Service */}
            {bookingData.selectedService && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-[14px]">
                  {bookingData.selectedService.name}
                </span>
                <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                  {bookingData.selectedService.price} €
                </span>
              </div>
            )}

            {/* Add-on Services */}
            {bookingData.selectedAddOns.map((addOn) => (
              <div
                key={addOn.id}
                className="flex justify-between items-center mb-2"
              >
                <span className="text-sm sm:text-[14px] text-gray-600">
                  + {addOn.name}
                </span>
                <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                  {addOn.price} €
                </span>
              </div>
            ))}

            {!bookingData.selectedService && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm sm:text-[14px]">Ei valittu</span>
                <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                  0 €
                </span>
              </div>
            )}

            <hr className="mb-4" />
            <div className="flex justify-between items-center font-bold text-base sm:text-[14px]">
              <span className="text-sm sm:text-[14px]">Yhteensä</span>
              <span className="text-sm sm:text-[14px]">
                {bookingData.selectedService
                  ? `${
                      bookingData.selectedService.price +
                      bookingData.selectedAddOns.reduce(
                        (sum, addOn) => sum + addOn.price,
                        0
                      )
                    } €`
                  : '0 €'}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="w-full bg-gray-800 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-[14px] font-bold hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'VAHVISTETAAN VARAUS...' : 'VAHVISTA VARAUS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
