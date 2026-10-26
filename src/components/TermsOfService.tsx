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
          <span className="text-sm font-bold tracking-tight">Yearnit Terms of Service</span>
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
              Last Updated: October 27, 2026 • Effective for yearnit.in
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              1. Acceptance of Terms & Eligibility
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              By accessing Yearnit (https://yearnit.in), reviewing our buying guides, or subscribing to our newsletters, you agree to comply with and be bound by these Terms of Service.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              <strong>Age Restriction:</strong> You must be at least 18 years of age to access or use this site. <strong>Yearnit is strictly not directed at children under 13 years of age.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              2. Nature of Service & Amazon Associates Disclosure
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit is an independent product research and review publication. We participate in the Amazon Associates Program.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-semibold italic">
              "As an Amazon Associate I earn from qualifying purchases."
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              When you click on outbound merchant links and make purchases, we may receive an affiliate referral fee from Amazon at no extra cost to you. All product purchases, order transactions, shipping, warranties, and returns are executed directly between you and the respective retailer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              3. Pricing & Availability Disclaimer
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed italic">
              "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product."
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit does not sell, warehouse, ship, or warranty any physical goods directly. Prices, discounts, and item availability change frequently on merchant websites. Always confirm the final price and terms on Amazon prior to making any purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              4. Non-Affiliation & Intellectual Property
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              <strong>Yearnit is not affiliated with Amazon.</strong> Yearnit is an independent platform. Amazon, the Amazon logo, and other related trademarks are the property of Amazon.com, Inc. or its affiliates. All original editorial reviews, summaries, pros and cons, and site designs are the intellectual property of Yearnit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              5. Limitation of Liability
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              To the maximum extent permitted by applicable Indian law, Yearnit, its owners, and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from product purchases made on external partner sites, price fluctuations, out-of-stock items, or merchant delivery delays.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              6. Contact Information
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              For any questions regarding these Terms, contact our compliance team at <a href="mailto:support@yearnit.in" className="text-blue-600 font-semibold underline">support@yearnit.in</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Yearnit (yearnit.in). All rights reserved.</p>
      </footer>
    </div>
  );
}
