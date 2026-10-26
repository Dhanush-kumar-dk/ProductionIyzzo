import { useState, useEffect } from "react";
import Image1 from "../assets/image1.jpg";
import Image2 from "../assets/image2.jpg";
import Image3 from "../assets/image3.jpg";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

interface Slide {
  id: number;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  bgGradient: string;
  image: string;
  ctaText: string;
}

const slides: Slide[] = [
  {
    id: 1,
    tag: "INDEPENDENT EDITORIAL SELECTION",
    title: "Honest Product Evaluations",
    highlight: "Tested & Researched",
    description: "In-depth buyer guides evaluating performance, durability, and practical utility across top electronics and everyday lifestyle essentials.",
    bgGradient: "from-blue-900 via-indigo-900 to-slate-900",
    image: Image1,
    ctaText: "Explore Buyer Guides",
  },
  {
    id: 2,
    tag: "UNBIASED BUYER BREAKDOWNS",
    title: "Clear Pros & Tradeoffs",
    highlight: "Transparent Insights",
    description: "We research real-world user feedback and manufacturer specs to highlight honest strengths and limitations before you purchase.",
    bgGradient: "from-slate-900 via-teal-950 to-slate-900",
    image: Image2,
    ctaText: "Browse Top Recommendations",
  },
  {
    id: 3,
    tag: "COMMUNITY TRUST & VALUE",
    title: "Quality Gear That Delivers",
    highlight: "Curated Recommendations",
    description: "Straightforward recommendations with verified specifications and direct links to official retailer product pages.",
    bgGradient: "from-slate-950 via-zinc-900 to-gray-950",
    image: Image3,
    ctaText: "View Featured Guides",
  },
];

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 pt-4">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[340px] sm:min-h-[400px] md:min-h-[440px] flex items-center">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-opacity duration-1000 flex items-center ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background image overlay with blend */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter blur-[1px]"
              />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
              <div className="md:col-span-8 space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-semibold tracking-wider text-amber-300">
                  <SparklesIcon className="w-4 h-4 text-amber-400" />
                  {slide.tag}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 mt-1">
                    {slide.highlight}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-gray-300 max-w-xl font-normal leading-relaxed">
                  {slide.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={onExploreClick}
                    className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 font-bold text-sm rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95"
                  >
                    {slide.ctaText}
                  </button>

                  <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Independent Research & Direct Store Links</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition"
          aria-label="Previous Slide"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition"
          aria-label="Next Slide"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-amber-400" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
