import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import ServiceSelection from './ServiceSelection';
import TimeSelection from './TimeSelection';
import BookingDetails from './BookingDetails';
import BookingConfirmation from './BookingConfirmation';
import { Service } from '../../lib/supabase';

export interface BookingData {
  selectedService: Service | null;
  selectedAddOns: Service[];
  selectedDate: string;
  selectedTime: string;
  userDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
}
interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  openedFromStampCard?: boolean;
  CustomButton?: () => JSX.Element;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  isOpen,
  onClose = () => {},
  CustomButton = null,

}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isDetailsFormValid, setIsDetailsFormValid] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const steps = [
    { number: 1, title: 'Palvelu', subtitle: 'Valitse palvelut' },
    { number: 2, title: 'Aika', subtitle: 'Valitse aika' },
    { number: 3, title: 'Tiedot', subtitle: 'Täytä tiedot' },
    { number: 4, title: 'Valmis', subtitle: 'Vahvista aika' },
  ];

  // Scroll to top when step changes
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedAddOns([]); // Clear all add-ons when main service changes
  };

  const handleAddOnToggle = (addOn: Service) => {
    //console.log('handleAddOnToggle called with:', addOn.name);
    //console.log('Current selectedAddOns before update:', selectedAddOns);

    setSelectedAddOns((prev) => {
      const isCurrentlySelected = prev.some((item) => item.id === addOn.id);
      //console.log('Is currently selected:', isCurrentlySelected);

      if (isCurrentlySelected) {
        // Remove the add-on
        const updated = prev.filter((item) => item.id !== addOn.id);
        //console.log('Removing add-on, new array:', updated);
        return updated;
      } else {
        // Add the add-on, but first handle mutual exclusivity
        let filteredPrev = prev;

        // For hair and beard add-ons, remove any existing add-ons of the same type
        if (addOn.add_on_type === 'hair_add_on') {
          filteredPrev = prev.filter(
            (item) => item.add_on_type !== 'hair_add_on'
          );
          //console.log(
        //    'Removing existing hair add-ons, filtered array:',
           // filteredPrev
          //);
        } else if (addOn.add_on_type === 'beard_add_on') {
          //filteredPrev = prev.filter(
           // (item) => item.add_on_type !== 'beard_add_on'
          //);
         // console.log(
          //  'Removing existing beard add-ons, filtered array:',
          //  filteredPrev
          //);
        }
        // For general_add_on and kid_add_on, no mutual exclusivity needed

        const updated = [...filteredPrev, addOn];
        //console.log('Adding add-on, new array:', updated);
        return updated;
      }
    });
  };
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDetailsChange = (details: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) => {
    setUserDetails(details);
  };

  const handleDetailsValidityChange = (isValid: boolean) => {
    setIsDetailsFormValid(isValid);
  };
  const handleConfirmBooking = () => {
    // Reset form and close modal
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedAddOns([]);
    setSelectedDate('');
    setSelectedTime('');
    setUserDetails({ name: '', phone: '', email: '', notes: '' });
    onClose();
  };

  const bookingData: BookingData = {
    selectedService,
    selectedAddOns,
    selectedDate,
    selectedTime,
    userDetails,
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full sm:max-w-[1120px] h-full sm:h-[90vh] flex flex-col relative">
        {/* Header with close button */}
        <div className="flex justify-between items-center px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Ajan varaus
          </h2>
          {CustomButton ? <CustomButton/> :<button
            onClick={onClose}
            className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
          }
        </div>

        {/* Step indicator - Desktop */}
        <div className="hidden sm:block  border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            {steps.map((step) => (
              <React.Fragment key={step.number}>
                <div
                  className={`flex-1 py-4 text-center ${
                    step.number === currentStep
                      ? 'bg-yellow-500 text-black'
                      : step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 opacity-50'
                  } transition-colors duration-300`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      step.number === currentStep
                        ? 'bg-black text-yellow-500'
                        : step.number < currentStep
                        ? 'bg-white text-green-500'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-lg font-bold">{step.number}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-base">{step.title}</div>
                    <div className="text-xs">{step.subtitle}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step indicator - Mobile Carousel */}
        <div className="block sm:hidden py-2 border-b border-gray-200 overflow-hidden relative px-4">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-x-4"
            style={{ transform: `translateX(-${(currentStep - 1) * 80}%)` }}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex-shrink-0 w-[80%] py-2 relative ${
                  step.number === currentStep
                    ? 'bg-yellow-500 text-black'
                    : step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 opacity-50'
                } transition-colors duration-300`}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.number === currentStep
                        ? 'bg-black text-yellow-500'
                        : step.number < currentStep
                        ? 'bg-white text-green-500'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-lg font-bold">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    <div className="font-bold text-base">{step.title}</div>
                    <div className="text-xs">{step.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content with fixed footer space */}
        <div
          ref={modalContentRef}
          className="p-4 sm:p-6 overflow-y-auto flex-1 modal-content"
        >
          {currentStep === 1 && (
            <ServiceSelection
              onServiceSelect={handleServiceSelect}
              onAddOnToggle={handleAddOnToggle}
              onNext={handleNext}
              selectedService={selectedService}
              selectedAddOns={selectedAddOns}
            />
          )}
          {currentStep === 2 && (
            <TimeSelection
              bookingData={bookingData}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <BookingDetails
              userDetails={userDetails}
              onDetailsChange={handleDetailsChange}
              onDetailsValidityChange={handleDetailsValidityChange}
              onNext={handleNext}
              onBack={handleBack}
              selectedService={selectedService}
              selectedAddOns={selectedAddOns}
              bookingData={bookingData}
            />
          )}
          {currentStep === 4 && (
            <BookingConfirmation
              bookingData={bookingData}
              onConfirm={handleConfirmBooking}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Navigation footer */}
        <div className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg sm:rounded-b-2xl">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Takaisin
          </button>

          <div className="text-sm text-gray-600">
            Vaihe {currentStep} / {steps.length}
          </div>

          {currentStep < 4 && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedService) ||
                (currentStep === 2 && (!selectedDate || !selectedTime)) ||
                (currentStep === 3 && !isDetailsFormValid)
              }
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                (currentStep === 1 && !selectedService) ||
                (currentStep === 2 && (!selectedDate || !selectedTime)) ||
                (currentStep === 3 && !isDetailsFormValid)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 text-black hover:bg-yellow-600'
              }`}
            >
              Seuraava
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
