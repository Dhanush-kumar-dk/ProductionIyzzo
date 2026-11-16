import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E3E8E2] text-[#3F4A44] font-sans pt-16 pb-12 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left Brand Block + 4 Right Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12 border-b border-[#E3E8E2]">
          {/* Left Column (md: 4 of 12 cols) */}
          <div className="md:col-span-4 space-y-4">
            {/* Logo: Outlined square icon + serif caps "YEARNIT" */}
            <a href="/" className="inline-flex items-center gap-2 group text-decoration-none">
              <div className="w-7 h-7 rounded border-[1.5px] border-[#1E2A24] flex items-center justify-center bg-white group-hover:bg-[#FAFBF8] transition">
                <span className="font-serif font-bold text-xs text-[#1E2A24]">Y</span>
              </div>
              <span className="font-serif font-semibold tracking-[0.14em] text-lg text-[#1E2A24] uppercase">
                Yearnit
              </span>
            </a>

            <p className="font-sans text-xs sm:text-sm text-[#7B857F] leading-relaxed max-w-[36ch]">
              Independent product reviews, lab-audited hardware benchmarks, and curated buyer guides for smart Indian consumers.
            </p>

            {/* Social Icon Circles */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-full border border-[#CBD3CB] bg-[#FAFBF8] hover:bg-[#E6EAE5] flex items-center justify-center text-[#1E2A24] text-xs transition"
              >
                𝕏
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-[#CBD3CB] bg-[#FAFBF8] hover:bg-[#E6EAE5] flex items-center justify-center text-[#1E2A24] text-xs transition"
              >
                in
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full border border-[#CBD3CB] bg-[#FAFBF8] hover:bg-[#E6EAE5] flex items-center justify-center text-[#1E2A24] text-xs transition"
              >
                git
              </a>
            </div>

            {/* Small Address Block */}
            <div className="text-[11px] text-[#7B857F] pt-2 space-y-0.5">
              <p className="font-semibold text-[#1E2A24]">Yearnit Benchmark Labs</p>
              <p>Indiranagar, Bengaluru, Karnataka 560038, India</p>
              <p>editorial@yearnit.in</p>
            </div>
          </div>

          {/* Right Columns: 4 Link Columns (md: 8 of 12 cols, 2 per col on desktop) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {/* Column 1: Popular Guides */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1E2A24]">
                Popular Guides
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/#categories" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Smartphones & 5G
                  </a>
                </li>
                <li>
                  <a href="/#categories" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Noise-Cancelling TWS
                  </a>
                </li>
                <li>
                  <a href="/#categories" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Smart 4K TVs
                  </a>
                </li>
                <li>
                  <a href="/#categories" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Laptops & Ultrabooks
                  </a>
                </li>
                <li>
                  <a href="/#categories" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Home & Kitchen Tech
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Buyer Resources */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1E2A24]">
                Buyer Resources
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/about#methodology" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Lab Test Protocols
                  </a>
                </li>
                <li>
                  <a href="/#featured-catalog" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Price Drop Tracker
                  </a>
                </li>
                <li>
                  <a href="/affiliate-disclosure" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Affiliate Disclosure
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Buying Checklists
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Warranty Guidelines
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1E2A24]">
                Company
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/about" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    About Yearnit
                  </a>
                </li>
                <li>
                  <a href="/about#standards" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Editorial Standards
                  </a>
                </li>
                <li>
                  <a href="/about#methodology" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Review Methodology
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/profile" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Member Profile
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Trust */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1E2A24]">
                Legal & Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/privacy-policy" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/affiliate-disclosure" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Amazon Notice
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-[#7B857F] hover:text-[#1E2A24] transition">
                    Editorial Inquiries
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Small-Print Amazon Affiliate Disclosure */}
        <div className="pt-8 pb-4 text-[11px] text-[#7B857F] leading-relaxed">
          <p>
            <strong>Amazon Affiliate Disclosure:</strong> Yearnit is a participant in the Amazon Services LLC Associates Program and Amazon Associates India, affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. Amazon, the Amazon logo, Amazon Prime, and the Amazon Prime logo are trademarks of Amazon.com, Inc. or its affiliates. All prices and ratings are benchmarked in our testing lab and verified against live Amazon seller feeds.
          </p>
        </div>

        {/* Divider & Copyright Row */}
        <div className="pt-4 border-t border-[#E3E8E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7B857F]">
          <p>© 2026 Yearnit Media. All rights reserved.</p>
          <p className="text-[10px] text-[#7B857F]/80">
            Partner Tag: <code className="bg-[#FAFBF8] px-1 py-0.5 rounded border border-[#E3E8E2]">dk29112306-21</code>
          </p>
        </div>
      </div>
    </footer>
  );
}
