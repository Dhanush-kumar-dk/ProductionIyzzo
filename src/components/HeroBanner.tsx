import { useState, useEffect } from "react";
import Image1 from "../assets/image1.jpg";
import Image2 from "../assets/image2.jpg";
import Image3 from "../assets/image3.jpg";
import { ChevronLeftIcon, ChevronRightIcon, FireIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

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
    tag: "⚡ MEGA DEALS FESTIVAL",
    title: "Handpicked Amazon Deals",
    highlight: "Up to 70% Off",
    description: "Exclusive curated discounts on top-rated electronics, audio, smart watches, and home essentials.",
    bgGradient: "from-blue-900 via-indigo-900 to-slate-900",
    image: Image1,
    ctaText: "Explore Top Deals",
  },
  {
    id: 2,
    tag: "🔥 BEST VALUE FINDS",
    title: "Trending Tech & Lifestyle",
    highlight: "Special Member Pricing",
    description: "Verified affiliate price drops updated hourly. Prime eligible with fast delivery right to your door.",
    bgGradient: "from-emerald-950 via-teal-900 to-slate-900",
    image: Image2,
    ctaText: "Shop Daily Drops",
  },
  {
    id: 3,
    tag: "✨ PRIME EXCLUSIVE",
    title: "Premium Sound & Gadgets",
    highlight: "Massive Price Cuts",
    description: "Experience high-fidelity wireless audio and premium accessories with guaranteed Amazon checkout protection.",
    bgGradient: "from-purple-950 via-slate-900 to-gray-950",
    image: Image3,
    ctaText: "Grab Deal Now",
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
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-center">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-opacity duration-1000 flex items-center ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background image overlay with blend */}
            <div className="absolute inset-0 opacity-25 mix-blend-overlay">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter blur-[1px]"
              />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
              <div className="md:col-span-7 space-y-4 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-semibold tracking-wider text-amber-300">
                  <FireIcon className="w-4 h-4 text-amber-400" />
                  {slide.tag}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 mt-1">
                    {slide.highlight}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-gray-200 max-w-lg leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={onExploreClick}
                    className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {slide.ctaText} →
                  </button>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-black/30 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                    <span>Official Amazon Associate Portal</span>
                  </div>
                </div>
              </div>

              {/* Right featured banner image */}
              <div className="hidden md:flex md:col-span-5 justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-1000"></div>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="relative w-72 sm:w-80 md:w-96 aspect-[4/3] object-cover rounded-2xl shadow-2xl border border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Indicator dots */}
        <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i ? "bg-amber-400 w-8" : "bg-white/40 w-2 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
