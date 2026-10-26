import { useState, useEffect } from "react";
import { BoltIcon, SparklesIcon } from "@heroicons/react/24/solid";

export default function FlashDealsBar() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-2 font-poppins">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-yellow-200">
            <BoltIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-orange-600 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                Lightning Deals
              </span>
              <span className="text-xs text-white/90 hidden sm:inline-flex items-center gap-1">
                <SparklesIcon className="w-3.5 h-3.5 text-yellow-200" />
                Amazon Prime Verified Discounts
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
              Today's Best Amazon Price Drops
            </h3>
          </div>
        </div>

        {/* Right Countdown Timer */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-black/25 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
          <span className="text-xs font-semibold text-yellow-200 uppercase tracking-wider mr-1">
            Ends In:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold">
            <span className="bg-white text-gray-900 px-2 py-1 rounded-md shadow-sm">
              {formatNumber(timeLeft.hours)}h
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-2 py-1 rounded-md shadow-sm">
              {formatNumber(timeLeft.minutes)}m
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-2 py-1 rounded-md shadow-sm">
              {formatNumber(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
