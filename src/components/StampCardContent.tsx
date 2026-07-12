import React, { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, LogOut, Mail, Phone, MapPin, Clock, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface StampCardContentProps {
  onOpenBooking?: () => void;
  onReset?: () => void;
  showContactInfo?: boolean;
  onStampCardDataLoaded?: (stampCard: StampCard | null) => void;
}

const StampCardContent: React.FC<StampCardContentProps> = ({ 
  onOpenBooking, 
  onReset,
  showContactInfo = false,
  onStampCardDataLoaded
}) => {
  // Cache constants
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const CACHE_IDENTIFIER_KEY = 'stampcard_identifier';
  const CACHE_TIMESTAMP_KEY = 'stampcard_timestamp';
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [stampCardData, setStampCardData] = useState<StampCard | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInputForm, setShowInputForm] = useState(true);
  const [isEmailInputMode, setIsEmailInputMode] = useState(true);
  const [isVerificationCodeInputMode, setIsVerificationCodeInputMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [isCodeVerifying, setIsCodeVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isRequestMode, setIsRequestMode] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const totalStamps = 10; // Total stamps needed for free service

  const handleCopyCode = async () => {
    try {
      if (stampCardData) {
        await navigator.clipboard.writeText(stampCardData.referral_code);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLookup = async (identifierToUse?: string) => {
    setErrorMessage(''); // Clear previous errors
    setApiError(''); // Clear API errors
    const identifier = identifierToUse || inputIdentifier.trim();

    if (!identifier) {
      setErrorMessage('Antamallasi sähköpostiosoitteella tai suosittelukoodilla ei löytynyt leimakorttia');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Make the query case-insensitive and handle potential null values
      const { data, error } = await supabase
        .from('stamp_cards')
        .select('*')
        .or(`email.ilike.${identifier},referral_code.ilike.${identifier}`);

      if (error) {
        // Check if it's a network/server error vs a query error
        if (error.code && (error.code === 'PGRST301' || error.code === 'PGRST116')) {
          // These are "not found" type errors, treat as no results
          setErrorMessage('Antamallasi sähköpostiosoitteella tai suosittelukoodilla ei löytynyt leimakorttia. Tarkista syöttämäsi tiedot ja yritä uudelleen.');
        } else {
          // Network or server error
          setApiError('Palvelimella tapahtui virhe leimakorttia haettaessa. Tarkista verkkoyhteytesi ja yritä uudelleen.');
        }
        // Clear cache on failed lookup
        localStorage.removeItem(CACHE_IDENTIFIER_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      } else if (!data || data.length === 0) {
        setErrorMessage('Antamallasi sähköpostiosoitteella tai suosittelukoodilla ei löytynyt leimakorttia. Tarkista syöttämäsi tiedot ja yritä uudelleen.');
        // Clear cache on failed lookup
        localStorage.removeItem(CACHE_IDENTIFIER_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      } else {
        setStampCardData(data[0]);
        setShowInputForm(false);
        // Notify parent component about the loaded stamp card data
        if (onStampCardDataLoaded) {
          onStampCardDataLoaded(data[0]);
        }
        // Cache the successful identifier and timestamp
        localStorage.setItem(CACHE_IDENTIFIER_KEY, identifier);
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Error looking up stamp card:', error);
      setApiError('Palvelimella tapahtui odottamaton virhe leimakorttia haettaessa. Tarkista verkkoyhteytesi ja yritä uudelleen.');
      // Clear cache on error
      localStorage.removeItem(CACHE_IDENTIFIER_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = async () => {
    setErrorMessage(''); // Clear previous errors
    const identifier = inputIdentifier.trim();

    if (!identifier) {
      setErrorMessage('Antamallasi sähköpostiosoitteella tai suosittelukoodilla ei löytynyt leimakorttia');
      return;
    }

    // Check if identifier is an email
    if (identifier.includes('@')) {
      await handleEmailVerification(identifier);
      return;
    }

    // Otherwise, it's a referral code - proceed with direct lookup
    await handleLookup(identifier);
  };

  const handleEmailVerification = async (email: string) => {
    setErrorMessage(''); // Clear previous errors
    setApiError(''); // Clear API errors
    setIsCodeSending(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-stampcard-verification-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status >= 500) {
          // Server error
          setApiError('Vahvistuskoodin lähettäminen epäonnistui palvelimella. Tarkista verkkoyhteytesi ja yritä uudelleen.');
        } else {
          // Client error (400-499)
          setErrorMessage(result.error || 'Vahvistuskoodin lähettäminen epäonnistui. Tarkista sähköpostiosoitteesi ja verkkoyhteytesi.');
        }
        return;
      }

      // Success - move to verification code input
      setEmailForVerification(email);
      setIsEmailInputMode(false);
      setIsVerificationCodeInputMode(true);
      setErrorMessage('');
      
    } catch (error) {
      console.error('Error sending verification code:', error); // Log the actual error for debugging
      setApiError('Vahvistuskoodin lähettäminen epäonnistui odottamattoman virheen vuoksi. Tarkista verkkoyhteytesi ja yritä uudelleen.');
    } finally {
      setIsCodeSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerificationError(''); // Clear previous errors
    setApiError(''); // Clear API errors
    if (!verificationCode.trim()) {
      setVerificationError('Syötä vahvistuskoodi');
      return;
    }

    setIsCodeVerifying(true);
    setVerificationError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-stampcard-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userEmail: emailForVerification, 
          verificationCode: verificationCode.trim() 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status >= 500) {
          // Server error
          setApiError('Vahvistuskoodin vahvistaminen epäonnistui palvelimella. Tarkista verkkoyhteytesi ja yritä uudelleen.');
        } else {
          // Client error (400-499)
          setVerificationError(result.error || 'Virheellinen tai vanhentunut vahvistuskoodi. Pyydä uusi koodi tai tarkista syöttämäsi tiedot.');
        }
        return;
      }

      // Success - now fetch the actual stamp card data
      setIsVerificationCodeInputMode(false);
      await handleLookup(emailForVerification);
      
      
    } catch (error) {
      console.error('Error verifying code:', error); // Log the actual error for debugging
      setApiError('Vahvistuskoodin vahvistaminen epäonnistui odottamattoman virheen vuoksi. Tarkista verkkoyhteytesi ja yritä uudelleen.');
    } finally {
      setIsCodeVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setVerificationError('');
    await handleEmailVerification(emailForVerification);
  };

  const handleSubmitRequest = async () => {
    setRequestError('');

    // Validate input
    if (!requestName.trim() || !requestEmail.trim()) {
      setRequestError('Nimi ja sähköpostiosoite ovat pakollisia');
      return;
    }

    // Validate email format
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

      // Send confirmation email — fire and forget
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-stampcard-accepted`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: requestName.trim(),
          email: requestEmail.trim()
        }),
      }).catch((err) => console.error('Failed to send stampcard accepted email:', err));

      // Success
      setRequestSuccess(true);
      setRequestName('');
      setRequestEmail('');

      // Track stamp card request submission
      if (typeof gtag !== 'undefined') {
        gtag('event', 'stamp_card_request', {
          event_category: 'engagement',
          event_label: 'stamp_card_request_modal',
          value: 1
        });
      }

    } catch (error) {
      console.error('Error submitting request:', error);
      setApiError('Odottamaton virhe pyynnön lähettämisen aikana. Tarkista verkkoyhteytesi ja yritä uudelleen.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleOpenRequestForm = () => {
    setIsRequestMode(true);
    setErrorMessage('');
    setRequestSuccess(false);
    setRequestError('');
    setRequestName('');
    setRequestEmail('');
  };

  const handleBackFromRequest = () => {
    setIsRequestMode(false);
    setRequestSuccess(false);
    setRequestError('');
    setRequestName('');
    setRequestEmail('');
  };

  const resetToInitialState = () => {
    setInputIdentifier('');
    setStampCardData(null);
    setShowInputForm(true);
    setErrorMessage('');
    setApiError('');
    setIsEmailInputMode(true);
    setIsVerificationCodeInputMode(false);
    setVerificationCode('');
    setEmailForVerification('');
    setIsCodeSending(false);
    setIsCodeVerifying(false);
    setVerificationError('');
    setIsRequestMode(false);
    setRequestName('');
    setRequestEmail('');
    setRequestSuccess(false);
    setRequestError('');
  };

  const handleLogout = () => {
    // Clear cache
    localStorage.removeItem(CACHE_IDENTIFIER_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    
    // Notify parent component that stamp card data is cleared
    if (onStampCardDataLoaded) {
      onStampCardDataLoaded(null);
    }
    
    // Reset component state
    resetToInitialState();
    setCopiedCode(false);
    
    // Call onReset if provided
    if (onReset) {
      onReset();
    }
  };

  // Check for cached identifier when component mounts
  useEffect(() => {
    const cachedIdentifier = localStorage.getItem(CACHE_IDENTIFIER_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cachedIdentifier && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();
      
      // Check if cache is still valid (within 24 hours)
      if (now - timestamp < CACHE_DURATION) {
        // For cached identifiers, proceed with direct lookup (already verified)
        setInputIdentifier(cachedIdentifier);
        setShowInputForm(false);
        handleLookup(cachedIdentifier); // This will trigger onStampCardDataLoaded when data is fetched
        return;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_IDENTIFIER_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
    
    // No valid cache found, reset to initial state
    resetToInitialState();
    
    // Notify parent that no stamp card is loaded
    if (onStampCardDataLoaded) {
      onStampCardDataLoaded(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Global API Error Display */}
      {apiError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
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

      {showInputForm ? (
        /* Input Form */
        <div className="max-w-md mx-auto">
          {!isRequestMode && (
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Käytä leimakorttiasi</h3>
              <p className="text-gray-600">Syötä sähköpostiosoitteesi tai suosittelukoodisi nähdäksesi leimakorttisi tiedot</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            {isEmailInputMode && !isRequestMode && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                    Sähköposti tai suosittelukoodi
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    value={inputIdentifier}
                    onChange={(e) => setInputIdentifier(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInitialSubmit();
                      }
                    }}
                    placeholder="Syötä sähköpostiosoitteesi tai suosittelukoodisi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors"
                    disabled={isLoading || isCodeSending}
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </div>
                )}

                <button
                  onClick={handleInitialSubmit}
                  disabled={isLoading || isCodeSending || !inputIdentifier.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isLoading || isCodeSending || !inputIdentifier.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-black hover:bg-yellow-600'
                  }`}
                >
                  {isLoading || isCodeSending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isCodeSending ? 'Lähetetään koodia...' : 'Ladataan...'}
                    </div>
                  ) : (
                    'Avaa leimakortti'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    onClick={handleOpenRequestForm}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors underline"
                  >
                    Eikö sinulla ole leimakorttia? Pyydä täältä
                  </button>
                </div>
              </div>
            )}

            {isRequestMode && (
              <div className="space-y-4">
                {!requestSuccess ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <UserPlus className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Pyydä leimakortti</h4>
                      <p className="text-gray-600 text-sm">
                        Täytä tietosi ja otamme sinuun yhteyttä luodaksemme leimakortin
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm text-center mb-2">
                        Haluatko tietää lisää leimakortista ennen pyyntöä?
                      </p>
                      <a
                        href="/pyyda_leimakortti"
                        className="block text-center text-blue-600 hover:text-blue-700 font-medium text-sm underline transition-colors"
                      >
                        Lue lisää leimakortista ja sen eduista →
                      </a>
                    </div>

                    <div>
                      <label htmlFor="requestName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nimi
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
                        Sähköpostiosoite
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
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Lähetetään...
                        </div>
                      ) : (
                        'Lähetä pyyntö'
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        onClick={handleBackFromRequest}
                        className="text-gray-500 hover:text-gray-600 text-sm transition-colors"
                      >
                        ← Takaisin
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Pyyntö lähetetty!</h4>
                    <p className="text-gray-600 mb-6">
                      Kiitos! Olemme vastaanottaneet pyyntösi. Otamme sinuun yhteyttä pian luodaksemme leimakortin.
                    </p>
                    <button
                      onClick={handleBackFromRequest}
                      className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                      Sulje
                    </button>
                  </div>
                )}
              </div>
            )}

            {isVerificationCodeInputMode && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Tarkista sähköpostisi</h4>
                  <p className="text-gray-600 text-sm">
                    Lähetimme 6-numeroisen vahvistuskoodin osoitteeseen:
                  </p>
                  <p className="font-medium text-gray-900">{emailForVerification}</p>
                </div>

                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Vahvistuskoodi
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleVerifyCode();
                      }
                    }}
                    placeholder="Syötä 6-numeroinen koodi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-center text-lg font-mono"
                    disabled={isCodeVerifying}
                    maxLength={6}
                  />
                </div>

                {verificationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{verificationError}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={isCodeVerifying || !verificationCode.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isCodeVerifying || !verificationCode.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-black hover:bg-yellow-600'
                  }`}
                >
                  {isCodeVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Vahvistetaan...
                    </div>
                  ) : (
                    'Vahvista koodi'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={isCodeSending}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isCodeSending ? 'Lähetetään...' : 'Lähetä koodi uudelleen'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsVerificationCodeInputMode(false);
                      setIsEmailInputMode(true);
                      setVerificationCode('');
                      setVerificationError('');
                      setEmailForVerification('');
                    }}
                    className="text-gray-500 hover:text-gray-600 text-sm transition-colors"
                  >
                    ← Takaisin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stamp Card Display */
        <>
          {/* Logout Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-yellow-600 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Kirjaudu ulos
            </button>
          </div>

          {/* Stamp Card Section */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Gift className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Leimakorttisi</h3>
                  <p className="text-gray-600">Kerää 10 leimaa ja saat ilmaisen hiustenleikkauksen!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-3xl font-bold text-yellow-600">
                  {stampCardData?.stamps || 0}/{totalStamps}
                </div>
                <div className="text-sm text-gray-600">leimaa</div>
              </div>
            </div>

            {/* Stamp Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4">
              {Array.from({ length: totalStamps }, (_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-xs sm:text-sm font-bold ${
                    index < (stampCardData?.stamps || 0)
                      ? 'bg-yellow-500 border-yellow-500 text-white'
                      : index === totalStamps - 1
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index < (stampCardData?.stamps || 0) ? (
                    <Check className="w-6 h-6" />
                  ) : index === totalStamps - 1 ? (
                    <span className="text-xs lg:text-sm leading-tight">FREE</span>
                  ) : (
                    index + 1
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Vielä {totalStamps - (stampCardData?.stamps || 0)} leimaa</strong> ilmaiseen hiustenleikkaukseen! 
                Saat leiman jokaisen hiustenleikkauksen yhteydessä.
              </p>
            </div>
          </div>

          {/* Referral Program Section */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Suosittele ystävää - Saat palkkion!</h3>
                <p className="text-gray-600">Jaa koodisi ja saatte molemmat 5€ alennuksen</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-4">
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Sinun koodisi</h4>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600 mb-2 break-all">
                    {stampCardData?.referral_code || ''}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      copiedCode
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-black hover:bg-yellow-600'
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Kopioitu!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Kopioi koodi
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-bold text-gray-900 mb-2">Näin se toimii:</h5>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. <strong>Ystävä näyttää kuvan koodista</strong> - hän saa 5€ alennusta</p>
                  <p>2. <strong>Sinä saat 5€ alennusta</strong> ensi käynnistä</p>
                  <p>3. Molemmat hyödytte!</p>
                </div>
              </div>
            </div>

            {/* Available Discount Display */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">€</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Käytettävissä oleva alennus</h4>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {(stampCardData?.referral_count || 0) * 5}€
                </div>
                <p className="text-sm text-gray-600">
                  Voit käyttää tämän alennuksen seuraavassa hiustenleikkauksessasi
                </p>
              </div>
            </div>

            {(stampCardData?.referral_count || 0) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">
                    Olet suositellut meitä {stampCardData?.referral_count} ystävälle! Kiitos! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information - Only show if showContactInfo is true */}
          {showContactInfo && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-6 h-6 mr-2 text-orange-500" />
                  Yhteystiedot
                </h3>
                <div className="space-y-3">
                  <a href="tel:+358456131884" className="flex items-center text-gray-700 hover:text-yellow-600 transition-colors">
                    <Phone className="w-4 h-4 mr-3 text-yellow-500" />
                    +358 45 6131884
                  </a>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-3 text-yellow-500" />
                    <div>
                      <div>Humalistonkatu 7 A</div>
                      <div className="text-sm text-gray-500">Turku 20100</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-yellow-500" />
                  Aukioloajat
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Maanantai - Perjantai</span>
                    <span className="font-medium">10:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lauantai</span>
                    <span className="font-medium">10:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunnuntai</span>
                    <span className="font-medium text-red-500">Suljettu</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {onOpenBooking && (
            <div className="bg-yellow-500 text-black rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Valmis seuraavaan käyntiin?</h3>
              <p className="mb-4 opacity-90">Varaa aikasi helposti verkossa tai tervetuloa myös ilman ajanvarausta.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className="bg-black text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-gray-900 transition-colors"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'booking_intent', {
                        event_category: 'booking',
                        event_label: 'stamp_card_book_button',
                        value: 1
                      });
                    }
                    if (onOpenBooking) onOpenBooking();
                  }}
                >
                  Varaa aika
                </button>
                <a
                  href="tel:+358407736334"
                  className="border-2 border-black px-6 py-3 rounded-lg font-bold hover:bg-black hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'phone_call', {
                        event_category: 'contact',
                        event_label: 'stamp_card_phone_click',
                        value: 1
                      });
                    }
                  }}
                >
                  Soita nyt
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StampCardContent;
