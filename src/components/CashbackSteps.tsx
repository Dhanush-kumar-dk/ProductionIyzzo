import { FC } from "react";
import mascot1 from "../assets/step1-mascot@2x.png";
import mascot2 from "../assets/step2-mascot@2x.png";
import mascot3 from "../assets/step3-mascot@2x.png";

interface CashbackStepsProps {
  onLoginClick?: () => void;
  onShopClick?: () => void;
}

// Step 1: Door with arrow entering bracket (Login / Sign in)
const LoginDoorIcon: FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <polyline points="10 16 14 12 10 8" />
    <line x1="4" y1="12" x2="14" y2="12" />
  </svg>
);

// Step 2: Calendar / Storefront schedule icon
const CalendarShopIcon: FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2.5" />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2.5" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" strokeWidth="2" />
    <circle cx="8" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="8" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

// Step 3: Credit Card / Wallet withdrawal icon
const CreditCardIcon: FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
    <line x1="6" y1="15" x2="10" y2="15" strokeWidth="2.5" />
  </svg>
);

interface StepItem {
  number: string;
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  actionType: "login" | "shop" | "info";
  icon: FC<{ className?: string }>;
}

const stepsData: StepItem[] = [
  {
    number: "01",
    title: "Login / Sign up",
    description: "Verify your mobile number in seconds. No card, no hidden fees",
    mascotSrc: mascot1,
    mascotAlt: "Mascot with smartphone login verification",
    actionType: "login",
    icon: LoginDoorIcon,
  },
  {
    number: "02",
    title: "Choose Store & Shop",
    description: "Tap any brand banner to activate extra cashback before you checkout",
    mascotSrc: mascot2,
    mascotAlt: "Mascot shopping with cart and storefront",
    actionType: "shop",
    icon: CalendarShopIcon,
  },
  {
    number: "03",
    title: "Earn & Withdraw",
    description: "Watch your wallet balance grow and transfer real cashback to your bank anytime",
    mascotSrc: mascot3,
    mascotAlt: "Mascot with coins, wallet and bank cash",
    actionType: "info",
    icon: CreditCardIcon,
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
      aria-label="How Yearnit Works - Three steps Towards Cashback"
      className="w-full py-10 sm:py-14 font-poppins bg-white"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header matching design mockup */}
        <div className="mb-6 sm:mb-8 text-left">
          <p className="text-xs sm:text-[13px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5">
            HOW YEARNIT WORKS
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Three steps Towards Cashback
          </h2>
        </div>

        {/* 3 Unified Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {stepsData.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                role="button"
                tabIndex={0}
                onClick={() => handleAction(step.actionType)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAction(step.actionType);
                  }
                }}
                className="group relative overflow-hidden rounded-[26px] bg-white border border-slate-100 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(242,92,5,0.09)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[195px]"
              >
                {/* Subtle soft orange top ambient glow */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 inset-x-8 h-14 bg-gradient-to-b from-[#FF6B20]/15 to-transparent blur-xl pointer-events-none rounded-full group-hover:from-[#FF6B20]/25 transition-all duration-300"
                />

                {/* Card Top: Signature Vibrant Orange Rounded Icon (Left) & Large Number (Right) */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F25C05] text-white flex items-center justify-center shadow-md shadow-[#F25C05]/20 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>

                  <span
                    aria-hidden="true"
                    className="font-black text-3xl sm:text-4xl text-slate-200 select-none tracking-tight leading-none"
                  >
                    {step.number}
                  </span>
                </div>

                {/* Card Bottom: Text on Left, Mascot on Right */}
                <div className="relative z-10 flex items-end justify-between gap-3 mt-5 sm:mt-6">
                  <div className="flex-1 min-w-0 pr-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#F25C05] transition-colors duration-200">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed mt-1.5">
                      {step.description}
                    </p>
                  </div>

                  {/* 3D Mascot Illustration */}
                  <div className="flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 flex items-end justify-end">
                    <img
                      src={step.mascotSrc}
                      alt={step.mascotAlt}
                      className="max-h-20 sm:max-h-24 w-auto object-contain select-none pointer-events-none drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CashbackSteps;
