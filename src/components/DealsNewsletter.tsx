import { useState } from "react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { metaEvents } from "../utils/tracking";

export default function DealsNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (cleanEmail) {
      metaEvents.subscribe("0.00", "INR", "0.00", { content_name: "Yearnit Weekly Product Digest" }, { email: cleanEmail });
      metaEvents.lead({ content_name: "Yearnit Weekly Product Digest", method: "newsletter" }, { email: cleanEmail });
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-10 font-poppins">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        {/* Background decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide text-amber-300">
            <span>📬 Editorial Newsletter</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Yearnit Weekly Product Digest
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            Get our latest hands-on buying guides, honest pros and cons, and carefully vetted tech recommendations delivered directly to your inbox. No spam, ever.
          </p>

          {subscribed ? (
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-white animate-fade-in max-w-md mx-auto">
              <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-semibold">
                Thank you! You're subscribed to the Yearnit Product Digest.
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 font-bold text-sm rounded-xl shadow-md transition transform hover:scale-105 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400">
            By subscribing, you agree to receive editorial newsletters from Yearnit. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
