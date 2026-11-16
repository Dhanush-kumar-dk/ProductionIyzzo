import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const TESTIMONIALS = [
  {
    quote:
      "The depth of evaluation here is refreshing. Unlike generic affiliate listings, Yearnit breaks down actual thermal throttling, real-world battery degradation, and build weaknesses before you buy.",
    author: "Abhinav Sharma",
    role: "Senior Systems Architect, Bengaluru",
    initials: "AS",
  },
  {
    quote:
      "I saved ₹4,200 on my smart TV purchase by following Yearnit's panel latency benchmark and price drop verification. Honest and totally hype-free.",
    author: "Pooja Deshmukh",
    role: "Product Designer, Pune",
    initials: "PD",
  },
  {
    quote:
      "Yearnit feels like a classic, well-edited review publication. The pros and cons list is actually critical, not just praise disguised as a review.",
    author: "Rohan Iyer",
    role: "Independent Technology Journalist, Mumbai",
    initials: "RI",
  },
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full mb-1">
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Reader Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Verified Buyer Reviews & Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Direct observations from readers and tech buyers relying on our testing laboratory.
          </p>
        </div>
        <a
          href="/about"
          className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
        >
          <span>Read all reader stories</span>
          <span>→</span>
        </a>
      </div>

      {/* 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between ${
              activeIdx === idx
                ? "bg-white border-orange-400 shadow-md ring-2 ring-orange-500/10"
                : "bg-white border-gray-200 shadow-sm hover:border-gray-300"
            }`}
            onClick={() => setActiveIdx(idx)}
          >
            <div>
              {/* Star Rating */}
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {t.initials}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                  {t.author}
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
