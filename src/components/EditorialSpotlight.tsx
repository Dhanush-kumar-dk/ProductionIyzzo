import { StarIcon } from "@heroicons/react/20/solid";
import { buildAffiliateUrl } from "../utils/affiliate";
import { TvIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function EditorialSpotlight() {
  const spotlightProduct = {
    id: "B0C9J7SML8",
    title: "Xiaomi 43-inch 4K Ultra HD Smart Google TV X Pro Series",
    price: "24,999",
    mrp: "39,999",
    discount: "-38% OFF",
    rating: 4.5,
    ratingCount: 14200,
    affiliateUrl: buildAffiliateUrl("https://www.amazon.in/dp/B0C9J7SML8"),
    image: "https://m.media-amazon.com/images/I/71+h9K0S2iL._SL1500_.jpg",
    caption: "Benchmarked for 120+ hours: peak brightness, Delta E color accuracy & Dolby Vision performance.",
  };

  const compactRows = [
    {
      id: "B09N3ZNHTY",
      category: "EARBUDS",
      name: "boAt Airdopes 141 True Wireless",
      rating: 4.0,
      price: "1,099",
      url: "https://www.amazon.in/dp/B09N3ZNHTY",
    },
    {
      id: "B09G9FPHP6",
      category: "AUDIO",
      name: "Sony WH-1000XM5 Wireless Headphones",
      rating: 4.6,
      price: "28,990",
      url: "https://www.amazon.in/dp/B09G9FPHP6",
    },
    {
      id: "B0C7771Z11",
      category: "SMARTPHONE",
      name: "OnePlus Nord CE 3 Lite 5G",
      rating: 4.2,
      price: "17,499",
      url: "https://www.amazon.in/dp/B0C7771Z11",
    },
  ];

  return (
    <section id="spotlight" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full mb-1">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Featured Teardown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Editorial Spotlight
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Independent evaluation by our hardware bench: tested for display fidelity, build quality, and real-world value.
          </p>
        </div>
      </div>

      {/* Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left Column: Spotlight Card (7 of 12 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            {/* Visual Panel / Image Area */}
            <div className="relative w-full rounded-2xl bg-slate-50 border border-gray-100 min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <img
                src={spotlightProduct.image}
                alt={spotlightProduct.title}
                className="max-h-[190px] sm:max-h-[220px] max-w-full object-contain mix-blend-multiply"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="mt-3 flex items-center gap-2">
                <TvIcon className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-800">
                  Xiaomi 4K Display Hardware Test
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 max-w-[48ch]">
                {spotlightProduct.caption}
              </p>
            </div>

            {/* Product Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-5 leading-snug">
              {spotlightProduct.title}
            </h3>

            {/* Stars & Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(spotlightProduct.rating) ? "fill-current" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900">{spotlightProduct.rating}</span>
              <span className="text-xs text-gray-500">
                ({spotlightProduct.ratingCount.toLocaleString()} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-2xl sm:text-3xl text-gray-950">
                ₹{spotlightProduct.price}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ₹{spotlightProduct.mrp}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
                {spotlightProduct.discount}
              </span>
            </div>

            <a
              href={spotlightProduct.affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="px-6 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5 text-decoration-none"
            >
              <span>Check Amazon Pricing</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Right Column: Editorial Verdict + 3 Compact Rows (5 of 12 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block mb-2">
              Editorial Verdict
            </span>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our engineering bench concluded that this panel provides the highest dynamic range,
              truest blacks, and smoothest OS responsiveness in its budget tier. Sound output exceeds
              benchmarks with Dolby Audio integration, avoiding the need for an external soundbar in medium rooms.
            </p>
          </div>

          {/* Bordered list of 3 compact product rows */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {compactRows.map((row) => {
              const affUrl = buildAffiliateUrl(row.url);
              return (
                <div
                  key={row.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {row.category}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[240px]">
                      {row.name}
                    </h5>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(row.rating) ? "fill-current" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span>{row.rating}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-sm sm:text-base text-gray-950 block">
                      ₹{row.price}
                    </span>
                    <a
                      href={affUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                      className="text-xs font-semibold text-orange-600 hover:underline"
                    >
                      View Deal ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
