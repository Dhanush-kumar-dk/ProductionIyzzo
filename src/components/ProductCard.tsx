import { useState } from "react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const [showDisclosureModal, setShowDisclosureModal] = useState(false);

  // Guarantee valid affiliate tracking URL with active partner tag (tag=dk29112306-21)
  const affiliateUrl = buildAffiliateUrl(product.url);

  // Collect available non-empty images (hotlinked directly to Amazon CDN)
  const images = [product.image, product.image1, product.image2].filter(
    (img): img is string => Boolean(img && img.trim().length > 0)
  );

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden font-poppins">
        {/* Top Badges & Info button */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
          {product.category ? (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              {product.category}
            </span>
          ) : product.editorBadge ? (
            <span className="bg-amber-400 text-gray-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.editorBadge}
            </span>
          ) : (
            <div />
          )}

          {/* (i) Icon Button to trigger popup disclosure */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDisclosureModal(true);
            }}
            className="pointer-events-auto p-1 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-amber-500 shadow-sm backdrop-blur-sm transition transform hover:scale-110 active:scale-95"
            title="Affiliate Disclosure"
            aria-label="Affiliate disclosure info"
          >
            <InformationCircleIcon className="w-4 h-4 text-gray-500 hover:text-amber-600" />
          </button>
        </div>

        {/* Product Image Area */}
        <div className="relative w-full aspect-square bg-gray-50/60 p-4 flex items-center justify-center overflow-hidden">
          <img
            src={images[activeImageIndex] || product.image}
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Image dot switcher if multiple images exist */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx
                      ? "bg-blue-600 w-3.5"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            {/* Title */}
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
              {product.name}
            </h3>
          </div>

          <div>
            {/* Live price display if present */}
            {product.isLivePrice && product.price ? (
              <div className="mb-2">
                <span className="text-base font-extrabold text-gray-900">
                  ₹{product.price}
                </span>
              </div>
            ) : null}

            {/* Action Button */}
            <a
              href={affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition transform active:scale-95 no-underline border border-[#FCD200]"
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
      </div>

      {/* Pop-up Affiliate Disclosure Modal triggered on (i) click */}
      {showDisclosureModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDisclosureModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 text-left font-poppins relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <InformationCircleIcon className="w-4 h-4 text-amber-600" />
                <span>Affiliate Disclosure</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclosureModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-gray-700 space-y-2 leading-relaxed">
              <p className="font-bold text-gray-900 italic">
                "As an Amazon Associate I earn from qualifying purchases."
              </p>
              <p className="text-[11px] text-gray-600">
                When you click on links to Amazon from Yearnit and complete a purchase, we may earn an affiliate commission at zero additional cost to you.
              </p>
              <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                Yearnit is an independent review platform and is not affiliated with Amazon.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDisclosureModal(false)}
              className="w-full mt-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
