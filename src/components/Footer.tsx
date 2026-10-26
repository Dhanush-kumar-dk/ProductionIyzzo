import Logo from "../assets/Tile-Logo.png";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#131921] text-gray-300 font-poppins pt-8">
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
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={Logo}
                alt="Iyzzo"
                className="h-8 w-auto brightness-110 object-contain"
              />
              <span className="text-xl font-bold text-white tracking-wide">
                Iyzzo
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Iyzzo is your premier Amazon Deals Discovery platform. We handpick and verify top-rated products with the steepest price drops across electronics, fashion, and home lifestyle.
            </p>
            <div className="text-xs text-gray-400">
              <span className="text-white font-semibold">Support:</span> support@iyzzo.com
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Top Categories
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Consumer Electronics
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Smart Wearables & Audio
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Men & Women Fashion
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Home Appliances & Kitchen
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:text-amber-400 transition">
                  Lightning Deals & Coupons
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Transparency */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Customer Trust
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <span className="text-gray-300 font-medium">Genuine Amazon Links:</span> All product purchases are completed safely directly on Amazon's official platform.
              </li>
              <li>
                <span className="text-gray-300 font-medium">Customer Support:</span> Amazon handles all fulfillment, delivery, customer care, and returns.
              </li>
              <li>
                <span className="text-gray-300 font-medium">Price Accuracy:</span> Deals and prices are updated regularly based on Amazon marketplace catalog.
              </li>
            </ul>
          </div>

          {/* Column 4: Affiliate Disclosure */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
              Amazon Disclosure
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-gray-400 leading-relaxed">
              <p>
                <strong className="text-amber-300">Affiliate Disclaimer:</strong> Iyzzo is a participant in the Amazon Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in / Amazon.com.
              </p>
              <p className="mt-2 text-[10px] text-gray-500">
                Product prices and availability are accurate as of the date/time indicated and are subject to change.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Iyzzo. All rights reserved. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Affiliate Transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
