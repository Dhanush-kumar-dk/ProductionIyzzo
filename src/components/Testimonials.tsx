import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

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
      "Yearnit feels like a classic, well-edited magazine. The pros and cons list is actually critical, not just praise disguised as a review.",
    author: "Rohan Iyer",
    role: "Independent Technology Journalist, Mumbai",
    initials: "RI",
  },
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = TESTIMONIALS[activeIdx];

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Centered Serif Section Title + Subtitle */}
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#1E2A24] tracking-tight">
          Testimonials
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-2 max-w-[60ch] mx-auto">
          Direct observations from readers and tech buyers relying on our testing laboratory.
        </p>
      </div>

      {/* Large Quote Layout */}
      <div className="max-w-[920px] mx-auto bg-white rounded-[24px] border border-[#E3E8E2] p-8 sm:p-12 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
          {/* Rounded Gray Avatar Square on Left */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] bg-[#E6EAE5] flex items-center justify-center flex-shrink-0">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#4F6F5D]">
              {current.initials}
            </span>
            {/* Pastel quote glyph indicator */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#DDD5F0] text-[#6B4FB3] flex items-center justify-center text-xs font-serif font-bold shadow-xs">
              “
            </div>
          </div>

          {/* Quote Text + Author Info on Right */}
          <div className="flex-1 space-y-4">
            <p className="font-serif text-lg sm:text-xl text-[#1E2A24] leading-relaxed italic">
              "{current.quote}"
            </p>
            <div>
              <p className="font-sans font-semibold text-xs sm:text-sm text-[#1E2A24]">
                {current.author}
              </p>
              <p className="font-sans text-xs text-[#7B857F]">
                {current.role}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel selector dots for testimonials */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-[#E3E8E2]">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`h-2 transition-all rounded-full ${
                activeIdx === i ? "w-6 bg-[#4F6F5D]" : "w-2 bg-[#CBD3CB]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thin Horizontal Divider with Right-Aligned Link */}
      <div className="max-w-[920px] mx-auto mt-8 pt-4 border-t border-[#E3E8E2] flex justify-end">
        <a
          href="/about"
          className="font-sans text-xs font-medium text-[#4F6F5D] hover:underline flex items-center gap-1 text-decoration-none"
        >
          <span>Read all testimonials</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
