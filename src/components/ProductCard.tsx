import { useState } from "react";
import { CheckIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { buildAffiliateUrl } from "../utils/affiliate";

export type Product = {
  id: string;
  name: string;
  price?: string;
  priceTimestamp?: string;
  isLivePrice?: boolean;
  image: string;
  image1?: string;
  image2?: string;
  url: string;
  category?: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  whoItsFor?: string;
  editorBadge?: string;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullReview, setShowFullReview] = useState(false);

  // Guarantee valid affiliate tracking URL with active partner tag (e.g. tag=dk29112306-21)
  const affiliateUrl = buildAffiliateUrl(product.url);

  // Collect available non-empty images (hotlinked directly to Amazon CDN)
  const images = [product.image, product.image1, product.image2].filter(
    (img): img is string => Boolean(img && img.trim().length > 0)
  );

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full overflow-hidden font-poppins">
      {/* Top Editorial Badge */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <span className="bg-[#1A222D]/90 backdrop-blur-sm text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
          {product.editorBadge || "Editor Reviewed"}
        </span>

        {product.category && (
          <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Image Area - direct CDN link, never self-hosted */}
      <div className="relative w-full aspect-square bg-gray-50/70 p-4 pt-10 flex items-center justify-center overflow-hidden">
        <img
          src={images[activeImageIndex] || product.image}
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Image dot switcher if multiple images exist */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImageIndex === idx
                    ? "bg-blue-600 w-5"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content & Original Editorial Review */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* Title */}
          <h2 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h2>

          {/* Original Written Summary */}
          {product.summary && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
              {product.summary}
            </p>
          )}

          {/* Pros & Cons Accordion / Details */}
          {(product.pros || product.cons) && (
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-[11px] space-y-2">
              {product.pros && product.pros.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Key Strengths:</span>
                  </div>
                  <ul className="space-y-0.5 pl-4 list-disc text-gray-700">
                    {product.pros.slice(0, showFullReview ? undefined : 2).map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.cons && product.cons.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  <div className="font-bold text-rose-800 flex items-center gap-1">
                    <XMarkIcon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tradeoffs to Consider:</span>
                  </div>
                  <ul className="space-y-0.5 pl-4 list-disc text-gray-700">
                    {product.cons.slice(0, showFullReview ? undefined : 1).map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.whoItsFor && (
                <p className="pt-1 border-t border-slate-200/60 text-gray-600">
                  <strong className="text-gray-900">Best For: </strong>
                  {product.whoItsFor}
                </p>
              )}

              {((product.pros && product.pros.length > 2) || (product.cons && product.cons.length > 1)) && (
                <button
                  type="button"
                  onClick={() => setShowFullReview(!showFullReview)}
                  className="text-[10px] text-blue-600 font-semibold hover:underline pt-1 block"
                >
                  {showFullReview ? "Show Less Details ▲" : "View Full Breakdown ▼"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Compliance Action Area */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          {/* Real-time price display IF fetched via live API */}
          {product.isLivePrice && product.price ? (
            <div className="mb-3 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-gray-900">
                  ₹{product.price}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  (Live API Price)
                </span>
              </div>
              <p className="text-[9px] text-gray-500 leading-tight">
                Accurate as of {product.priceTimestamp || "live query"}. Product prices and availability are subject to change. Any price and availability displayed on Amazon at the time of purchase will apply.
              </p>
            </div>
          ) : null}

          {/* Inline Affiliate Disclosure directly above/near product link */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
            <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <p className="leading-tight">
              Affiliate Link: We earn commissions on qualifying purchases.
            </p>
          </div>

          {/* Primary Action Button - direct Amazon link with tag, no cloaking */}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition transform active:scale-95 no-underline border border-[#FCD200]"
          >
            <span>Check price on Amazon</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
