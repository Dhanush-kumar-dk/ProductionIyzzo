import { useState, useEffect } from "react";
import TopBar from "./TopBar";
import Footer from "./Footer";
import LogIn from "./Login";
import { updateSEO } from "../utils/seo";
import {
  ChevronRightIcon,
  PrinterIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function AffiliateDisclosure() {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [openLogIn, setOpenLogIn] = useState(false);

  useEffect(() => {
    updateSEO({
      title: "Amazon Associates Affiliate Disclosure & Transparency Policy | Yearnit",
      description:
        "Official Amazon Associates Operating Agreement disclosure and referral mechanics statement for Yearnit. Transparency in product recommendations and monetization.",
      url: "https://yearnit.in/affiliate-disclosure",
      type: "article",
      keywords: [
        "Amazon Affiliate Disclosure",
        "Associates Program Statement",
        "Yearnit Transparency",
        "Referral Commissions Notice",
      ],
    });
  }, []);

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
            Amazon Associates Operating Agreement & Affiliate Disclosure
          </span>
        </nav>

        {/* 2-Column Amazon Layout: Left Sidebar + Main Help Document */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Help Topics & Legal Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-xl border border-[#D5D9D9] p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F1111] pb-2 border-b border-[#E7E7E7]">
              Disclosure Topics
            </h3>

            <ul className="space-y-1.5 text-xs text-[#007185]">
              <li>
                <a
                  href="#operating-statement"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] font-semibold text-[#0F1111] bg-[#F0F2F2]"
                >
                  › 1. Statutory Associates Declaration
                </a>
              </li>
              <li>
                <a
                  href="#referral-mechanics"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 2. How Affiliate Links Work
                </a>
              </li>
              <li>
                <a
                  href="#pricing-availability"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 3. Pricing & Availability Disclaimer
                </a>
              </li>
              <li>
                <a
                  href="#non-affiliation-trademarks"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 4. Non-Affiliation & Trademarks
                </a>
              </li>
              <li>
                <a
                  href="#editorial-independence"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 5. Editorial Integrity Policy
                </a>
              </li>
              <li>
                <a
                  href="#merchant-fulfillment"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 6. Merchant Fulfillment & Support
                </a>
              </li>
              <li>
                <a
                  href="#compliance-contact"
                  className="block py-1 px-2 rounded hover:bg-[#F0F2F2] hover:underline"
                >
                  › 7. Inquiries & Compliance Contact
                </a>
              </li>
            </ul>

            <div className="pt-3 border-t border-[#E7E7E7] text-xs space-y-2">
              <span className="font-bold text-[#0F1111] block">Related Policies:</span>
              <a href="/about" className="text-[#007185] hover:underline block">
                • About Yearnit & Conditions of Use
              </a>
              <a href="/privacy-policy" className="text-[#007185] hover:underline block">
                • Privacy Notice
              </a>
              <a href="/terms" className="text-[#007185] hover:underline block">
                • Terms of Service
              </a>
              <a href="/contact" className="text-[#007185] hover:underline block">
                • Customer Support
              </a>
            </div>

            <div className="pt-3 border-t border-[#E7E7E7] text-xs space-y-2">
              <span className="font-bold text-[#0F1111] block">Featured Product Guides:</span>
              <a href="/product/B09N3ZNHTY" className="text-[#007185] hover:underline block">
                • boAt Airdopes 141 Review
              </a>
              <a href="/product/B0CHX1W1XY" className="text-[#007185] hover:underline block">
                • Apple iPhone 15 Breakdown
              </a>
              <a href="/product/B09G9FPHP6" className="text-[#007185] hover:underline block">
                • Sony WH-1000XM5 ANC Review
              </a>
              <a href="/product/B0C7771Z11" className="text-[#007185] hover:underline block">
                • OnePlus Nord CE 3 Lite Guide
              </a>
              <a href="/#featured-catalog" className="text-[#007185] hover:underline font-semibold block pt-1">
                Explore Full Store Catalog →
              </a>
            </div>
          </aside>

          {/* Main Document Content */}
          <article className="lg:col-span-9 bg-white rounded-xl border border-[#D5D9D9] p-6 sm:p-10 shadow-sm space-y-8 leading-relaxed">
            {/* Header & Print Control */}
            <div className="border-b border-[#E7E7E7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1111] tracking-tight">
                  Amazon Associates Operating Agreement & Affiliate Disclosure
                </h1>
                <p className="text-xs text-[#565959] mt-1">
                  Last updated: <strong>October 27, 2026</strong> • Official Transparency Document for Yearnit (https://yearnit.in)
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
              In strict accordance with the <strong>Amazon Associates Program Operating Agreement</strong> and the <strong>Amazon Associates Program Policies</strong>, Yearnit publishes this detailed disclosure regarding its commercial relationships, affiliate link mechanisms, and editorial review policies.
            </p>

            {/* Section 1: Statutory Operating Agreement Statement */}
            <section id="operating-statement" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                1. Statutory Operating Agreement Declaration
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                As required under Section 5 of the Amazon Associates Program Operating Agreement:
              </p>

              {/* Amazon Callout Box */}
              <div className="bg-[#FFFDF5] border border-[#F59E0B] rounded-lg p-4 text-xs sm:text-sm text-[#0F1111] space-y-2">
                <p className="font-bold text-[#B45309] uppercase tracking-wider text-xs">
                  Mandatory Operating Agreement Disclosure:
                </p>
                <p className="text-sm sm:text-base font-extrabold italic text-[#0F1111]">
                  "As an Amazon Associate I earn from qualifying purchases."
                </p>
                <p className="text-xs text-[#565959] leading-relaxed pt-1">
                  Yearnit (https://yearnit.in) is a participant in the Amazon Associates Program, an affiliate advertising initiative designed to provide a means for websites to earn advertising fees by linking to Amazon.in and affiliated marketplaces.
                </p>
              </div>
            </section>

            {/* Section 2: How Affiliate Links Work */}
            <section id="referral-mechanics" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                2. How Affiliate Referral Links Work
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                When you click an outbound product link on Yearnit that directs to Amazon.in, a designated tracking identifier (Associate Partner Tag: <code className="bg-[#F0F2F2] px-1.5 py-0.5 rounded text-xs font-mono text-[#0F1111]">tag=dk29112306-21</code>) is appended to the destination URL.
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-[#333333] space-y-1.5">
                <li>
                  <strong>Qualifying Purchases:</strong> If you navigate to Amazon through our link and add a qualifying product to your cart within the standard referral session window, Amazon pays Yearnit a nominal advertising referral commission.
                </li>
                <li>
                  <strong>Zero Additional Cost to You:</strong> The commission paid to Yearnit is disbursed exclusively by Amazon from their marketing budget. The price you pay on Amazon is 100% identical whether you use our link or browse directly to Amazon.com or Amazon.in.
                </li>
                <li>
                  <strong>No Cloaking or Misdirection:</strong> Every affiliate link on Yearnit directs openly and directly to the official Amazon.in product detail page with transparent <code className="bg-[#F0F2F2] px-1 rounded text-xs">rel="sponsored nofollow noopener"</code> attributes.
                </li>
              </ul>
            </section>

            {/* Section 3: Pricing & Availability Disclaimer */}
            <section id="pricing-availability" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                3. Product Pricing & Availability Terms
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                In accordance with Amazon Program Participation Requirements regarding accurate representation of price and stock:
              </p>

              {/* Amazon Callout Box */}
              <div className="bg-[#FFFDF5] border border-[#E77600] rounded-lg p-3.5 text-xs sm:text-sm text-[#0F1111] leading-relaxed italic">
                "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product."
              </div>

              <p className="text-xs sm:text-sm text-[#333333]">
                Merchant prices, coupon redemptions, and warehouse availability fluctuate continuously based on merchant inventories. While Yearnit monitors catalog updates, Yearnit cannot guarantee that any displayed price or discount is current at the moment of your visit. Always confirm the final binding price on the official Amazon checkout page.
              </p>
            </section>

            {/* Section 4: Non-Affiliation & Trademarks */}
            <section id="non-affiliation-trademarks" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                4. Non-Affiliation & Trademarks Notice
              </h2>
              <div className="bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg p-3.5 text-xs sm:text-sm text-[#0F1111] font-semibold">
                Yearnit is an independent review and consumer guidance platform. Yearnit is not affiliated with, endorsed by, or sponsored by Amazon.com, Inc. or Amazon Seller Services Pvt. Ltd.
              </div>
              <p className="text-xs sm:text-sm text-[#333333]">
                Amazon, Kindle, Echo, Alexa, and the Amazon logo are registered trademarks of Amazon.com, Inc. or its affiliates. All other product names, logos, and brands featured on this website are the trademarks of their respective owners. Their mention on Yearnit does not imply endorsement or commercial affiliation.
              </p>
            </section>

            {/* Section 5: Editorial Integrity Policy */}
            <section id="editorial-independence" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                5. Editorial Independence & Integrity Policy
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                Yearnit operates with complete editorial autonomy. Our editorial policy enforces the following commitments:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-[#333333] space-y-1.5">
                <li>
                  <strong>No Paid Placements:</strong> We do not accept payment, free review samples, or sponsorship to fabricate positive evaluations or prioritize specific sellers.
                </li>
                <li>
                  <strong>Transparent Tradeoffs:</strong> We routinely point out product weaknesses, ergonomic flaws, and budget alternatives to help consumers avoid poor purchases.
                </li>
                <li>
                  <strong>No Copied Reviews:</strong> All summaries and evaluation breakdowns on Yearnit represent independent synthesis by our research staff, never scraped Amazon customer reviews or copied star ratings.
                </li>
              </ul>
            </section>

            {/* Section 6: Merchant Order Fulfillment & Support */}
            <section id="merchant-fulfillment" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                6. Customer Support, Shipping & Merchant Responsibilities
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                Yearnit does not process orders or accept consumer payments. When you purchase an item via our Amazon referral link:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-[#333333] space-y-1.5">
                <li>
                  All payment processing, order fulfillment, shipping, and delivery are performed exclusively by Amazon or authorized marketplace sellers.
                </li>
                <li>
                  Product warranties, returns, cancellations, and customer service inquiries are handled directly through your Amazon Customer Account.
                </li>
              </ul>
            </section>

            {/* Section 7: Inquiries & Compliance Contact */}
            <section id="compliance-contact" className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-1.5">
                7. Inquiries & Compliance Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]">
                If you have questions regarding our participation in the Amazon Associates Program or our affiliate disclosures, please direct your inquiry to our compliance desk:
              </p>
              <div className="bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg p-4 text-xs sm:text-sm text-[#333333] space-y-1">
                <p><strong>Entity:</strong> Yearnit Editorial & Compliance Team</p>
                <p><strong>Official Website:</strong> <a href="https://yearnit.in" className="text-[#007185] hover:underline">https://yearnit.in</a></p>
                <p><strong>Direct Inquiries:</strong> <a href="mailto:support@yearnit.in" className="text-[#007185] hover:underline font-semibold">support@yearnit.in</a></p>
                <p><strong>Jurisdiction:</strong> Tamil Nadu, India</p>
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
                Amazon Associates Disclosure • Document ID: YN-AAD-2026
              </span>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
