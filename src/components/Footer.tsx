export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full font-poppins text-gray-300">
      {/* 1. Amazon-style Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full py-4 bg-[#37475A] hover:bg-[#485769] text-white text-xs sm:text-sm font-medium transition text-center block"
        aria-label="Back to top"
      >
        Back to top
      </button>

      {/* 2. Main Multi-Column Links Section (Amazon #232F3E) */}
      <div className="bg-[#232F3E] text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-12 border-b border-[#3a4553]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs sm:text-[13px]">
          {/* Column 1: Get to Know Us */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm sm:text-base mb-3">
              Get to Know Us
            </h4>
            <ul className="space-y-2 text-[#DDD]">
              <li>
                <a href="/about" className="hover:underline hover:text-white transition block">
                  About Yearnit
                </a>
              </li>
              <li>
                <a href="/about#methodology" className="hover:underline hover:text-white transition block">
                  Editorial Standards
                </a>
              </li>
              <li>
                <a href="/about#methodology" className="hover:underline hover:text-white transition block">
                  Review Methodology
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:underline hover:text-white transition block">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Product Guides */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm sm:text-base mb-3">
              Product Guides
            </h4>
            <ul className="space-y-2 text-[#DDD]">
              <li>
                <a href="#featured-catalog" className="hover:underline hover:text-white transition block">
                  Consumer Electronics
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:underline hover:text-white transition block">
                  Audio & Wearables
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:underline hover:text-white transition block">
                  Mobiles & Laptops
                </a>
              </li>
              <li>
                <a href="#featured-catalog" className="hover:underline hover:text-white transition block">
                  Home & Kitchen Gear
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Affiliate Information */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm sm:text-base mb-3">
              Affiliate Programs
            </h4>
            <ul className="space-y-2 text-[#DDD]">
              <li>
                <a href="/affiliate-disclosure" className="hover:underline hover:text-white transition block">
                  Affiliate Disclosure
                </a>
              </li>
              <li>
                <a href="/affiliate-disclosure#referral-mechanics" className="hover:underline hover:text-white transition block">
                  How Referral Links Work
                </a>
              </li>
              <li>
                <a href="/affiliate-disclosure#operating-statement" className="hover:underline hover:text-white transition block">
                  Associates Statement
                </a>
              </li>
              <li>
                <a href="/affiliate-disclosure#non-affiliation-trademarks" className="hover:underline hover:text-white transition block">
                  Non-Affiliation Notice
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Policies */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-sm sm:text-base mb-3">
              Help & Policies
            </h4>
            <ul className="space-y-2 text-[#DDD]">
              <li>
                <a href="/privacy-policy" className="hover:underline hover:text-white transition block">
                  Privacy Notice
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:underline hover:text-white transition block">
                  Conditions of Use
                </a>
              </li>
              <li>
                <a href="/about#pricing-disclaimer" className="hover:underline hover:text-white transition block">
                  Pricing & Availability
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:underline hover:text-white transition block">
                  Customer Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Amazon-style Sub-divider with Logo & Country badge */}
        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-[#3a4553] flex flex-wrap items-center justify-center gap-6 text-xs text-[#CCC]">
          <a href="/" className="flex items-center gap-2 group no-underline">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-gray-950 font-black text-sm">
              Y
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              Yearnit
            </span>
          </a>

          <div className="flex items-center gap-3">
            <span className="border border-[#848688] rounded px-3 py-1 text-xs text-gray-300">
              English
            </span>
            <span className="border border-[#848688] rounded px-3 py-1 text-xs text-gray-300 flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>India</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Amazon-style Dark Bottom Strip (#131A22) */}
      <div className="bg-[#131A22] text-[#999] py-8 px-4 text-center text-xs space-y-3">
        {/* Legal Link Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="/terms" className="hover:underline hover:text-white transition">
            Conditions of Use & Sale
          </a>
          <a href="/privacy-policy" className="hover:underline hover:text-white transition">
            Privacy Notice
          </a>
          <a href="/affiliate-disclosure" className="hover:underline hover:text-white transition">
            Affiliate Disclosure
          </a>
          <a href="/about" className="hover:underline hover:text-white transition">
            About Yearnit
          </a>
          <a href="/contact" className="hover:underline hover:text-white transition">
            Support & Grievances
          </a>
        </div>

        {/* Mandatory Amazon Associates Operating Agreement Statement */}
        <p className="text-[11px] text-[#888] max-w-3xl mx-auto leading-relaxed">
          As an Amazon Associate I earn from qualifying purchases. Yearnit is an independent review platform and is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
        </p>

        {/* Copyright */}
        <p className="text-[11px] text-[#777]">
          © {new Date().getFullYear()}, Yearnit.in, Inc. or its affiliates
        </p>
      </div>
    </footer>
  );
}
