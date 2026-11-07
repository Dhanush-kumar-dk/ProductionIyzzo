import { useState, useEffect } from "react";
import Image1 from "../assets/image1.jpg";
import Image2 from "../assets/image2.jpg";
import Image3 from "../assets/image3.jpg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Slide {
  id: number;
  brand: string;
  badge: string;
  badgeBg: string;
  cashbackLabel: string;
  cashbackValue: string;
  bgGradient: string;
  textColor: string;
  image: string;
  ctaText: string;
}

const slides: Slide[] = [
  {
    id: 1,
    brand: "Yearnit",
    badge: "DIWALI JACKPOT SALE",
    badgeBg: "bg-yellow-400 text-gray-900",
    cashbackLabel: "Cashback on every purchase",
    cashbackValue: "Up to 8%",
    bgGradient: "from-pink-600 via-rose-500 to-pink-700",
    textColor: "text-white",
    image: Image1,
    ctaText: "Earn now ↗",
  },
  {
    id: 2,
    brand: "Shopsy",
    badge: "SHOPSY DIWALI MELA",
    badgeBg: "bg-yellow-300 text-purple-900",
    cashbackLabel: "Cashback on every purchase",
    cashbackValue: "Up to 8%",
    bgGradient: "from-purple-600 via-violet-600 to-purple-800",
    textColor: "text-white",
    image: Image2,
    ctaText: "Earn now ↗",
  },
  {
    id: 3,
    brand: "Dot & Key",
    badge: "UP TO 12.50% CASHBACK",
    badgeBg: "bg-orange-400 text-white",
    cashbackLabel: "Cashback on every purchase",
    cashbackValue: "Up to 12.50%",
    bgGradient: "from-orange-500 via-orange-400 to-red-500",
    textColor: "text-white",
    image: Image3,
    ctaText: "Earn now ↗",
  },
];

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => { setCurrent((prev) => (prev + 1) % slides.length); setAnimating(false); }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1)); setAnimating(false); }, 200);
  };

  const nextSlide = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent((prev) => (prev + 1) % slides.length); setAnimating(false); }, 200);
  };

  // Compute which 3 slides to show (current, next, next-next)
  const getSlideAt = (offset: number) => slides[(current + offset) % slides.length];

  return (
    <div className="w-full bg-white px-3 sm:px-6 lg:px-10 pt-4 pb-2 font-poppins">
      {/* ── Desktop: 3-Panel Side-by-Side ── */}
      <div className="hidden md:grid grid-cols-3 gap-3 relative">
        {[0, 1, 2].map((offset) => {
          const slide = getSlideAt(offset);
          return (
            <div
              key={slide.id}
              className={`relative overflow-hidden rounded-2xl min-h-[200px] lg:min-h-[240px] flex flex-col justify-between p-5 cursor-pointer
                bg-gradient-to-br ${slide.bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
              onClick={onExploreClick}
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-20 mix-blend-soft-light">
                <img src={slide.image} alt={slide.brand} className="w-full h-full object-cover object-center" />
              </div>

              {/* Top row: brand + badge */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm border border-white/30">
                    {slide.brand.charAt(0)}
                  </div>
                  <span className={`text-sm font-bold ${slide.textColor}`}>{slide.brand}</span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-lg tracking-wider leading-tight text-center max-w-[80px] ${slide.badgeBg}`}>
                  {slide.badge}
                </span>
              </div>

              {/* Cashback info */}
              <div className="relative z-10 mt-4">
                <p className={`text-xs font-medium ${slide.textColor} opacity-80`}>{slide.cashbackLabel}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-[10px]">Y</span>
                  </div>
                  <span className={`text-2xl lg:text-3xl font-black ${slide.textColor} leading-none`}>
                    {slide.cashbackValue}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="relative z-10 mt-4 self-start bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-200 group-hover:shadow-orange-500/40">
                {slide.ctaText}
              </button>
            </div>
          );
        })}

        {/* Nav arrows */}
        <button onClick={prevSlide} className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-orange-50 transition border border-gray-100">
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={nextSlide} className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-orange-50 transition border border-gray-100">
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* ── Mobile: Single Card Slider ── */}
      <div className="md:hidden relative overflow-hidden rounded-2xl">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-opacity duration-500 flex flex-col justify-between p-5 min-h-[200px]
              ${idx === current ? "opacity-100 relative" : "opacity-0 pointer-events-none"}`}
            onClick={onExploreClick}
          >
            <div className="absolute inset-0 opacity-15 mix-blend-soft-light">
              <img src={slide.image} alt={slide.brand} className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <span className={`text-base font-bold ${slide.textColor}`}>{slide.brand}</span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-lg ${slide.badgeBg}`}>{slide.badge}</span>
            </div>
            <div className="relative z-10">
              <p className={`text-xs ${slide.textColor} opacity-80`}>{slide.cashbackLabel}</p>
              <span className={`text-2xl font-black ${slide.textColor}`}>{slide.cashbackValue}</span>
              <button className="mt-3 block bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow">
                {slide.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all duration-300 ${idx === current ? "w-6 h-2 bg-orange-500" : "w-2 h-2 bg-gray-300"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
