import TopBar from "./TopBar";
import Footer from "./Footer";
import { CheckBadgeIcon, ShieldCheckIcon, BeakerIcon } from "@heroicons/react/24/solid";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      <TopBar openLogIn={() => {}} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-200">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              <span>Independent Consumer Research</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              About Yearnit
            </h1>
            <p className="text-xs text-gray-500 mt-2">
              Our Mission, Editorial Integrity & Review Methodology
            </p>
          </div>

          {/* Mission */}
          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950">Who We Are</h2>
            <p>
              Yearnit (<strong>yearnit.in</strong>) is an independent product review and consumer buying guide platform based in India. In an online landscape crowded with automated scrapers and artificial ratings, Yearnit was created to offer genuine, human-researched buying advice.
            </p>
            <p>
              We evaluate everyday consumer electronics, headphones, mobile devices, home appliances, and lifestyle accessories to help shoppers make well-informed, value-driven decisions.
            </p>
          </section>

          {/* Editorial Methodology */}
          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <BeakerIcon className="w-5 h-5 text-amber-500" />
              <span>Our Editorial Methodology</span>
            </h2>
            <p>
              Every recommendation published on Yearnit undergoes structured editorial scrutiny:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-gray-900 text-xs mb-1">1. Specification Audits</h3>
                <p className="text-xs text-gray-600">
                  We verify manufacturer claims against verified laboratory teardowns, real-world battery endurance tests, and actual component specs.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-gray-900 text-xs mb-1">2. Long-Term Feedback</h3>
                <p className="text-xs text-gray-600">
                  We analyze verified buyer feedback months after purchase to identify recurring build defects or durability shortcomings.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-gray-900 text-xs mb-1">3. Honest Pros & Cons</h3>
                <p className="text-xs text-gray-600">
                  No product is flawless. We explicitly spotlight design tradeoffs and shortcomings so you are never surprised post-purchase.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h3 className="font-bold text-gray-900 text-xs mb-1">4. Audience Matching</h3>
                <p className="text-xs text-gray-600">
                  We clarify exactly who each item is suitable for—and just as importantly, who should skip it.
                </p>
              </div>
            </div>
          </section>

          {/* Independence and Disclosures */}
          <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-emerald-600" />
              <span>Independence & Amazon Associates Disclosure</span>
            </h2>
            <p>
              <strong>Yearnit is not affiliated with Amazon.</strong> We operate as an independent publisher. We participate in the Amazon Associates Program:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 font-semibold italic">
              "As an Amazon Associate I earn from qualifying purchases."
            </div>
            <p className="text-xs text-gray-600">
              Purchasing through our links earns us a small referral fee from Amazon at no extra cost to you. We never accept sponsored bias or payments to alter our editorial verdicts.
            </p>
          </section>

          {/* Age Compliance */}
          <section className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-700">Children's Online Privacy & Target Audience</h3>
            <p>
              Yearnit is strictly not directed at children under 13 years of age. All content, recommendations, and reviews are prepared exclusively for adult consumers 18 years of age and older.
            </p>
          </section>

          {/* Contact */}
          <div className="border-t border-gray-100 pt-6 text-xs text-gray-500">
            <p>
              For press inquiries, editorial corrections, or product review suggestions, reach our team at <a href="mailto:support@yearnit.in" className="text-blue-600 font-semibold underline">support@yearnit.in</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
