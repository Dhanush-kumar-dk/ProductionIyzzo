import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  BoltIcon,
  TruckIcon,
  BellAlertIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { trackEvent, generateEventId } from "../utils/tracking";
import { getAttribution } from "../utils/attribution";
import { API_BASE_URL } from "../config/api";

export default function AdLandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preference: "All Deals",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Set landing page meta title and description
    document.title = "Verified Buyer Guides & Product Recommendations | Yearnit";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Save up to 70% on verified electronics, gadgets, and lifestyle essentials. Get instant price drop alerts sent directly to WhatsApp and email."
      );
    }

    // Fire ViewContent on landing page load with unique eventId
    trackEvent("ViewContent", {
      content_name: "Ad Landing Page - Price Drops",
      content_category: "Paid Ads",
      page_type: "landing_page",
    });
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById("lead-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone && !formData.email) {
      setErrorMsg("Please provide at least a phone number or email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const eventId = generateEventId();
    const attribution = getAttribution();

    // 1. Fire Browser Lead Event (Meta Pixel + Google Ads Conversion)
    trackEvent(
      "Lead",
      {
        content_name: "Deal Alerts VIP Subscription",
        currency: "INR",
        value: 50.0,
        deal_preference: formData.preference,
      },
      eventId,
      {
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
      }
    );

    // 2. Submit Lead to Backend with Attribution
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        preference: formData.preference,
        eventId,
        ...attribution,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE_URL}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn("Backend lead store responded non-200");
      }
    } catch (err) {
      console.warn("Network notice on lead dispatch:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0B111A] to-slate-950 text-white font-poppins selection:bg-amber-400 selection:text-gray-950">
      {/* Stripped-Down Minimal Header (No distraction links or exit paths) */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/20">
              Y
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Yearnit<span className="text-amber-400">.</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2,410+ Live Deals Today</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <BoltIcon className="w-4 h-4 text-amber-400" />
            <span>Exclusive Flash Price Drops • India 🇮🇳</span>
          </div>

          {/* Ad Promise Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Never Overpay Again.{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 bg-clip-text text-transparent">
              Save Up to 70%
            </span>{" "}
            on Top Verified Deals.
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join over <strong>15,000+ smart shoppers</strong> receiving daily handpicked price cuts, coupon glitches, and lightning deals delivered instantly to WhatsApp & Email.
          </p>

          {/* Quick Stats / Social Proof Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              <span className="font-semibold text-white">4.9/5 Rating</span>
            </div>
            <span>•</span>
            <span className="text-gray-300">100% Free Forever</span>
            <span>•</span>
            <span className="text-gray-300">Zero Spam Guarantee</span>
          </div>

          {/* Lead Capture Form (Above the Fold) */}
          <div id="lead-form-section" className="max-w-lg mx-auto pt-6">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-left relative">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Limited Free Access
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    You're on the VIP Deal List!
                  </h3>
                  <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed">
                    Welcome! We have registered your details. You will receive today's steepest verified price cuts directly on your preferred channel.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("Contact", { method: "whatsapp_community_click" })}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
                    >
                      <span>Join WhatsApp VIP Deals Channel</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center pb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Get Instant Price Drop Alerts
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Fill out 3 quick fields to start saving money today.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@gmail.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="deal-preference" className="block text-xs font-semibold text-gray-300 mb-1">
                      Primary Deals of Interest
                    </label>
                    <select
                      id="deal-preference"
                      name="preference"
                      aria-label="Primary Deals of Interest"
                      value={formData.preference}
                      onChange={(e) => setFormData({ ...formData, preference: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    >
                      <option value="All Deals">All Trending Price Cuts</option>
                      <option value="Electronics & Mobile">Mobiles, Audio & Tech</option>
                      <option value="Smart Wearables">Smartwatches & Accessories</option>
                      <option value="Home & Kitchen">Home Appliances & Lifestyle</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Activating Free Alerts...</span>
                    ) : (
                      <>
                        <span>Get Free VIP Deal Alerts</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                    <LockClosedIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your privacy is protected. No spam. One-click unsubscribe.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Benefit Points */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-slate-950/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why 15,000+ Shoppers Rely on Yearnit
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
              Our automated crawlers track thousands of live listings 24/7 to catch legitimate price drops before they sell out.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-amber-400/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <BoltIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Flash Alerts</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive notifications within seconds of a price drop or coupon drop going live.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-blue-400/40 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">100% Verified Deals</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Zero fake discounts or jacked-up prices. Every deal is verified against historic pricing trends.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-emerald-400/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TruckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Express Delivery</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                All curated items are eligible for fast, secure delivery and buyer protection from authorized sellers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-purple-400/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BellAlertIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Spam Promise</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                We only send top-tier, high-value alerts. Unsubscribe or pause notifications anytime with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Real Savings by Real Shoppers
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Trusted across India for unbiased e-commerce price intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "Saved ₹4,200 on Sony wireless headphones thanks to their morning WhatsApp alert. Snapped it up within 10 minutes before the deal ended!"
              </p>
              <div className="text-xs font-bold text-white pt-2 border-t border-white/10">
                — Vikram S., Bangalore
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "No fake discount codes or outdated links. The price tracker caught a genuine 60% drop on kitchen appliances. Highly recommended."
              </p>
              <div className="text-xs font-bold text-white pt-2 border-t border-white/10">
                — Ananya M., Mumbai
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                "Their alerts on festival price drops helped me buy an iPhone and a smart speaker at rock-bottom prices. The alerts are fast and 100% free."
              </p>
              <div className="text-xs font-bold text-white pt-2 border-t border-white/10">
                — Karthik R., Chennai
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA Below the Fold */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Ready to Catch Today's Best Discounts?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Get started right now. Zero fees, instant setup, and guaranteed verified deals delivered right to your pocket.
          </p>
          <div className="pt-2">
            <button
              onClick={scrollToForm}
              className="py-4 px-8 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 transition transform hover:scale-105 active:scale-95 inline-flex items-center gap-2"
            >
              <span>Get Free VIP Deal Alerts</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Compliance Footer (Required for Meta and Google Ads Approval & Amazon Associates) */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 px-4 sm:px-8 text-xs text-gray-500 font-poppins">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Yearnit</span>
              <span>•</span>
              <span>Independent Consumer Guidance</span>
            </div>

            {/* Mandatory Compliance Links */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <a href="/privacy-policy" className="hover:text-gray-300 transition underline">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-gray-300 transition underline">
                Terms
              </a>
              <span>•</span>
              <a href="/about" className="hover:text-gray-300 transition underline">
                About
              </a>
              <span>•</span>
              <a href="/affiliate-disclosure" className="hover:text-gray-300 transition underline">
                Affiliate Disclosure
              </a>
              <span>•</span>
              <a href="/contact" className="hover:text-gray-300 transition underline">
                Contact
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-gray-400 leading-relaxed text-center sm:text-left space-y-2">
            <p className="font-semibold text-amber-300">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
            <p>
              <strong>Non-Affiliation Notice:</strong> Yearnit is an independent review platform. Yearnit is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
            </p>
            <p>
              Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product. Yearnit is strictly not directed at children under 13 years of age.
            </p>
            <p className="text-gray-500">
              © {new Date().getFullYear()} Yearnit (yearnit.in). All rights reserved. Registered in India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
