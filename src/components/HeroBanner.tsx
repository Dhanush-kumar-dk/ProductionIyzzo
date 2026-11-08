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

// Cloned boundaries for continuous infinite sliding: [Clone(Slide3), Slide1, Slide2, Slide3, Clone(Slide1)]
const extendedSlides: Slide[] = [
  slides[slides.length - 1],
  ...slides,
  slides[0],
];

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Preload all slides in background for zero-latency instant rendering
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  const nextSlide = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitionEnabled(true);
    setDisplayIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitionEnabled(true);
    setDisplayIndex((prev) => prev - 1);
  };

  const goToSlide = (idx: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitionEnabled(true);
    setDisplayIndex(idx + 1);
  };

  // Seamless Infinite Looping: Reset position on clone boundary with zero flash
  const handleTransitionEnd = () => {
    isTransitioningRef.current = false;
    if (displayIndex >= extendedSlides.length - 1) {
      setIsTransitionEnabled(false);
      setDisplayIndex(1);
    } else if (displayIndex <= 0) {
      setIsTransitionEnabled(false);
      setDisplayIndex(slides.length);
    }
  };

  // Re-enable transition on the next animation frame after silent snap
  useEffect(() => {
    if (!isTransitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitionEnabled]);

  // Running carousel: auto-advance smoothly every 4.8s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4800);
    return () => clearInterval(timer);
  }, [isPaused, displayIndex]);

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

  // Active indicator dot calculation
  const activeDot = (displayIndex - 1 + slides.length) % slides.length;

  return (
    <section 
      aria-label="Promotional Carousel" 
      className="w-full flex justify-center items-center px-2 sm:px-6 lg:px-12 pt-2 sm:pt-4 font-poppins select-none"
    >
      <div
        className="relative w-full max-w-7xl mx-auto aspect-[1376/643] overflow-hidden rounded-xl sm:rounded-3xl shadow-lg sm:shadow-2xl bg-[#090D16] group cursor-pointer transition-shadow"
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
        {/* Animated Running Sliding Track: Exact aspect ratio matching the banner images for 100% fit */}
        <div
          className={`flex h-full ${
            isTransitionEnabled
              ? "transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]"
              : "transition-none"
          }`}
          style={{
            width: `${extendedSlides.length * 100}%`,
            transform: `translate3d(-${(displayIndex * 100) / extendedSlides.length}%, 0, 0)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              style={{ width: `${100 / extendedSlides.length}%` }}
              className="shrink-0 h-full w-full relative overflow-hidden bg-[#090D16] flex items-center justify-center"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-contain object-center block select-none pointer-events-none group-hover:scale-[1.012] transition-transform duration-700 ease-out"
                loading={idx === 1 || idx === 2 ? "eager" : "lazy"}
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
          ))}
        </div>

        {/* Floating Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white/95 backdrop-blur-md transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-none"
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
          className="absolute right-2 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white/95 backdrop-blur-md transition-all opacity-85 sm:opacity-0 group-hover:opacity-100 shadow-md sm:shadow-lg hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-none"
          aria-label="Next Slide"
        >
          <ChevronRightIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Reference-Styled Indicator Dots (Active Orange Pill + Round Inactive Dots) */}
        <div 
          className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 xs:gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(idx);
              }}
              className="p-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  idx === activeDot 
                    ? "w-6 xs:w-7 sm:w-8 h-1.5 sm:h-2 bg-[#f97316] shadow-sm" 
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/90"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
