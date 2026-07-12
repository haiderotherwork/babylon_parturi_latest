import React, { useState } from 'react';
import { X } from 'lucide-react';
import StampCardContent from './StampCardContent';

interface StampCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

const StampCardModal: React.FC<StampCardModalProps> = ({ isOpen, onClose, onOpenBooking }) => {
  const [contentKey, setContentKey] = useState(0);
  const [userStampCardName, setUserStampCardName] = useState<string | null>(null);

  const handleStampCardDataLoaded = (stampCard: StampCard | null) => {
    if (stampCard && stampCard.name) {
      setUserStampCardName(stampCard.name);
    } else {
      setUserStampCardName(null);
    }
  };

  // Add interface for StampCard type
  interface StampCard {
    id: string;
    email: string | null;
    name: string | null;
    referral_code: string;
    stamps: number;
    referral_count: number;
    created_at: string;
    updated_at: string;
  }

  const handleClose = () => {
    setUserStampCardName(null); // Reset user name when modal closes
    setContentKey(prev => prev + 1); // Reset content component
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl h-full sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 rounded-t-lg sm:rounded-t-2xl">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">
                {userStampCardName ? userStampCardName.charAt(0).toUpperCase() : 'B'}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {userStampCardName ? `${userStampCardName}` : 'Leimakortti'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Kanta-asiakasohjelma</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <StampCardContent 
            key={contentKey}
            onOpenBooking={onOpenBooking}
            showContactInfo={true}
            onStampCardDataLoaded={handleStampCardDataLoaded}
          />
        </div>
      </div>
    </div>
  );
};

export default StampCardModal;