import React, { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';

interface RequestStampCardFormProps {
  onSuccess?: () => void;
}

const RequestStampCardForm: React.FC<RequestStampCardFormProps> = ({ onSuccess }) => {
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [apiError, setApiError] = useState('');

  const handleSubmitRequest = async () => {
    setRequestError('');
    setApiError('');

    if (!requestName.trim() || !requestEmail.trim()) {
      setRequestError('Nimi ja sähköpostiosoite ovat pakollisia');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestEmail)) {
      setRequestError('Virheellinen sähköpostiosoite');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-stampcard-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: requestName.trim(),
          email: requestEmail.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status >= 500) {
          setApiError('Palvelinvirhe pyynnön lähettämisen aikana. Tarkista verkkoyhteytesi ja yritä uudelleen.');
        } else {
          setRequestError(result.error || 'Pyynnön lähettäminen epäonnistui. Yritä uudelleen.');
        }
        return;
      }

      setRequestSuccess(true);
      setRequestName('');
      setRequestEmail('');

      // Track stamp card request submission
      if (typeof gtag !== 'undefined') {
        gtag('event', 'stamp_card_request', {
          event_category: 'engagement',
          event_label: 'stamp_card_request_submitted',
          value: 1
        });
      }

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error submitting request:', error);
      setApiError('Odottamaton virhe pyynnön lähettämisen aikana. Tarkista verkkoyhteytesi ja yritä uudelleen.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleReset = () => {
    setRequestSuccess(false);
    setRequestError('');
    setApiError('');
    setRequestName('');
    setRequestEmail('');
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <h4 className="font-bold text-red-800 mb-1">Yhteysvirhe</h4>
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          </div>
          <button
            onClick={() => setApiError('')}
            className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            Sulje ilmoitus
          </button>
        </div>
      )}

      {!requestSuccess ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pyydä leimakortti here</h3>
            <p className="text-gray-600">
              Täytä tietosi ja otamme sinuun yhteyttä luodaksemme leimakortin
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="requestName" className="block text-sm font-medium text-gray-700 mb-2">
                Nimi *
              </label>
              <input
                id="requestName"
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="Syötä nimesi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                disabled={isSubmittingRequest}
              />
            </div>

            <div>
              <label htmlFor="requestEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Sähköpostiosoite *
              </label>
              <input
                id="requestEmail"
                type="email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitRequest();
                  }
                }}
                placeholder="Syötä sähköpostiosoitteesi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                disabled={isSubmittingRequest}
              />
            </div>

            {requestError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{requestError}</p>
              </div>
            )}

            <button
              onClick={handleSubmitRequest}
              disabled={isSubmittingRequest || !requestName.trim() || !requestEmail.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                isSubmittingRequest || !requestName.trim() || !requestEmail.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-black hover:bg-yellow-600'
              }`}
            >
              {isSubmittingRequest ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Lähetetään...
                </div>
              ) : (
                'Lähetä pyyntö'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pyyntö lähetetty!</h3>
          <p className="text-gray-600 mb-6">
            Kiitos! Olemme vastaanottaneet pyyntösi. Otamme sinuun yhteyttä pian luodaksemme leimakortin.
          </p>
          <button
            onClick={handleReset}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Lähetä uusi pyyntö
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestStampCardForm;
