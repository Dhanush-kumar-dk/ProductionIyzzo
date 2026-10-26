import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-gray-800 font-poppins flex flex-col">
      {/* Header */}
      <header className="bg-[#1A222D] text-white py-4 px-4 sm:px-8 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-bold tracking-tight">Terms of Service</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-100 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Terms of Service
            </h1>
            <p className="text-xs text-gray-400">
              Last Updated: October 27, 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              By accessing Yearnit / Iyzzo, subscribing to deal updates, or submitting your contact information, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion of these terms, please discontinue use of this site immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              2. Nature of Service & Affiliate Disclosure
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We operate an e-commerce deals curation and price alert platform. We curate verified discounts, coupons, and promotional opportunities. When you click on product links on our site and make purchases, we may earn an affiliate commission at no extra cost to you. All transactions, order fulfillments, deliveries, and returns are handled directly by the respective merchant platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              3. Pricing & Availability Disclaimer
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Product prices, stock levels, and promotional discounts fluctuate frequently and are subject to change without notice. While we strive to display accurate, up-to-the-minute data, the price displayed on the merchant checkout screen at the time of purchase is the final binding price.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              4. SMS & WhatsApp Communication Consent
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              By voluntarily submitting your phone number or email on our landing page, you grant us permission to send you deal updates, price alerts, and member specials. You can opt out of communications at any time by replying "STOP" or contacting our support team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              5. Limitation of Liability
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit / Iyzzo shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the site, product defects, or third-party merchant service disruptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              6. Governing Law
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction in the courts of Chennai, Tamil Nadu.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Yearnit / Iyzzo. All rights reserved.</p>
      </footer>
    </div>
  );
}
