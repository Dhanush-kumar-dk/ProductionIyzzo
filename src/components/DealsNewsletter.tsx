import { useState } from "react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function DealsNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-10 font-poppins">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide text-yellow-300">
            <span>🔔 Instant Deal Alerts</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Never Miss An Amazon Price Drop
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Get curated morning deals on trending electronics, seasonal fashion, and limited-time coupons straight to your inbox. No spam, ever.
          </p>

          {subscribed ? (
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-white animate-fade-in max-w-md mx-auto">
              <CheckCircleIcon className="w-6 h-6 text-emerald-300" />
              <span className="text-sm font-semibold">
                You're all set! Watch your inbox for top deals.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
            >
              <div className="relative flex-1">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 font-bold text-sm rounded-xl shadow-md transition transform hover:scale-105 active:scale-95"
              >
                Get Alerts
              </button>
            </form>
          )}

          <p className="text-[11px] text-blue-200">
            By subscribing, you agree to receive price alert emails. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
