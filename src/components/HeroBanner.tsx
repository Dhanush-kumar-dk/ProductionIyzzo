import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface HeroSlide {
  id: number;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  stats: { value: string; label: string }[];
  categoryTarget: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    eyebrow: "Independent curation & lab audits",
    titleLine1: "Top-Rated Electronics",
    titleLine2: "MOBILE, TV & APPLIANCES",
    description:
      "Discover the latest lab-audited phones, noise-canceling earbuds, and smart appliances benchmarked across battery endurance, build quality, and real-world value.",
    primaryCta: "Shop the Latest",
    secondaryCta: "Certified & Warranty Protected",
    stats: [
      { value: "2,400+ Hrs", label: "Lab Tested" },
      { value: "100%", label: "Unbiased Verdicts" },
      { value: "0 Paid", label: "Brand Sponsorships" },
    ],
    categoryTarget: "Electronics",
  },
  {
    id: 2,
    eyebrow: "Acoustics & Sound Benchmarks",
    titleLine1: "True Wireless & Audio",
    titleLine2: "STUDIO DRIVERS & NOISE CANCELLING",
    description:
      "Exhaustive frequency response curves, active noise-cancelling attenuation trials, and microphone clarity recordings in busy street conditions.",
    primaryCta: "Explore Audio Picks",
    secondaryCta: "Review Testing Protocols",
    stats: [
      { value: "180+ Models", label: "Headphones Measured" },
      { value: "±0.5 dB", label: "Measurement Precision" },
      { value: "48 Hrs", label: "Average Battery Stress" },
    ],
    categoryTarget: "Audio",
  },
  {
    id: 3,
    eyebrow: "Home & Everyday Performance",
    titleLine1: "Modern Home Essentials",
    titleLine2: "KITCHEN, CLIMATE & SMART LIVING",
    description:
      "Tested for daily durability in Indian households — energy efficiency measurements, thermal thermal cameras, and mechanical stress evaluations.",
    primaryCta: "View Living Guides",
    secondaryCta: "Safety & Efficiency Benchmarks",
    stats: [
      { value: "350+ Homes", label: "Reader Cohort Tests" },
      { value: "5-Year", label: "Component Durability" },
      { value: "100%", label: "Lab Verified Specs" },
    ],
    categoryTarget: "Home",
  },
];

const AUTOPLAY_MS = 6500;

export default function HeroBanner({
  onExploreClick,
  onCategorySelect,
}: {
  onExploreClick: () => void;
  onCategorySelect?: (cat: string) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((p) => (p === 0 ? HERO_SLIDES.length - 1 : p - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = HERO_SLIDES[current];

  const handlePrimaryClick = () => {
    if (onCategorySelect && slide.categoryTarget) {
      onCategorySelect(slide.categoryTarget);
    }
    onExploreClick();
  };

  const handleSecondaryClick = () => {
    const el = document.getElementById("research-lab");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      onExploreClick();
    }
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div
        className="relative w-full rounded-[24px] sm:rounded-[28px] bg-[#B5BEB5] text-[#1E2A24] overflow-hidden p-6 sm:p-10 md:p-14 transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle background ambient grain / texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/[0.04] pointer-events-none" />

        {/* Carousel Prev Arrow */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#1E2A24] shadow-subtle flex items-center justify-center transition hover:scale-105 z-20"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Carousel Next Arrow */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#1E2A24] shadow-subtle flex items-center justify-center transition hover:scale-105 z-20"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Slide Content */}
        <div className="relative z-10 max-w-[640px] flex flex-col items-start gap-4 sm:gap-5">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-sans font-medium tracking-wide text-[#1E2A24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F5D]" />
            <span>{slide.eyebrow}</span>
          </div>

          {/* Signature H1: Serif upright + Serif italic uppercase accent line */}
          <div className="space-y-1">
            <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-[56px] leading-[1.08] text-[#1E2A24] tracking-tight">
              {slide.titleLine1}
            </h1>
            <h2 className="font-serif italic uppercase text-xl sm:text-2xl lg:text-[30px] leading-[1.1] text-[#1E2A24] tracking-wide font-normal">
              {slide.titleLine2}
            </h2>
          </div>

          {/* Subtitle / Paragraph */}
          <p className="font-sans text-sm sm:text-base text-[#3F4A44] leading-relaxed max-w-[50ch]">
            {slide.description}
          </p>

          {/* Buttons: Primary Brand + Secondary White */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePrimaryClick}
              className="px-5 py-2.5 rounded-[10px] bg-[#4F6F5D] text-white text-xs sm:text-sm font-medium hover:bg-[#5E7F6C] transition shadow-subtle flex items-center gap-2"
            >
              <span>{slide.primaryCta}</span>
              <span>→</span>
            </button>
            <button
              onClick={handleSecondaryClick}
              className="px-5 py-2.5 rounded-[10px] bg-white border border-[#CBD3CB] text-[#1E2A24] text-xs sm:text-sm font-medium hover:bg-[#FAFBF8] transition"
            >
              {slide.secondaryCta}
            </button>
          </div>

          {/* Three-Stat Row */}
          <div className="w-full pt-6 sm:pt-8 mt-2 border-t border-black/[0.08] grid grid-cols-3 gap-4 sm:gap-8">
            {slide.stats.map((st) => (
              <div key={st.label} className="space-y-0.5">
                <span className="font-serif font-bold text-lg sm:text-2xl text-[#1E2A24] block">
                  {st.value}
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] text-[#3F4A44] font-medium tracking-tight block">
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                current === idx ? "w-6 bg-[#4F6F5D]" : "w-2 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
