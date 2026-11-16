import YearnitLogo from "../assets/yearnit_logo-bg.png";
export default function Footer() {
  return (
    <footer className="w-full font-sans text-gray-300 antialiased selection:bg-amber-400 selection:text-gray-950">
      {/* Main Multi-Column Links Section (Amazon Classic #232F3E) */}
      <div className="bg-[#232F3E] text-white pt-10 sm:pt-12 pb-8 border-b border-[#3a4553]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-[13px]">
          {/* Column 1: Get to Know Us */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[14px] sm:text-[15px] tracking-tight">
              Get to Know Us
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/about"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  About Yearnit
                </a>
              </li>
              <li>
                <a
                  href="/about#methodology"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Editorial Standards
                </a>
              </li>
              <li>
                <a
                  href="/about#methodology"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Review Methodology
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Product Guides */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[14px] sm:text-[15px] tracking-tight">
              Product Guides
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#featured-catalog"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Consumer Electronics
                </a>
              </li>
              <li>
                <a
                  href="#featured-catalog"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Audio & Wearables
                </a>
              </li>
              <li>
                <a
                  href="#featured-catalog"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Mobiles & Tech
                </a>
              </li>
              <li>
                <a
                  href="#featured-catalog"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Home & Kitchen Gear
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Affiliate Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[14px] sm:text-[15px] tracking-tight">
              Affiliate Programs
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/affiliate-disclosure"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Affiliate Disclosure
                </a>
              </li>
              <li>
                <a
                  href="/affiliate-disclosure#referral-mechanics"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  How Referral Links Work
                </a>
              </li>
              <li>
                <a
                  href="/affiliate-disclosure#operating-statement"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Associates Statement
                </a>
              </li>
              <li>
                <a
                  href="/affiliate-disclosure#non-affiliation-trademarks"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Non-Affiliation Notice
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-[14px] sm:text-[15px] tracking-tight">
              Help & Policies
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/privacy-policy"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Privacy Notice
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Conditions of Use
                </a>
              </li>
              <li>
                <a
                  href="/about#pricing-disclaimer"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Pricing & Availability
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  style={{ color: "#DDD", textDecoration: "none" }}
                  className="hover:underline hover:!text-white transition block"
                >
                  Customer Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Divider */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[#3a4553] flex items-center justify-center">
          <a
            href="/"
            aria-label="Yearnit home"
            className="flex items-center hover:opacity-90 transition"
          >
            <img
              src={YearnitLogo}
              alt="Yearnit"
              className="h-10 sm:h-12 w-auto object-contain"
              draggable={false}
            />
          </a>
        </div>
      </div>

      {/* Amazon-style Dark Bottom Legal Strip (#131A22) */}
      <div className="legal-strip bg-[#131A22] text-[#9E9E9E] py-8 text-center text-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Legal Link Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px]">
            <a
              href="/terms"
              style={{ color: "#9E9E9E", textDecoration: "none" }}
              className="hover:underline hover:!text-white transition"
            >
              Conditions of Use & Sale
            </a>
            <a
              href="/privacy-policy"
              style={{ color: "#9E9E9E", textDecoration: "none" }}
              className="hover:underline hover:!text-white transition"
            >
              Privacy Notice
            </a>
            <a
              href="/affiliate-disclosure"
              style={{ color: "#9E9E9E", textDecoration: "none" }}
              className="hover:underline hover:!text-white transition"
            >
              Affiliate Disclosure
            </a>
            <a
              href="/about"
              style={{ color: "#9E9E9E", textDecoration: "none" }}
              className="hover:underline hover:!text-white transition"
            >
              About Yearnit
            </a>
            <a
              href="/contact"
              style={{ color: "#9E9E9E", textDecoration: "none" }}
              className="hover:underline hover:!text-white transition"
            >
              Support & Grievances
            </a>
          </div>

          {/* Mandatory Amazon Associates Operating Agreement Statement */}
          <p className="text-[11px] text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed">
            As an Amazon Associate I earn from qualifying purchases. Yearnit is an independent review platform and is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
          </p>

          {/* Copyright */}
          <p className="text-[11px] text-[#B0B8C1]">
            © {new Date().getFullYear()}, Yearnit.in, Inc. or its affiliates
          </p>
        </div>
      </div>
    </footer>
  );
}
