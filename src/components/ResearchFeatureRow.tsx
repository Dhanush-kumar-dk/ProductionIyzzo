import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function ResearchFeatureRow() {
  return (
    <section id="research-lab" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Card 1: Dark Sage-Green Feature Card (5 of 12 cols) */}
        <div className="lg:col-span-5 rounded-[20px] bg-[#4F6F5D] text-white p-7 sm:p-9 flex flex-col justify-between min-h-[260px] shadow-subtle">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-[#DCE8E0] block mb-2">
              Hardware Testing & Audits
            </span>
            <h3 className="font-serif font-normal text-2xl sm:text-3xl text-white leading-snug">
              Independent Research & Benchmark Labs
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#DCE8E0] mt-3 leading-relaxed">
              Every item is evaluated across real-world stress tests, battery degradation curves,
              thermal profiles, and component longevity before earning a spot in our guides.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-white/15 flex items-center justify-between">
            <a
              href="/about#methodology"
              className="text-xs font-medium text-white hover:underline flex items-center gap-1.5 text-decoration-none"
            >
              <span>Explore Our Methodology</span>
              <span>→</span>
            </a>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Card 2: Light Gray Card with Pill Button (3 of 12 cols) */}
        <div className="lg:col-span-3 rounded-[20px] bg-[#E6EAE5] p-6 sm:p-7 flex flex-col justify-between min-h-[260px]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#7B857F] block mb-2">
              Auditing Process
            </span>
            <h4 className="font-serif font-normal text-xl text-[#1E2A24] leading-snug">
              Standardized Benchmark Trials
            </h4>
            <p className="font-sans text-xs text-[#3F4A44] mt-2 leading-relaxed">
              From decibel sound meters to spectrometer color calibration, every measurement is recorded.
            </p>
          </div>

          <div className="pt-4">
            <a
              href="/about"
              className="inline-block px-4 py-2 rounded-full bg-white text-[#1E2A24] text-xs font-medium shadow-subtle hover:bg-[#FAFBF8] transition text-decoration-none"
            >
              Complete Test Protocols
            </a>
          </div>
        </div>

        {/* Card 3: Flat Sage Tile (2 of 12 cols) */}
        <div className="lg:col-span-2 rounded-[20px] bg-[#B5BEB5] p-6 sm:p-7 flex flex-col justify-center text-center min-h-[260px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#1E2A24]/70 mb-2">
            Time Invested
          </span>
          <h4 className="font-serif font-normal text-2xl text-[#1E2A24]">
            450+ Hours
          </h4>
          <p className="font-sans text-xs text-[#3F4A44] mt-1">
            Average per category evaluation & longevity tests
          </p>
        </div>

        {/* Card 4: Flat Sage Tile (2 of 12 cols) */}
        <div className="lg:col-span-2 rounded-[20px] bg-[#B5BEB5] p-6 sm:p-7 flex flex-col justify-center text-center min-h-[260px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#1E2A24]/70 mb-2">
            Ethical Stance
          </span>
          <h4 className="font-serif font-normal text-2xl text-[#1E2A24]">
            Zero Bias
          </h4>
          <p className="font-sans text-xs text-[#3F4A44] mt-1">
            No paid placements, no sponsored lab ratings
          </p>
        </div>
      </div>
    </section>
  );
}
