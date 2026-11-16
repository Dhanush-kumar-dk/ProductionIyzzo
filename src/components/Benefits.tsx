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
    <section className="w-full bg-slate-900 text-white py-12 sm:py-16 font-poppins">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-white/10 px-3 py-1 rounded-full mb-2">
            <span>Guaranteed Trust</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Benefits for Your Shopping Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Why discerning Indian buyers rely on Yearnit’s verified, lab-audited recommendations.
          </p>
        </div>

        {/* 4 Columns spanning the full desktop width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:border-slate-600 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                <h3 className="font-bold text-base sm:text-lg text-white">
                  {b.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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
