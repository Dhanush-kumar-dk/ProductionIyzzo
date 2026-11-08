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

// Cloned slides for continuous infinite looping: [Slide3, Slide1, Slide2, Slide3, Slide1]
const extendedSlides: Slide[] = [
  slides[slides.length - 1],
  ...slides,
  slides[0],
];

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const [metrics, setMetrics] = useState({ containerWidth: 0, cardWidth: 0, gap: 16 });

  // Measure container and card size dynamically on mount and resize
  useEffect(() => {
    const updateMetrics = () => {
      if (containerRef.current && cardRef.current) {
        const cWidth = containerRef.current.offsetWidth;
        const cCard = cardRef.current.offsetWidth;
        const gapVal = window.innerWidth >= 768 ? 20 : window.innerWidth >= 640 ? 16 : 12;
        setMetrics({ containerWidth: cWidth, cardWidth: cCard, gap: gapVal });
      }
    };

    updateMetrics();
    // Re-check after a tick for fonts/layout to settle
    const t = setTimeout(updateMetrics, 50);
    window.addEventListener("resize", updateMetrics);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  // Preload slides for zero-latency instant rendering
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

  // Seamless Infinite Looping via Transition Reset
  const handleTransitionEnd = () => {
    isTransitioningRef.current = false;
    if (displayIndex >= extendedSlides.length - 1) {
      // Reached cloned first slide -> silently snap back to real first slide
      setIsTransitionEnabled(false);
      setDisplayIndex(1);
    } else if (displayIndex <= 0) {
      // Reached cloned last slide -> silently snap back to real last slide
      setIsTransitionEnabled(false);
      setDisplayIndex(slides.length);
    }
  };

  // Re-enable CSS transition after snap-back
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

  // Running carousel: auto-advance every 4.8 seconds smoothly
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

  // Calculate pixel offset to keep active card exactly centered in viewport
  const { containerWidth, cardWidth, gap } = metrics;
  const translateX = cardWidth > 0 
    ? ((containerWidth - cardWidth) / 2) - displayIndex * (cardWidth + gap)
    : 0;

  // Active indicator dot calculation
  const activeDot = (displayIndex - 1 + slides.length) % slides.length;

  return (
    <section 
      aria-label="Promotional Carousel" 
      className="w-full pt-2 sm:pt-3 pb-3 font-poppins select-none overflow-hidden"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[1440px] mx-auto px-1 sm:px-2 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Running Sliding Track */}
        <div
          className={`flex items-center ${
            isTransitionEnabled 
              ? "transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" 
              : "transition-none"
          }`}
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            gap: `${gap}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, idx) => {
            const isActive = idx === displayIndex;
            return (
              <div
                key={`${slide.id}-${idx}`}
                ref={idx === 1 ? cardRef : null}
                onClick={() => {
                  if (isActive) {
                    onExploreClick();
                  } else if (idx < displayIndex) {
                    prevSlide();
                  } else {
                    nextSlide();
                  }
                }}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={slide.title}
                onKeyDown={(e) => {
                  if (isActive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onExploreClick();
                  }
                }}
                className={`w-[84vw] xs:w-[80vw] sm:w-[540px] md:w-[620px] lg:w-[680px] xl:w-[740px] aspect-[2.14/1] h-[165px] xs:h-[190px] sm:h-[235px] md:h-[265px] lg:h-[290px] shrink-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-[#090D16] ${
                  isActive 
                    ? "opacity-100 scale-100 shadow-xl sm:shadow-2xl ring-1 ring-white/15 dark:ring-white/10 z-10" 
                    : "opacity-55 hover:opacity-85 scale-[0.98] shadow-md z-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
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
            );
          })}
        </div>

        {/* Floating Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 xs:left-4 sm:left-6 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/85 text-white/95 backdrop-blur-md transition-all shadow-md sm:shadow-xl hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Previous Slide"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 xs:right-4 sm:right-6 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/85 text-white/95 backdrop-blur-md transition-all shadow-md sm:shadow-xl hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Next Slide"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Reference-Styled Indicator Dots (Active Orange Pill + Round Inactive Dots) */}
        <div 
          className="flex items-center justify-center gap-1.5 xs:gap-2 mt-3 sm:mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => goToSlide(idx)}
              className="p-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  idx === activeDot 
                    ? "w-7 xs:w-8 sm:w-9 h-1.5 sm:h-2 bg-[#f97316] shadow-sm" 
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
