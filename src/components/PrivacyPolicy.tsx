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
          <span className="text-sm font-bold tracking-tight">Legal & Compliance</span>
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
              Last Updated: October 27, 2026 • Effective Immediately
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              1. Overview & Commitment
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Yearnit / Iyzzo ("we", "us", or "our") respects your privacy. This Privacy Policy outlines how we collect, process, and protect your information when visiting our website, ad landing pages, or interacting with our promotional notifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              2. Meta Ads (Pixel & Conversions API)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We utilize the Meta Pixel and Meta Conversions API (CAPI) provided by Meta Platforms, Inc. to measure ad efficacy and deliver relevant promotional deals to audiences on Facebook and Instagram. When you submit a lead form, contact us, or view deal content, hashed user identifiers (such as SHA-256 hashed email or phone number) and browser click IDs (fbp, fbc) may be transmitted securely to Meta servers to deduplicate and attribute ad campaigns. You may manage your Meta ad preferences directly in your Facebook Ad Settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              3. Google Ads & Google Consent Mode v2
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our website implements Google Ads conversion tracking and Google Analytics 4 (GA4). In accordance with Google Consent Mode v2, advertising storage and personalized ad data are set to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">denied</code> by default until you explicitly provide cookie consent. When consent is granted, conversion events (such as Lead form submissions) are recorded to evaluate campaign effectiveness.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              4. Information We Collect
            </h2>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1.5 leading-relaxed">
              <li><strong>Contact Information:</strong> Name, phone number, and email address provided voluntarily via lead submission or notification signups.</li>
              <li><strong>Marketing & Attribution Data:</strong> UTM campaign tags, Google Click IDs (GCLID), and Meta Click IDs (FBCLID) to attribute marketing origin.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, operating system, and timestamp collected automatically for security and fraud prevention.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              5. How We Use Your Information
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Information collected is used solely to:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1 text-xs">
              <li>Deliver requested deal alerts, coupon drops, and WhatsApp notifications.</li>
              <li>Measure and optimize marketing campaigns on Meta Ads and Google Ads.</li>
              <li>Prevent fraudulent submissions and verify lead integrity.</li>
              <li>We never sell, rent, or trade your personal data to third-party brokers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
              6. Grievance Officer & Contact
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              In accordance with the Information Technology Act 2000 and rules made thereunder, the Grievance Officer for the purpose of our privacy practices is reachable at:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-700 space-y-1">
              <p><strong>Email:</strong> support@yearnit.in / support@iyzzo.com</p>
              <p><strong>Operating Region:</strong> Tamil Nadu & India</p>
              <p><strong>Response Time:</strong> Within 48 business hours</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Yearnit / Iyzzo. All rights reserved.</p>
      </footer>
    </div>
  );
}
