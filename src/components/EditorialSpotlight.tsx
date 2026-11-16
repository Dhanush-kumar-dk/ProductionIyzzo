import { StarIcon } from "@heroicons/react/20/solid";
import { buildAffiliateUrl } from "../utils/affiliate";
import { TvIcon } from "@heroicons/react/24/outline";

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
    <section id="spotlight" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Centered Serif Section Title + Subtitle */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#1E2A24] tracking-tight">
          Editorial Spotlight
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-2 max-w-[60ch] mx-auto">
          Independent evaluation by our hardware bench: tested for display fidelity, build quality, and value.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
        {/* Left Column: Large rounded muted image panel (7 of 12 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#E3E8E2] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Visual Panel / Image Area */}
            <div className="relative w-full rounded-[20px] bg-[#E6EAE5] min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <img
                src={spotlightProduct.image}
                alt={spotlightProduct.title}
                className="max-h-[180px] sm:max-h-[210px] max-w-full object-contain mix-blend-multiply"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="mt-3 flex items-center gap-2">
                <TvIcon className="w-4 h-4 text-[#4F6F5D]" />
                <span className="font-serif text-xs text-[#1E2A24]">
                  Xiaomi 4K Display Hardware Test
                </span>
              </div>
              <p className="font-sans text-[11px] text-[#7B857F] mt-1 max-w-[42ch]">
                {spotlightProduct.caption}
              </p>
            </div>

            {/* Product Title (serif) */}
            <h3 className="font-serif font-normal text-lg sm:text-xl text-[#1E2A24] mt-5 leading-snug">
              {spotlightProduct.title}
            </h3>

            {/* Stars & Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex text-[#E0A83A]">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(spotlightProduct.rating) ? "fill-current" : "text-[#E0A83A]/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#1E2A24]">{spotlightProduct.rating}</span>
              <span className="text-[11px] text-[#7B857F]">
                ({spotlightProduct.ratingCount.toLocaleString()} lab audits & verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-6 pt-4 border-t border-[#E3E8E2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-xl sm:text-2xl text-[#1E2A24]">
                ₹{spotlightProduct.price}
              </span>
              <span className="text-xs text-[#7B857F] line-through">
                ₹{spotlightProduct.mrp}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D9F2E3] text-[#2F7D52] text-[10px] font-bold uppercase">
                {spotlightProduct.discount}
              </span>
            </div>

            <a
              href={spotlightProduct.affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="px-5 py-2.5 rounded-[10px] bg-[#4F6F5D] text-white text-xs sm:text-sm font-medium hover:bg-[#5E7F6C] transition shadow-subtle flex items-center gap-1.5 text-decoration-none"
            >
              <span>Check Amazon Pricing</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Right Column: Editorial Verdict + 3 Compact Rows (5 of 12 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="bg-white rounded-[24px] border border-[#E3E8E2] p-6 sm:p-7">
            {/* Small uppercase label */}
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#4F6F5D] block mb-2">
              Editorial Verdict
            </span>
            <p className="font-sans text-xs sm:text-sm text-[#3F4A44] leading-relaxed">
              Our engineering bench concluded that this panel provides the highest dynamic range,
              truest blacks, and smoothest OS responsiveness in its budget tier. Sound output exceeds
              benchmarks with Dolby Audio integration, avoiding the need for an external soundbar in medium rooms.
            </p>
          </div>

          {/* Bordered list of 3 compact product rows */}
          <div className="bg-white rounded-[24px] border border-[#E3E8E2] divide-y divide-[#E3E8E2] overflow-hidden">
            {compactRows.map((row) => {
              const affUrl = buildAffiliateUrl(row.url);
              return (
                <div
                  key={row.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[#FAFBF8] transition"
                >
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#F1F4EF] text-[9px] font-bold uppercase tracking-wider text-[#3F4A44] mb-1">
                      {row.category}
                    </span>
                    <h5 className="font-serif text-xs sm:text-sm font-medium text-[#1E2A24] truncate max-w-[220px]">
                      {row.name}
                    </h5>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#7B857F]">
                      <div className="flex text-[#E0A83A]">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(row.rating) ? "fill-current" : "text-[#E0A83A]/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span>{row.rating}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#1E2A24] block">
                      ₹{row.price}
                    </span>
                    <a
                      href={affUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                      className="text-[11px] font-medium text-[#4F6F5D] hover:underline"
                    >
                      Deal ↗
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
