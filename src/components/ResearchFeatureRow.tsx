import { ArrowRightIcon, ShieldCheckIcon, BeakerIcon, ClockIcon, ScaleIcon } from "@heroicons/react/24/outline";

export default function ResearchFeatureRow() {
  return (
    <section id="research-lab" className="w-full px-3 sm:px-6 lg:px-12 py-8 sm:py-10 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Card 1: Dark Slate Feature Card (5 of 12 cols) */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[250px] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 block mb-2 flex items-center gap-1.5">
              <BeakerIcon className="w-4 h-4" />
              Hardware Testing & Audits
            </span>
            <h3 className="font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              Independent Research & Benchmark Labs
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Every item is evaluated across real-world stress tests, battery degradation curves,
              thermal profiles, and component longevity before earning a spot in our guides.
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
            <a
              href="/about#methodology"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition text-decoration-none"
            >
              <span>Explore Our Methodology</span>
              <span>→</span>
            </a>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Light Card with Protocols (3 of 12 cols) */}
        <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 flex flex-col justify-between min-h-[250px] shadow-sm">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-orange-600 block mb-2 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" />
              Auditing Process
            </span>
            <h4 className="font-bold text-lg text-gray-900 leading-snug">
              Standardized Benchmark Trials
            </h4>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              From decibel sound meters to spectrometer color calibration, every measurement is recorded.
            </p>
          </div>

          <div className="pt-4">
            <a
              href="/about"
              className="inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-900 text-xs font-bold transition text-decoration-none"
            >
              Complete Test Protocols →
            </a>
          </div>
        </div>

        {/* Card 3: Stat Card (2 of 12 cols) */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 flex flex-col justify-center text-center min-h-[250px] shadow-sm">
          <ClockIcon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
            Time Invested
          </span>
          <h4 className="font-extrabold text-2xl text-gray-900">
            450+ Hours
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Average per category evaluation & longevity tests
          </p>
        </div>

        {/* Card 4: Stat Card (2 of 12 cols) */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 flex flex-col justify-center text-center min-h-[250px] shadow-sm">
          <ScaleIcon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
            Ethical Stance
          </span>
          <h4 className="font-extrabold text-2xl text-gray-900">
            Zero Bias
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            No paid placements, no sponsored lab ratings
          </p>
        </div>
      </div>
    </section>
  );
}
