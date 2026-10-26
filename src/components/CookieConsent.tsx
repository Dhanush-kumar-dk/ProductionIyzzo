import { useState, useEffect } from "react";
import { updateConsent } from "../utils/tracking";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("_consent_mode_v2");
    if (!stored) {
      // Small delay so it doesn't cause layout shift or interrupt immediate LCP
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    updateConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    updateConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-gray-200/80 text-gray-800 font-poppins transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
          <ShieldCheckIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-gray-900">
            Privacy & Ad Tracking Consent
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            We use cookies, Meta Pixel, and Google Ads analytics to measure marketing performance and personalize curated deal alerts. Review our{" "}
            <a href="/privacy" className="text-blue-600 underline font-medium hover:text-blue-800">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleAccept}
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          Accept All
        </button>
        <button
          onClick={handleDecline}
          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
