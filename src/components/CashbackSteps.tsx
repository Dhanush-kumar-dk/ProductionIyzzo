import { FC } from "react";
import mascot1 from "../assets/step1-mascot@2x.png";
import mascot2 from "../assets/step2-mascot@2x.png";
import mascot3 from "../assets/step3-mascot@2x.png";
import {
  UserPlusIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

interface CashbackStepsProps {
  onLoginClick?: () => void;
  onShopClick?: () => void;
}

interface StepTheme {
  iconBg: string;
  iconColor: string;
  iconShadow: string;
  ambientGlow: string;
  ambientGlowHover: string;
  borderHover: string;
  cardShadowHover: string;
  titleHover: string;
  stepBadgeBg: string;
  stepBadgeText: string;
  stepBadgeBorder: string;
  watermarkHover: string;
  actionText: string;
  actionTextColor: string;
}

interface StepItem {
  number: string;
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  actionType: "login" | "shop" | "info";
  icon: FC<{ className?: string }>;
  theme: StepTheme;
}

const stepsData: StepItem[] = [
  {
    number: "01",
    title: "Login / Sign up",
    description: "Verify your mobile number in seconds. No card, no hidden fees",
    mascotSrc: mascot1,
    mascotAlt: "Mascot with smartphone login screen",
    actionType: "login",
    icon: UserPlusIcon,
    theme: {
      iconBg: "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600",
      iconColor: "text-white",
      iconShadow: "shadow-md shadow-indigo-500/25",
      ambientGlow: "bg-indigo-400/15",
      ambientGlowHover: "group-hover:bg-indigo-500/25",
      borderHover: "group-hover:border-indigo-300",
      cardShadowHover:
        "hover:shadow-[0_14px_36px_rgba(99,102,241,0.12),0_4px_12px_rgba(0,0,0,0.03)]",
      titleHover: "group-hover:text-indigo-600",
      stepBadgeBg: "bg-indigo-50",
      stepBadgeText: "text-indigo-700",
      stepBadgeBorder: "border-indigo-200/70",
      watermarkHover: "group-hover:text-indigo-100",
      actionText: "Instant Setup",
      actionTextColor: "text-indigo-600",
    },
  },
  {
    number: "02",
    title: "Choose Store & Shop",
    description: "Tap any brand banner to activate extra cashback before you checkout",
    mascotSrc: mascot2,
    mascotAlt: "Mascot pushing shopping cart with items",
    actionType: "shop",
    icon: BuildingStorefrontIcon,
    theme: {
      iconBg: "bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500",
      iconColor: "text-slate-950",
      iconShadow: "shadow-md shadow-amber-500/25",
      ambientGlow: "bg-amber-400/15",
      ambientGlowHover: "group-hover:bg-amber-500/25",
      borderHover: "group-hover:border-amber-300",
      cardShadowHover:
        "hover:shadow-[0_14px_36px_rgba(245,158,11,0.15),0_4px_12px_rgba(0,0,0,0.03)]",
      titleHover: "group-hover:text-amber-600",
      stepBadgeBg: "bg-amber-50",
      stepBadgeText: "text-amber-800",
      stepBadgeBorder: "border-amber-200/70",
      watermarkHover: "group-hover:text-amber-100",
      actionText: "Browse Stores",
      actionTextColor: "text-amber-700",
    },
  },
  {
    number: "03",
    title: "Earn & Withdraw",
    description: "Watch your wallet balance grow and transfer real cashback to your bank anytime",
    mascotSrc: mascot3,
    mascotAlt: "Mascot holding cash, coins, wallet and bank",
    actionType: "info",
    icon: BanknotesIcon,
    theme: {
      iconBg: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600",
      iconColor: "text-white",
      iconShadow: "shadow-md shadow-emerald-500/25",
      ambientGlow: "bg-emerald-400/15",
      ambientGlowHover: "group-hover:bg-emerald-500/25",
      borderHover: "group-hover:border-emerald-300",
      cardShadowHover:
        "hover:shadow-[0_14px_36px_rgba(16,185,129,0.14),0_4px_12px_rgba(0,0,0,0.03)]",
      titleHover: "group-hover:text-emerald-600",
      stepBadgeBg: "bg-emerald-50",
      stepBadgeText: "text-emerald-800",
      stepBadgeBorder: "border-emerald-200/70",
      watermarkHover: "group-hover:text-emerald-100",
      actionText: "Real Cash Out",
      actionTextColor: "text-emerald-600",
    },
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-bold tracking-widest uppercase mb-2">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>HOW YEARNIT WORKS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Three steps Towards Cashback
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Activate partner offers, complete your shopping on trusted storefronts, and unlock direct cashback rewards.
          </p>
        </div>

        {/* 3 Side-by-Side Cards (Grid) */}
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
                className={`group relative overflow-hidden rounded-[24px] bg-white border border-slate-200/80 p-5 lg:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] ${step.theme.borderHover} ${step.theme.cardShadowHover} hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[185px]`}
              >
                {/* Top ambient color blur highlight */}
                <div
                  aria-hidden="true"
                  className={`absolute -top-10 inset-x-8 h-12 ${step.theme.ambientGlow} ${step.theme.ambientGlowHover} blur-xl pointer-events-none rounded-full transition-colors duration-300`}
                />

                {/* Card Top: Gradient Rounded Icon & Large Number */}
                <div className="relative z-10 flex items-start justify-between">
                  {/* Modern Icon button with theme gradient */}
                  <div
                    className={`w-11 h-11 rounded-2xl ${step.theme.iconBg} ${step.theme.iconColor} ${step.theme.iconShadow} flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-5 sm:h-5" />
                  </div>

                  {/* Top Right: Step Badge & Big faint watermark number */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.theme.stepBadgeBg} ${step.theme.stepBadgeText} ${step.theme.stepBadgeBorder}`}
                    >
                      STEP {step.number}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`font-black text-3xl sm:text-4xl text-slate-100 ${step.theme.watermarkHover} transition-colors duration-200 select-none tracking-tight leading-none`}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Text & Action on left, Mascot on right */}
                <div className="relative z-10 flex items-end justify-between gap-3 mt-4">
                  <div className="flex-1 min-w-0 pr-1">
                    <h3
                      className={`text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug ${step.theme.titleHover} transition-colors duration-200`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-1">
                      {step.description}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${step.theme.actionTextColor} mt-2.5 group-hover:translate-x-1 transition-transform duration-200`}
                    >
                      <span>{step.theme.actionText}</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </div>
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CashbackSteps;
