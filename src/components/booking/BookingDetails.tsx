import React, { useRef, useEffect, useState } from 'react'
import { BookingData } from './BookingFlow'

interface BookingDetailsProps {
  userDetails: {
    name: string
    phone: string
    email: string
    notes: string
  }
  onDetailsChange: (details: { name: string; phone: string; email: string; notes: string }) => void
  onDetailsValidityChange: (isValid: boolean) => void
  bookingData: BookingData
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  userDetails,
  onDetailsChange,
  onDetailsValidityChange,
  bookingData
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (field === 'name') setNameError(null)
    if (field === 'phone') setPhoneError(null)
    if (field === 'email') setEmailError(null)
    
    onDetailsChange({
      ...userDetails,
      [field]: value
    })
  }

  const validateName = (value: string) => {
    if (!value.trim()) {
      return 'Nimi on pakollinen'
    }
    if (value.trim().length < 2) {
      return 'Nimen tulee olla vähintään 2 merkkiä pitkä'
    }
    return null
  }

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      return 'Puhelinnumero on pakollinen'
    }
    const phonePattern = /^(\+358|0)[0-9]{8,9}$/
    if (!phonePattern.test(value.trim())) {
      return 'Syötä kelvollinen suomalainen puhelinnumero (esim. 0401234567 tai +358401234567)'
    }
    return null
  }

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Sähköpostiosoite on pakollinen'
    }
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
    if (!emailPattern.test(value.trim())) {
      return 'Syötä kelvollinen sähköpostiosoite (esim. nimi@email.com)'
    }
    return null
  }

  const handleBlur = (field: string, value: string) => {
    if (field === 'name') {
      setNameError(validateName(value))
    } else if (field === 'phone') {
      setPhoneError(validatePhone(value))
    } else if (field === 'email') {
      setEmailError(validateEmail(value))
    }
  }
  // Check form validity whenever userDetails change
  useEffect(() => {
    if (formRef.current) {
      const isValid = formRef.current.checkValidity() && 
                     !validateName(userDetails.name) && 
                     !validatePhone(userDetails.phone) && 
                     !validateEmail(userDetails.email)
      onDetailsValidityChange(isValid)
    }
  }, [userDetails, onDetailsValidityChange])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        
        <h3 className="text-xl sm:text-[16px] font-bold text-gray-900">Täytä yhteystiedot</h3>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <form ref={formRef}>
            <div>
              <label className="block text-base sm:text-[14px] font-bold text-gray-900 mb-3">
                Koko nimi *
              </label>
              <input
                type="text"
                value={userDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                className={`w-full p-3 sm:p-4 border-2 rounded-xl text-base sm:text-[14px] focus:border-orange-500 focus:outline-none transition-colors ${
                  nameError ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Syötä koko nimesi"
                required
                minLength={2}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-2">{nameError}</p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-[14px] font-bold text-gray-900 mb-3">
                Puhelin *
              </label>
              <input
                type="tel"
                value={userDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                className={`w-full p-3 sm:p-4 border-2 rounded-xl text-base sm:text-[14px] focus:border-orange-500 focus:outline-none transition-colors ${
                  phoneError ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Esim. 0401234567 tai +358401234567"
                required
                pattern="^(\+358|0)[0-9]{8,9}$"
                inputMode="numeric"
                title="Syötä kelvollinen suomalainen puhelinnumero"
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-2">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-[14px] font-bold text-gray-900 mb-3">
                Email *
              </label>
              <input
                type="email"
                value={userDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                className={`w-full p-3 sm:p-4 border-2 rounded-xl text-base sm:text-[14px] focus:border-orange-500 focus:outline-none transition-colors ${
                  emailError ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="esimerkki@email.com"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Syötä kelvollinen sähköpostiosoite"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-[14px] font-bold text-gray-900 mb-3">
                Lisätiedot/erityistoiveet
              </label>
              <textarea
                value={userDetails.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-base sm:text-[14px] focus:border-orange-500 focus:outline-none transition-colors resize-none"
                placeholder="Kerro mahdollisista erityistoiveista tai lisätiedoista..."
              />
            </div>
          </form>

          <div className="bg-gray-100 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="newsletter"
                className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="newsletter" className="text-sm sm:text-[14px] text-gray-700">
                Liity sähköpostilistalle
              </label>
            </div>
            
            {/*     <div className="flex items-center space-x-3 mb-6">
              <input
                type="checkbox"
                id="sms"
                className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="sms" className="text-sm sm:text-[14px] text-gray-700">
                Liity tekstiviestilistalle
              </label>
            </div>*/}

            <div className="bg-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Vahvistamalla varauksen hyväksyt{' '}
                <a href="#" className="text-orange-500 underline">käyttöehdot</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-[14px] font-bold text-gray-900 mb-4 sm:mb-6">YHTEENVETO JA EHDOT</h3>
          
          <div className="text-center mb-8">
            <p className="text-sm sm:text-[14px] text-gray-600 mb-6">
              Pidätämme oikeuden veloittaa 50 % varauksen hinnasta, jos asiakas ei saavu paikalle tai peruuttaa ajan alle 24 tuntia ennen varattua aikaa.
            </p>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-500 font-bold">📅</span>
                </div>
              </div>
              <p className="text-base sm:text-[16px] text-gray-600 mb-2">Valittu aika</p>
              <p className="text-sm sm:text-[14px] font-bold">
                {bookingData.selectedDate && bookingData.selectedTime ? (
                  <>
                    {new Date(bookingData.selectedDate).toLocaleDateString('fi-FI', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'numeric'
                    })} klo {bookingData.selectedTime}
                  </>
                ) : (
                  'Odottaa aikavalintaa'
                )}
              </p>
              {bookingData.selectedService && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-base sm:text-[16px] text-gray-600 mb-1">Arvioitu kesto</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {bookingData.selectedService.duration_minutes + 
                      bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.duration_minutes, 0)} min
                  </p>
                  <p className="text-xs sm:text-[14px] text-gray-500 mt-1">
                    Tämä on palvelun enimmäiskesto. Todellinen kesto voi olla lyhyempi.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm sm:text-[14px] font-bold">Palvelu</span>
                <span className="text-sm sm:text-[14px] font-bold">Hinta</span>
              </div>
              
              {/* Main Service */}
              {bookingData.selectedService && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-[14px]">
                    {bookingData.selectedService.name}
                  </span>
                  <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                    {bookingData.selectedService.price}€
                  </span>
                </div>
              )}
              
              {/* Add-on Services */}
              {bookingData.selectedAddOns.map((addOn) => (
                <div key={addOn.id} className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-[14px] text-gray-600">
                    + {addOn.name}
                  </span>
                  <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                    {addOn.price}€
                  </span>
                </div>
              ))}
              
              {!bookingData.selectedService && (
                <div className="flex justify-between items-center mb-4">
                <span className="text-sm sm:text-[14px]">
                  Odottaa palveluvalintaa
                </span>
                <span className="text-orange-500 font-bold text-sm sm:text-[14px]">
                  Alkaen 25 €
                </span>
              </div>
              )}
              
              <hr className="mb-4" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-sm sm:text-[14px]">Yhteensä</span>
                <span className="text-sm sm:text-[14px]">
                  {bookingData.selectedService ? 
                    `${bookingData.selectedService.price + 
                      bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)}€` : 
                    'Alkaen 25 €'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>

  )
}

export default BookingDetails