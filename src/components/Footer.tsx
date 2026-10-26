import { ArrowUpIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#131921] text-gray-300 font-poppins pt-8 border-t border-gray-800">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-[#232F3E] hover:bg-[#2b3a4c] text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 border-b border-gray-700/50"
      >
        <ArrowUpIcon className="w-4 h-4" />
        <span>Back to top</span>
      </button>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Editorial Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-gray-950 font-black text-lg">
                Y
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                Yearnit
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Yearnit is an independent consumer guidance and product recommendation platform. We evaluate specifications, test build quality, and provide unbiased pros and cons across top electronics, audio, and home lifestyle products.
            </p>
            <div className="text-xs text-gray-400">
              <span className="text-white font-semibold">Contact:</span> support@yearnit.in
            </div>
            <p className="text-[11px] text-gray-400">
              Yearnit is strictly not directed at children under 13 years of age.
            </p>
          </div>

          {/* Column 2: Popular Categories & Guides */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Product Guides
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Consumer Electronics & Audio
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Mobiles, Smartwatches & Tech
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Home Essentials & Kitchen
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Laptops & Remote Work Gear
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-amber-400 transition">
                  Editorial Review Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Merchant Terms */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Consumer Transparency
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <span className="text-gray-300 font-medium">Direct Store Links:</span> All product purchases are completed safely directly on official partner stores.
              </li>
              <li>
                <span className="text-gray-300 font-medium">Order Fulfillment:</span> Verified retailers handle shipping, deliveries, warranties, and returns.
              </li>
              <li>
                <span className="text-gray-300 font-medium">Price Disclaimer:</span> Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability displayed on Amazon at the time of purchase will apply.
              </li>
            </ul>
          </div>

          {/* Column 4: Amazon Associates Statutory Disclosure */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Affiliate Disclosure
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-[11px] text-gray-300 leading-relaxed space-y-2">
              <p className="font-semibold text-amber-300">
                As an Amazon Associate I earn from qualifying purchases.
              </p>
              <p className="text-[10px] text-gray-400 leading-normal">
                Yearnit participates in the Amazon Associates Program, an affiliate advertising initiative designed to provide a means for websites to earn advertising fees by linking to Amazon.in and affiliated sites.
              </p>
              <p className="text-[10px] text-gray-400 leading-normal">
                <strong>Non-Affiliation Notice:</strong> Yearnit is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd. Amazon, the Amazon logo, and related marks are trademarks of Amazon.com, Inc. or its affiliates.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Yearnit (yearnit.in). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/privacy-policy" className="hover:text-gray-300 transition">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-300 transition">Terms of Service</a>
            <span>•</span>
            <a href="/about" className="hover:text-gray-300 transition">About Us</a>
            <span>•</span>
            <a href="/affiliate-disclosure" className="hover:text-gray-300 transition">Affiliate Disclosure</a>
            <span>•</span>
            <a href="/contact" className="hover:text-gray-300 transition">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
