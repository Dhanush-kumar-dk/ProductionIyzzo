import TopBar from "./TopBar";
import Footer from "./Footer";
import { ShieldCheckIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      <TopBar openLogIn={() => {}} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-3 border border-amber-200">
              <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
              <span>Full Compliance Transparency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Affiliate Disclosure & Transparency Policy
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Last Updated: October 2026 • Effective for yearnit.in
            </p>
          </div>

          {/* Statutory Amazon Associates Statement */}
          <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-5 text-amber-950 space-y-2">
            <h2 className="text-base font-bold flex items-center gap-2 text-amber-900">
              <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Mandatory Operating Agreement Disclosure</span>
            </h2>
            <p className="text-base font-extrabold text-gray-900 italic">
              "As an Amazon Associate I earn from qualifying purchases."
            </p>
            <p className="text-xs text-gray-700 leading-relaxed pt-1">
              Yearnit (accessible at https://yearnit.in) is a participant in the Amazon Associates Program, an affiliate advertising initiative designed to provide a means for websites to earn advertising fees by advertising and linking to Amazon.in and affiliated marketplaces.
            </p>
          </div>

          {/* Detailed Policy Sections */}
          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950">1. How Our Affiliate Links Work</h2>
            <p>
              When you click on a product link on Yearnit that points to Amazon.in, a specialized tracking code (our Associate tracking tag: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-900">tag=dk29112306-21</code>) is appended to the destination URL.
            </p>
            <p>
              If you decide to make a purchase on Amazon after following our link within the qualifying referral window, Amazon pays Yearnit a modest referral fee at <strong>absolutely zero additional cost to you</strong>. The price you pay on Amazon is identical whether you use our link or navigate to Amazon directly.
            </p>
          </section>

          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950">2. Pricing & Availability Disclaimer</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 space-y-2">
              <p className="font-semibold">Important Pricing Notice:</p>
              <p className="italic text-gray-800 leading-relaxed">
                "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product."
              </p>
            </div>
            <p>
              E-commerce prices fluctuate continuously based on merchant availability, promotional schedules, and marketplace demand. Yearnit does not guarantee that a displayed price will remain static when you visit the retailer. Always confirm the final price on the official Amazon product listing page prior to completing your purchase.
            </p>
          </section>

          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950">3. Non-Affiliation & Trademark Notice</h2>
            <p>
              <strong>Yearnit is not affiliated with Amazon.</strong> Yearnit is an independent product review and consumer research website. Yearnit is not endorsed, sponsored, or certified by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
            </p>
            <p>
              Amazon, Kindle, Echo, Alexa, and the Amazon logo are registered trademarks of Amazon.com, Inc. or its affiliates. All other trademarks, product names, and brand logos appearing on Yearnit are the property of their respective owners.
            </p>
          </section>

          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950">4. Editorial Independence & Integrity</h2>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>We do not accept monetary compensation or sponsored bribes to award favorable ratings or artificial recommendations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>We highlight clear tradeoffs and product limitations alongside strengths so you can make an educated choice.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>All product fulfillment, customer support, shipping, warranties, and return policies are handled exclusively by the official retailer.</span>
              </li>
            </ul>
          </section>

          {/* Contact Section */}
          <div className="border-t border-gray-100 pt-6 text-xs text-gray-500">
            <p>
              If you have any questions regarding our affiliate disclosures or compliance policies, please contact our editorial and compliance team at <a href="mailto:support@yearnit.in" className="text-blue-600 font-semibold underline">support@yearnit.in</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
