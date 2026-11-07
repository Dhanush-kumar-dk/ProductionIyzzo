import { FC } from "react";
import mascot1 from "../assets/step1-mascot@2x.png";
import mascot2 from "../assets/step2-mascot@2x.png";
import mascot3 from "../assets/step3-mascot@2x.png";

interface CashbackStepsProps {
  onLoginClick?: () => void;
  onShopClick?: () => void;
}

interface StepItem {
  number: string;
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  actionType: "login" | "shop" | "info";
  iconType: "login" | "shop" | "wallet";
}

const stepsData: StepItem[] = [
  {
    number: "01",
    iconType: "login",
    title: "Login / Sign up",
    description: "Verify your mobile number in seconds. No card, no hidden fees",
    mascotSrc: mascot1,
    mascotAlt: "Mascot with smartphone login screen",
    actionType: "login",
  },
  {
    number: "02",
    iconType: "shop",
    title: "Choose Store & Shop",
    description: "Tap any brand banner to activate extra cashback before you checkout",
    mascotSrc: mascot2,
    mascotAlt: "Mascot pushing shopping cart with items",
    actionType: "shop",
  },
  {
    number: "03",
    iconType: "wallet",
    title: "Earn & Withdraw",
    description: "Watch your wallet balance grow and transfer real cashback to your bank anytime",
    mascotSrc: mascot3,
    mascotAlt: "Mascot holding cash, coins, wallet and bank",
    actionType: "info",
  },
];

export const CashbackSteps: FC<CashbackStepsProps> = ({
  onLoginClick,
  onShopClick,
}) => {
  const handleAction = (type: "login" | "shop" | "info") => {
    if (type === "login" && onLoginClick) {
      onLoginClick();
    } else if (type === "shop" && onShopClick) {
      onShopClick();
    }
  };

  return (
    <section
      aria-label="How It Works - Three steps Towards Cashback"
      className="w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-14 font-poppins bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-left">
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            HOW HYYZO WORKS
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Three steps Towards Cashback
          </h2>
        </div>

        {/* 3 Side-by-Side Cards (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {stepsData.map((step) => (
            <div
              key={step.number}
              onClick={() => handleAction(step.actionType)}
              className="group relative overflow-hidden rounded-[24px] bg-white border border-gray-100 p-5 lg:p-6 shadow-[0_-6px_22px_rgba(255,107,32,0.12),0_10px_28px_rgba(0,0,0,0.04)] hover:shadow-[0_-8px_28px_rgba(255,107,32,0.18),0_14px_36px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[175px]"
            >
              {/* Top ambient orange blur highlight */}
              <div
                aria-hidden="true"
                className="absolute -top-12 inset-x-8 h-12 bg-orange-400/25 blur-xl pointer-events-none rounded-full group-hover:bg-orange-500/35 transition-colors duration-300"
              />

              {/* Card Top: Orange Square Icon & Large Number */}
              <div className="relative z-10 flex items-start justify-between">
                {/* Orange rounded icon button */}
                <div className="w-10 h-10 rounded-xl bg-[#F25C05] flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200">
                  {step.iconType === "login" && (
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  )}
                  {step.iconType === "shop" && (
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  {step.iconType === "wallet" && (
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="13" rx="2.5" />
                      <path d="M16 12.5a1 1 0 1 0 0-1 1 1 0 0 0 0 1z" fill="currentColor" />
                      <path d="M2 10h20" />
                    </svg>
                  )}
                </div>

                {/* Big faint watermark number */}
                <span
                  aria-hidden="true"
                  className="font-extrabold text-3xl sm:text-4xl text-gray-200/90 group-hover:text-orange-200 transition-colors duration-200 select-none tracking-tight leading-none"
                >
                  {step.number}
                </span>
              </div>

              {/* Card Bottom: Text on left, Mascot on right */}
              <div className="relative z-10 flex items-end justify-between gap-3 mt-4">
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 tracking-tight leading-snug group-hover:text-orange-600 transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-normal leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>

                {/* Mascot image */}
                <div className="flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 flex items-end justify-end">
                  <img
                    src={step.mascotSrc}
                    alt={step.mascotAlt}
                    className="max-h-20 sm:max-h-24 w-auto object-contain select-none pointer-events-none drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CashbackSteps;
