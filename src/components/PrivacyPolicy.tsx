import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-gray-800 font-poppins flex flex-col">
      {/* Minimal Header */}
      <header className="bg-[#1A222D] text-white py-4 px-4 sm:px-8 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-bold tracking-tight">Yearnit Legal Compliance</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-100 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-400">
              Last Updated: October 27, 2026 • Effective for yearnit.in
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              1. Overview & Commitment
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit ("we", "us", or "our", accessible at https://yearnit.in) respects your personal privacy. This Privacy Policy outlines how we collect, process, and protect your information when visiting our website, exploring our independent buyer guides, or interacting with our promotional channels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              2. Amazon Associates Program & Affiliate Tracking
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit is a participant in the Amazon Associates Program. When you click an Amazon product link on our website, Amazon and third-party advertising partners may set cookies or use web beacons, pixels, and tracking technologies to track referral sessions and calculate qualifying purchases.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              These cookies serve solely to attribute referring traffic and calculate affiliate referral commissions under the Amazon Associates Operating Agreement. They do not store sensitive personal information such as credit card numbers or banking credentials on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              3. Cookies, Analytics & Google Consent Mode v2
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our website uses cookies and analytics measurement technologies (including Google Analytics 4, Google Tag Manager, and Google Ads). In accordance with Google Consent Mode v2, all advertising storage (<code className="bg-gray-100 px-1 rounded text-xs">ad_storage</code>, <code className="bg-gray-100 px-1 rounded text-xs">ad_user_data</code>, <code className="bg-gray-100 px-1 rounded text-xs">ad_personalization</code>) and analytics storage are set to <strong>denied</strong> by default until you interact with our cookie consent banner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              4. Meta Pixel & Conversions API (CAPI)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We employ the Meta Pixel and Meta Conversions API (CAPI) to measure ad engagement across Facebook and Instagram. When a visitor submits a contact form or lead inquiry, cryptographically hashed user identifiers (SHA-256 lowercased and trimmed email or phone number) and click identifiers (<code className="bg-gray-100 px-1 rounded text-xs">fbp</code>, <code className="bg-gray-100 px-1 rounded text-xs">fbc</code>) are sent to Meta servers for deduplication and attribution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              5. User Opt-Out Information
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              You retain complete control over how your data is used for personalized advertising. You may opt out of third-party tracking and interest-based ads via:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1.5 leading-relaxed">
              <li><strong>Amazon Advertising Preferences:</strong> You can manage Amazon ad preferences at <a href="https://www.amazon.in/adprefs" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">amazon.in/adprefs</a>.</li>
              <li><strong>Google Ad Settings:</strong> You can customize or disable personalized ads at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">adssettings.google.com</a>.</li>
              <li><strong>Meta Ad Settings:</strong> Control your Facebook and Instagram ad settings in your Meta account center.</li>
              <li><strong>Industry Opt-Out Portals:</strong> Visit the Network Advertising Initiative at <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">networkadvertising.org</a> or the Digital Advertising Alliance at <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">aboutads.info</a>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              6. Data Handling, Security & Retention
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              All personal data (such as voluntary newsletter email submissions) is transmitted over TLS/SSL encryption and stored in secured databases with restricted administrative access. We retain lead and inquiry records only for as long as necessary to fulfill consumer communications, comply with statutory obligations, or until an unsubscribe request is received. We never sell, rent, or trade your personal data to third-party data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              7. Children's Online Privacy (Under 13)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              <strong>Yearnit is strictly not directed at children under 13 years of age.</strong> We do not knowingly solicit, collect, or maintain personal information from children under 13. If you believe a child under 13 has submitted personal information through our site, please contact us immediately at <a href="mailto:support@yearnit.in" className="text-blue-600 font-semibold underline">support@yearnit.in</a> and we will delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              8. Grievance Officer & Contact
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              In accordance with the Information Technology Act 2000 and rules made thereunder, questions or grievances regarding our privacy practices may be addressed to our Grievance Officer at:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-700 space-y-1">
              <p><strong>Entity:</strong> Yearnit Editorial & Compliance Team</p>
              <p><strong>Email:</strong> support@yearnit.in</p>
              <p><strong>Website:</strong> https://yearnit.in</p>
              <p><strong>Operating Region:</strong> Tamil Nadu & India</p>
              <p><strong>Response Time:</strong> Within 48 business hours</p>
            </div>
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
