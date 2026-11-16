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
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* One Rounded 28px Panel Split 50/50 */}
      <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden border border-[#E3E8E2] grid grid-cols-1 md:grid-cols-2 shadow-subtle">
        {/* Left Half: Sage Gray with Envelope Icon */}
        <div className="bg-[#E6EAE5] p-8 sm:p-12 md:p-14 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="w-12 h-12 rounded-full bg-white border border-[#CBD3CB] flex items-center justify-center text-[#4F6F5D] mb-4 shadow-subtle">
              <EnvelopeIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#4F6F5D] block mb-2">
              Every Thursday
            </span>
            <h3 className="font-serif font-normal text-2xl sm:text-3xl text-[#1E2A24] leading-snug">
              Curated digests delivered to your inbox.
            </h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-4">
            Zero sponsored spam. Only verified benchmarks, price drops, and buyer insights.
          </p>
        </div>

        {/* Right Half: Mint with Serif Title & Subscribe Form */}
        <div className="bg-[#D7EBDF] p-8 sm:p-12 md:p-14 flex flex-col justify-center">
          <h3 className="font-serif font-normal text-2xl sm:text-3xl text-[#1E2A24] leading-snug mb-3">
            Yearnit Weekly Product Digest
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#3F4A44] leading-relaxed mb-6">
            Get our latest hardware teardowns, lab comparisons, and genuine Amazon price drop alerts once a week.
          </p>

          {subscribed ? (
            <div className="bg-white/80 border border-[#CBD3CB] p-4 rounded-[12px] flex items-center gap-2.5 text-[#1E2A24] animate-fade-in">
              <CheckCircleIcon className="w-5 h-5 text-[#2F7D52] flex-shrink-0" />
              <span className="text-xs font-medium">
                Thank you! You’re subscribed to the Yearnit Weekly Digest.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 bg-white border border-[#CBD3CB] rounded-[10px] text-xs sm:text-sm text-[#1E2A24] placeholder-[#7B857F] focus:outline-none focus:ring-2 focus:ring-[#5E7F6C]/30 focus:border-[#4F6F5D] transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4F6F5D] text-white text-xs sm:text-sm font-medium rounded-[10px] hover:bg-[#5E7F6C] transition shadow-subtle flex-shrink-0"
                >
                  Subscribe
                </button>
              </div>
              <p className="font-sans text-[11px] text-[#7B857F]">
                No spam, ever. Unsubscribe anytime with 1 click.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
