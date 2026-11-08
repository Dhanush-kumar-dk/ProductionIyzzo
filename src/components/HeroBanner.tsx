import { useState, useEffect, useRef } from "react";
import Image1 from "../assets/image1.jpg";
import Image2 from "../assets/image2.jpg";
import Image3 from "../assets/image3.jpg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Slide {
  id: number;
  title: string;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Top-Rated Electronics — Mobile, TV & Appliances",
    image: Image1,
    alt: "Top-Rated Electronics: Mobile, TV & Appliances — Discover the latest smartphones, smart TVs, and home appliances.",
  },
  {
    id: 2,
    title: "Curated Fashion Picks — Trends & Styles",
    image: Image2,
    alt: "Curated Fashion Picks: Trends & Styles — Discover the latest in apparel, footwear, and accessories.",
  },
  {
    id: 3,
    title: "Essential Accessories — Bags, Watches & More",
    image: Image3,
    alt: "Essential Accessories: Bags, Watches & More — Complete your look with premium accessories and everyday essentials.",
  },
];

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Preload slides for zero-latency swiping
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Auto-advance every 5.5 seconds, paused when user hovers or touches
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Gesture Detection with Vertical Scroll Guard
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

  return (
    <section 
      aria-label="Promotional Carousel" 
      className="w-full pt-2 sm:pt-3 pb-2 font-poppins select-none overflow-hidden"
    >
      <div
        className="relative w-full max-w-[1440px] mx-auto px-1 sm:px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Multi-Card Peeking Stage */}
        <div className="relative flex items-center justify-center gap-2.5 xs:gap-3 sm:gap-4 md:gap-5 w-full">
          {/* Left Peeking Slide */}
          <div
            onClick={prevSlide}
            role="button"
            tabIndex={0}
            aria-label={`Previous slide: ${slides[prevIndex].title}`}
            className="w-[78vw] xs:w-[74vw] sm:w-[480px] md:w-[540px] lg:w-[600px] xl:w-[640px] aspect-[2.14/1] h-[145px] xs:h-[165px] sm:h-[195px] md:h-[210px] shrink-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-md opacity-50 hover:opacity-80 transition-all duration-500 transform hover:scale-[1.01] bg-[#090D16]"
          >
            <img
              src={slides[prevIndex].image}
              alt=""
              className="w-full h-full object-cover object-center pointer-events-none"
              loading="lazy"
            />
          </div>

          {/* Center Active Slide */}
          <div
            onClick={onExploreClick}
            role="button"
            tabIndex={0}
            aria-label={`Active slide: ${slides[current].title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onExploreClick();
              }
            }}
            className="relative w-[78vw] xs:w-[74vw] sm:w-[480px] md:w-[540px] lg:w-[600px] xl:w-[640px] aspect-[2.14/1] h-[145px] xs:h-[165px] sm:h-[195px] md:h-[210px] shrink-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-xl sm:shadow-2xl ring-1 ring-white/15 dark:ring-white/10 transition-all duration-500 transform hover:scale-[1.012] z-10 bg-[#090D16]"
          >
            <img
              key={slides[current].id}
              src={slides[current].image}
              alt={slides[current].alt}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
              loading="eager"
              decoding="async"
              style={{
                imageRendering: "-webkit-optimize-contrast",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
                WebkitTransform: "translateZ(0)",
                transform: "translateZ(0)",
              }}
            />
          </div>

          {/* Right Peeking Slide */}
          <div
            onClick={nextSlide}
            role="button"
            tabIndex={0}
            aria-label={`Next slide: ${slides[nextIndex].title}`}
            className="w-[78vw] xs:w-[74vw] sm:w-[480px] md:w-[540px] lg:w-[600px] xl:w-[640px] aspect-[2.14/1] h-[145px] xs:h-[165px] sm:h-[195px] md:h-[210px] shrink-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-md opacity-50 hover:opacity-80 transition-all duration-500 transform hover:scale-[1.01] bg-[#090D16]"
          >
            <img
              src={slides[nextIndex].image}
              alt=""
              className="w-full h-full object-cover object-center pointer-events-none"
              loading="lazy"
            />
          </div>

          {/* Floating Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2 xs:left-4 sm:left-8 md:left-14 lg:left-24 top-1/2 -translate-y-1/2 z-20 p-1.5 xs:p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/80 text-white/95 backdrop-blur-md transition-all shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2 xs:right-4 sm:right-8 md:right-14 lg:right-24 top-1/2 -translate-y-1/2 z-20 p-1.5 xs:p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/80 text-white/95 backdrop-blur-md transition-all shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRightIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Reference-Styled Indicator Dots (Active Orange Pill + Round Inactive Dots) */}
        <div 
          className="flex items-center justify-center gap-1.5 xs:gap-2 mt-2.5 sm:mt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setCurrent(idx)}
              className="p-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  idx === current 
                    ? "w-6 xs:w-7 sm:w-8 h-1.5 sm:h-2 bg-[#f97316] shadow-sm" 
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
