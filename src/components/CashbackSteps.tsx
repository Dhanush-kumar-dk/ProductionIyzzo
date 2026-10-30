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
  badgeIcon: "login" | "shop" | "wallet";
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  actionType: "login" | "shop" | "info";
}

const stepsData: StepItem[] = [
  {
    number: "01",
    badgeIcon: "login",
    title: "Login / Sign up",
    description: "Verify your mobile number in seconds. No card, no hidden fees",
    mascotSrc: mascot1,
    mascotAlt: "Mascot with smartphone login screen",
    actionType: "login",
  },
  {
    number: "02",
    badgeIcon: "shop",
    title: "Choose Store & Shop",
    description: "Tap any brand banner to activate extra cashback before you checkout",
    mascotSrc: mascot2,
    mascotAlt: "Mascot pushing shopping cart with items",
    actionType: "shop",
  },
  {
    number: "03",
    badgeIcon: "wallet",
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
      aria-label="Three steps Towards Cashback"
      className="w-full px-3 sm:px-6 lg:px-8 py-8 sm:py-12 font-poppins"
    >
      <div className="max-w-xl sm:max-w-2xl mx-auto">
        {/* Section Heading */}
        <div className="mb-5 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight">
            Three steps Towards Cashback
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5">
            Start saving on every purchase with simple, transparent rewards.
          </p>
        </div>

        {/* 3 Stacked Cards (Matching Mobile Design on All Screens) */}
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {stepsData.map((step) => (
            <div
              key={step.number}
              onClick={() => handleAction(step.actionType)}
              className="group relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white border border-gray-100/90 hover:border-orange-200/90 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(255,107,32,0.10)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-between"
            >
              {/* Subtle top-left warm orange glow */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-gradient-to-br from-orange-400/10 via-amber-300/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-orange-500/15 transition-all duration-500" />

              {/* Faint Big Watermark Number (top-right) */}
              <span
                aria-hidden="true"
                className="absolute top-2 sm:top-3 right-4 sm:right-6 font-black text-4xl sm:text-5xl md:text-6xl text-[#E9ECEF]/70 group-hover:text-orange-100/80 transition-colors duration-300 select-none pointer-events-none tracking-tighter leading-none"
              >
                {step.number}
              </span>

              {/* Left Content Area (Icon, Title, Description) */}
              <div className="relative z-10 flex-1 min-w-0 pr-3 sm:pr-4">
                {/* Orange Rounded Square Icon Badge */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FF6B20] to-[#F15000] flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0 mb-2 sm:mb-2.5">
                  {step.badgeIcon === "login" && (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 16 14 12 10 8" />
                      <line x1="14" y1="12" x2="4" y2="12" />
                    </svg>
                  )}
                  {step.badgeIcon === "shop" && (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  )}
                  {step.badgeIcon === "wallet" && (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                      <path d="M16 3H4a2 2 0 0 0-2 2v2" />
                      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-gray-950 tracking-tight leading-snug group-hover:text-orange-600 transition-colors duration-200">
                  {step.title}
                </h3>

                {/* Subtitle / Description */}
                <p className="text-[11px] sm:text-xs text-gray-500 font-normal leading-relaxed mt-1 max-w-[210px] sm:max-w-[280px]">
                  {step.description}
                </p>
              </div>

              {/* Right Mascot Illustration */}
              <div className="relative z-10 flex-shrink-0 w-24 sm:w-28 md:w-32 flex items-center justify-end">
                <img
                  src={step.mascotSrc}
                  alt={step.mascotAlt}
                  className="w-20 sm:w-24 md:w-28 h-auto object-contain select-none pointer-events-none drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CashbackSteps;
