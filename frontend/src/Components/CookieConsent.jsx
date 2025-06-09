// src/components/CookieConsent.jsx
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [userConsent, setUserConsent] = useState(null); // 'accepted' or 'declined'

  useEffect(() => {
    const consentStatus = localStorage.getItem('cookieConsent');
    if (consentStatus) {
      setUserConsent(consentStatus);
      if (consentStatus === 'accepted') {
        loadTrackingScripts();
      }
    } else {
      // Show the modal if no consent has been recorded
      setIsVisible(true);
    }
  }, []);

  const loadTrackingScripts = () => {
    // Load Google Analytics
    if (!document.querySelector('script[src*="googletagmanager.com"]')) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-SKNEMBN5EP";
      document.head.appendChild(gaScript);

      gaScript.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SKNEMBN5EP');
      };
    }

    // Load Google AdSense
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const adsScript = document.createElement('script');
      adsScript.async = true;
      adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7943531569653927";
      adsScript.crossOrigin = "anonymous"; // Important for AdSense
      document.head.appendChild(adsScript);
    }
  };

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setUserConsent('accepted');
    setIsVisible(false);
    loadTrackingScripts(); // Load scripts if accepted
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setUserConsent('declined');
    setIsVisible(false);
    // No scripts loaded if declined
  };

  if (!isVisible) return null; // Don't render anything if not visible

  return (
    <div
      id="cookie-consent-modal"
      tabIndex="-1"
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 overflow-y-auto overflow-x-hidden"
    >
      <div className="relative w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-xl dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cookie Consent
            </h3>
            {/* No close button on cookie consent as users must make a choice */}
          </div>
          {/* Modal body */}
          <div className="p-4 md:p-5 space-y-4">
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-400">
              We use cookies to improve your experience on our site, analyze site usage, and serve personalized ads. By clicking "Accept", you consent to our use of cookies. You can learn more in our <a href="/privacy-policy" className="text-emerald-600 hover:underline">Privacy Policy</a>.
            </p>
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-400">
              Your choices here help us understand how our site is used and enhance your experience. We value your privacy.
            </p>
          </div>
          {/* Modal footer */}
          <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              onClick={handleAccept}
              type="button"
              className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
            >
              Accept All Cookies
            </button>
            <button
              onClick={handleDecline}
              type="button"
              className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-emerald-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;