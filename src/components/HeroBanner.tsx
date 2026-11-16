import { useState, useEffect, useRef, useCallback } from "react";
import Image1 from "../assets/banner_1.png";
import Image2 from "../assets/banner_2.png";
import Image3 from "../assets/banner_3.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: Image1,
    alt: "Upgrade Your Life with Amazon — Better Products. Greater Savings.",
  },
  {
    id: 2,
    image: Image2,
    alt: "Your Next Big Deal Awaits! — Explore top-rated products on Amazon",
  },
  {
    id: 3,
    image: Image3,
    alt: "Shop Smarter, Save Bigger — Discover the best deals on Amazon",
  },
];

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 40;

export default function HeroBanner({ onExploreClick }: { onExploreClick: () => void }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(
    () => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1)),
    []
  );

  // Preload every slide so switching is instant
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  // Autoplay (pauses on hover / touch)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isPaused, next, current]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > SWIPE_THRESHOLD) diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 " +
    "text-white backdrop-blur-md transition-all duration-300 shadow-lg " +
    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      className="w-full pt-3 sm:pt-4"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 shadow-xl cursor-pointer select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
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
        {/*
          All slides share one grid cell. The container's height is set by the
          images themselves (w-full h-auto), so any banner is shown in full,
          never cropped, and scales fluidly at every screen width.
        */}
        <div className="grid">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              aria-hidden={idx !== current}
              className={`col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                idx === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className={`${arrowClass} left-2 sm:left-4`}
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className={`${arrowClass} right-2 sm:right-4`}
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dots */}
        <div
          className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              type="button"
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === current}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 focus:outline-none ${
                idx === current
                  ? "w-6 sm:w-8 bg-[#FFD814]"
                  : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}