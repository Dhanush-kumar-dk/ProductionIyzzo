import {
  ShieldCheckIcon,
  SparklesIcon,
  ScaleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function Benefits() {
  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: "Independent Research",
      description:
        "Exhaustive lab test routines, acoustic measurements, and real-world durability evaluations conducted without brand influence.",
    },
    {
      icon: SparklesIcon,
      title: "Zero-Cost Access",
      description:
        "All test scores, teardown notes, and buying guides are freely accessible to every shopper without paywalls.",
    },
    {
      icon: ScaleIcon,
      title: "No Biased Paid Placements",
      description:
        "Brands cannot purchase ranking positions, favorable verdicts, or sponsored review placements in our guides.",
    },
    {
      icon: TagIcon,
      title: "Price Drop Verification",
      description:
        "Live price checks and Amazon discount validation ensure you capture genuine savings rather than inflated markdowns.",
    },
  ];

  return (
    <section className="w-full bg-[#F1F4EF] py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Serif Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#1E2A24] tracking-tight">
            Benefits for your experience
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-2 max-w-[60ch] mx-auto">
            Why discerning Indian buyers rely on Yearnit’s quiet, lab-audited recommendations.
          </p>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center space-y-3">
                {/* Circular tinted icon container */}
                <div className="w-12 h-12 rounded-full bg-white border border-[#CBD3CB] flex items-center justify-center text-[#4F6F5D] shadow-subtle">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>

                <h3 className="font-serif font-medium text-base sm:text-lg text-[#1E2A24]">
                  {b.title}
                </h3>

                <p className="font-sans text-xs sm:text-[13px] text-[#7B857F] leading-relaxed max-w-[28ch]">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
