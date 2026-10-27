import { useState } from "react";
import TopBar from "./TopBar";
import Footer from "./Footer";
import LogIn from "./Login";
import { ChevronRightIcon, PrinterIcon, HandThumbUpIcon, HandThumbDownIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AboutPage() {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [openLogIn, setOpenLogIn] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col font-poppins text-[#0F1111]">
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}
      <TopBar openLogIn={() => setOpenLogIn(true)} />

      <main className="flex-1 py-6 px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Amazon-style Breadcrumb Bar */}
        <nav className="text-xs text-[#565959] mb-4 flex items-center gap-1.5 flex-wrap">
          <a href="/" className="hover:text-[#007185] hover:underline">
            Home
          </a>
          <ChevronRightIcon className="w-3 h-3 text-gray-400" />
          <a href="/about" className="hover:text-[#007185] hover:underline">
            Help & Customer Service
          </a>
          <ChevronRightIcon className="w-3 h-3 text-gray-400" />
          <span className="text-[#0F1111] font-semibold">
            Conditions of Use, Editorial Standards & About Yearnit
          </span>
        </nav>

        {/* 2-Column Amazon Layout: Left Sidebar + Main Help Document */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Help Topics & Legal Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-xl border border-[#D5D9D9] p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F1111] pb-2 border-b border-[#E7E7E7]">
              Help & Policy Topics
            </h3>

            <ul className="space-y-1.5 text-xs text-[#007185]">
              <li>
                <a
                  href="#overview"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] font-semibold text-[#0F1111] bg-[#F0F2F2]"
                >
                  › 1. Overview & Service Mission
                </a>
              </li>
              <li>
                <a
                  href="#affiliate-disclosure"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 2. Associates Operating Disclosure
                </a>
              </li>
              <li>
                <a
                  href="#non-affiliation"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 3. Non-Affiliation & Trademarks
                </a>
              </li>
              <li>
                <a
                  href="#pricing-disclaimer"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 4. Pricing & Availability Terms
                </a>
              </li>
              <li>
                <a
                  href="#methodology"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 5. Editorial Review Methodology
                </a>
              </li>
              <li>
                <a
                  href="#age-eligibility"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 6. Children's Privacy (Under 13)
                </a>
              </li>
              <li>
                <a
                  href="#liability"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 7. Disclaimer of Warranties
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 8. Grievance & Contact Info
                </a>
              </li>
            </ul>

            <div className="pt-3 border-t border-[#E7E7E7] text-xs space-y-2">
              <span className="font-bold text-[#0F1111] block">Related Documents:</span>
              <a href="/privacy-policy" className="text-[#007185] hover:underline block">
                • Privacy Notice
              </a>
              <a href="/terms" className="text-[#007185] hover:underline block">
                • Terms of Service
              </a>
              <a href="/affiliate-disclosure" className="text-[#007185] hover:underline block">
                • Affiliate Disclosure
              </a>
              <a href="/contact" className="text-[#007185] hover:underline block">
                • Customer Support
              </a>
            </div>
          </aside>

          {/* Main Document Content */}
          <article className="lg:col-span-9 bg-white rounded-xl border border-[#D5D9D9] p-6 sm:p-10 shadow-sm space-y-8 leading-relaxed">
            {/* Header & Print Control */}
            <div className="border-b border-[#E7E7E7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1111] tracking-tight">
                  About Yearnit: Conditions of Use & Editorial Standards
                </h1>
                <p className="text-xs text-[#565959] mt-1">
                  Last updated: <strong>October 27, 2026</strong> • Applies to Yearnit (https://yearnit.in)
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D5D9D9] rounded-lg text-xs font-semibold text-[#0F1111] hover:bg-[#F7FAFA] shadow-sm self-start sm:self-auto transition"
              >
                <PrinterIcon className="w-4 h-4 text-[#565959]" />
                <span>Print Document</span>
              </button>
            </div>

            {/* Formal Intro Paragraph */}
            <p className="text-sm text-[#0F1111]">
              Welcome to <strong>Yearnit.in</strong>. Yearnit provides independent product reviews, in-depth buying guides, and consumer recommendation services to you subject to the following operating conditions. If you visit, read, or purchase through referral links on Yearnit.in, you accept these terms. Please review them carefully.
            </p>

            {/* Section 1: Overview & Service Mission */}
            <section id="overview" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                1. Overview & Service Mission
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                Yearnit (<strong>https://yearnit.in</strong>) is an independent consumer guidance and editorial publication registered in India. In an online environment saturated with algorithmic link farms and artificial product ratings, Yearnit's mission is to provide rigorous, human-evaluated product assessments across consumer electronics, home lifestyle gear, mobile accessories, audio hardware, and personal tech.
              </p>
              <p className="text-xs sm:text-sm text-[#333333]">
                Yearnit operates strictly as an information resource and review publisher. Yearnit does not sell, package, warehouse, ship, or process payments for any physical retail merchandise directly. All transactions initiated through our site are conducted directly on authorized third-party retail partner storefronts.
              </p>
            </section>

            {/* Section 2: Amazon Associates Operating Disclosure */}
            <section id="affiliate-disclosure" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                2. Amazon Associates Program Operating Disclosure
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                In compliance with the Amazon Associates Program Operating Agreement, Yearnit provides the following explicit statement:
              </p>

              {/* Amazon Callout Box */}
              <div className="bg-[#FFFDF5] border border-[#F59E0B] rounded-lg p-4 text-xs sm:text-sm text-[#0F1111] space-y-2">
                <p className="font-bold text-[#B45309] uppercase tracking-wider text-xs">
                  Statutory Operating Agreement Statement:
                </p>
                <p className="text-sm sm:text-base font-extrabold italic text-[#0F1111]">
                  "As an Amazon Associate I earn from qualifying purchases."
                </p>
                <p className="text-xs text-[#565959] leading-relaxed pt-1">
                  Yearnit participates in the Amazon Associates Program, an affiliate advertising initiative designed to provide a means for websites to earn advertising fees by linking to Amazon.in and affiliated marketplaces.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#333333]">
                When visitors click an outbound product link on Yearnit and make a purchase on Amazon, Amazon pays our website a small referral commission at <strong>absolutely zero additional cost to the buyer</strong>. Product purchase prices, promotions, shipping fees, and customer rights are identical regardless of whether a purchase is made through our referral links or navigated to directly.
              </p>
            </section>

            {/* Section 3: Non-Affiliation & Trademarks */}
            <section id="non-affiliation" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                3. Non-Affiliation & Trademark Notice
              </h2>
              <div className="bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg p-3.5 text-xs sm:text-sm text-[#0F1111] font-semibold">
                Yearnit is an independent review website. Yearnit is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
              </div>
              <p className="text-xs sm:text-sm text-[#333333]">
                Amazon, Kindle, Echo, Alexa, and the Amazon logo are registered trademarks of Amazon.com, Inc. or its affiliates. All other trademarks, trade dress, product titles, and brand names referenced on Yearnit remain the exclusive property of their respective trademark owners. References to specific brands or commercial products do not constitute an endorsement, recommendation, or partnership.
              </p>
            </section>

            {/* Section 4: Pricing & Availability Terms */}
            <section id="pricing-disclaimer" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                4. Pricing & Product Availability Terms
              </h2>
              <div className="bg-[#FFFDF5] border border-[#E77600] rounded-lg p-3.5 text-xs sm:text-sm text-[#0F1111] leading-relaxed italic">
                "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product."
              </div>
              <p className="text-xs sm:text-sm text-[#333333]">
                Online merchant prices and inventory fluctuate frequently due to dynamic pricing algorithms, promotional windows, and seller restocks. While Yearnit strives to display current and accurate catalog information, Yearnit cannot guarantee any price, coupon, or stock availability. The final binding purchase price is always the price displayed on the Amazon storefront at the moment of checkout.
              </p>
            </section>

            {/* Section 5: Editorial Review Methodology */}
            <section id="methodology" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                5. Editorial Review Methodology & Standards
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                Our editorial team operates with strict journalistic independence. Product inclusions and evaluation summaries adhere to a standardized 4-part research framework:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-[#333333] space-y-1.5">
                <li>
                  <strong>Technical Specification Verification:</strong> Auditing manufacturer marketing claims against technical whitepapers, laboratory teardowns, component benchmarks, and endurance figures.
                </li>
                <li>
                  <strong>Long-Term Durability Analysis:</strong> Reviewing historical customer failure reports and verified long-term consumer feedback (3–12 months post-purchase) to identify structural build weaknesses.
                </li>
                <li>
                  <strong>Balanced Tradeoff Reporting:</strong> Documenting honest product shortcomings, missing features, and ergonomic compromises alongside positive selling points.
                </li>
                <li>
                  <strong>Target Audience Suitability:</strong> Explicitly identifying the specific user demographic (e.g. daily commuters, university students, home chefs) who will derive maximum value from the item.
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-[#333333]">
                Yearnit does not accept monetary compensation or sponsored incentives in exchange for favorable reviews or placement on our recommendation guides.
              </p>
            </section>

            {/* Section 6: Children's Online Privacy & User Age */}
            <section id="age-eligibility" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                6. Children's Online Privacy & User Age Eligibility
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                <strong>Yearnit is strictly not directed at children under 13 years of age.</strong> In adherence with the Children's Online Privacy Protection Act (COPPA) and international consumer privacy regulations, we do not knowingly market to, target, or solicit personal data from children under 13.
              </p>
              <p className="text-xs sm:text-sm text-[#333333]">
                Access to and use of this website is intended solely for adult consumers aged 18 and older who are legally capable of entering binding retail transactions.
              </p>
            </section>

            {/* Section 7: Disclaimer of Warranties & Limitation of Liability */}
            <section id="liability" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                7. Disclaimer of Warranties & Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                THIS SITE AND ALL INFORMATION, CONTENT, MATERIALS, AND RECOMMENDATIONS INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THIS SITE ARE PROVIDED BY YEARNIT ON AN "AS IS" AND "AS AVAILABLE" BASIS, UNLESS OTHERWISE SPECIFIED IN WRITING.
              </p>
              <p className="text-xs sm:text-sm text-[#333333]">
                TO THE FULL EXTENT PERMISSIBLE BY APPLICABLE LAW, YEARNIT DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. YEARNIT WILL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM THE USE OF ANY PRODUCT PURCHASED FROM THIRD-PARTY RETAILERS LINKED FROM THIS SITE, INCLUDING, BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, AND CONSEQUENTIAL DAMAGES.
              </p>
            </section>

            {/* Section 8: Grievance Officer & Contact Information */}
            <section id="contact" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                8. Grievance Officer & Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                For editorial inquiries, compliance clarifications, copyright claims, or consumer grievances under the Information Technology Act, 2000, please contact our designated representative:
              </p>
              <div className="bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg p-4 text-xs sm:text-sm text-[#333333] space-y-1">
                <p><strong>Entity:</strong> Yearnit Editorial & Compliance Team</p>
                <p><strong>Official Domain:</strong> <a href="https://yearnit.in" className="text-[#007185] hover:underline">https://yearnit.in</a></p>
                <p><strong>Direct Email:</strong> <a href="mailto:support@yearnit.in" className="text-[#007185] hover:underline font-semibold">support@yearnit.in</a></p>
                <p><strong>Jurisdiction:</strong> Tamil Nadu, India</p>
                <p><strong>Response Turnaround:</strong> Typically within 24–48 business hours</p>
              </div>
            </section>

            {/* Amazon-style "Was this information helpful?" Widget */}
            <div className="pt-6 border-t border-[#E7E7E7] bg-[#F7FAFA] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#565959]">
              {feedbackGiven ? (
                <div className="flex items-center gap-2 text-[#067D62] font-semibold">
                  <CheckCircleIcon className="w-5 h-5 text-[#067D62]" />
                  <span>Thank you for your feedback!</span>
                </div>
              ) : (
                <>
                  <span>Was this information helpful?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven(true)}
                      className="px-4 py-1.5 bg-white border border-[#D5D9D9] hover:bg-[#F0F2F2] rounded-md font-semibold text-[#0F1111] shadow-sm flex items-center gap-1.5 transition"
                    >
                      <HandThumbUpIcon className="w-3.5 h-3.5" />
                      <span>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven(true)}
                      className="px-4 py-1.5 bg-white border border-[#D5D9D9] hover:bg-[#F0F2F2] rounded-md font-semibold text-[#0F1111] shadow-sm flex items-center gap-1.5 transition"
                    >
                      <HandThumbDownIcon className="w-3.5 h-3.5" />
                      <span>No</span>
                    </button>
                  </div>
                </>
              )}

              <span className="text-[11px] text-[#565959]">
                Yearnit Conditions of Use • Document ID: YN-COU-2026
              </span>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
