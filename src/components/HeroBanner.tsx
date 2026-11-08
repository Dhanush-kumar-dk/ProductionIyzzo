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
    alt: "Top-Rated Electronics: Mobile, TV & Appliances — Discover the latest smartphones, smart TVs, and home appliances. Shop the latest deals.",
  },
  {
    id: 2,
    title: "Curated Fashion Picks — Trends & Styles",
    image: Image2,
    alt: "Curated Fashion Picks: Trends & Styles — Discover the latest in apparel, footwear, and accessories. Shop the latest collection.",
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

  // Preload all slides in background for zero-latency mobile swiping
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

    // Only swipe if horizontal movement is dominant (avoid capturing normal page scrolling)
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

  return (
    <section 
      aria-label="Promotional Carousel" 
      className="w-full px-2 sm:px-6 lg:px-12 pt-2 sm:pt-4 font-poppins"
    >
      <div
        className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-xl sm:rounded-3xl shadow-lg sm:shadow-2xl bg-[#090D16] cursor-pointer group select-none transition-shadow"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={onExploreClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExploreClick();
          }
        }}
      >
        {/* Invisible natural spacer image to establish exact fit-content height across all mobile devices */}
        <img
          src={slides[0].image}
          alt=""
          aria-hidden="true"
          className="w-full h-auto block pointer-events-none select-none opacity-0 invisible"
        />

        {/* Slides */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            aria-hidden={idx !== current}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1440px"
              className="w-full h-full object-contain sm:object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                imageRendering: "-webkit-optimize-contrast",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
                WebkitTransform: "translateZ(0)",
                transform: "translateZ(0)",
                willChange: "transform, opacity",
              }}
            />
          </div>
        ))}

        {/* Carousel Navigation Arrows (Touch optimized) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-1.5 xs:left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 xs:p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white/95 backdrop-blur-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-none"
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
          className="absolute right-1.5 xs:right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 xs:p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white/95 backdrop-blur-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-none"
          aria-label="Next Slide"
        >
          <ChevronRightIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Thumb-friendly Dots Indicator */}
        <div 
          className="absolute bottom-1.5 xs:bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2.5 xs:px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              className="p-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  idx === current 
                    ? "w-5 xs:w-6 sm:w-8 bg-[#FFD814] shadow" 
                    : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/90"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
