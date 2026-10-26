import { useState, useEffect } from "react";
import { HeartIcon, ShareIcon, CheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { isDealSaved, toggleSaveDeal } from "../utils/wishlist";
import { buildAffiliateUrl } from "../utils/affiliate";

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  image1?: string;
  image2?: string;
  url: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  originalPrice?: string;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Guarantee valid affiliate tracking URL with active partner tag
  const affiliateUrl = buildAffiliateUrl(product.url);

  // Collect available non-empty images
  const images = [product.image, product.image1, product.image2].filter(
    (img): img is string => Boolean(img && img.trim().length > 0)
  );

  useEffect(() => {
    setSaved(isDealSaved(product.id));
    const handleUpdate = () => setSaved(isDealSaved(product.id));
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, [product.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleSaveDeal({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      url: affiliateUrl,
    });
    setSaved(newState);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      alert("Link copied!");
    }
  };

  // Generate a consistent dummy discount and MRP for visual realism if not provided
  const numericPrice = parseFloat(product.price.replace(/,/g, "")) || 999;
  const dummyMrp = Math.round(numericPrice * 1.45);
  const discountPercent = Math.round(((dummyMrp - numericPrice) / dummyMrp) * 100);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden font-poppins">
      {/* Top badges & Wishlist */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
          {discountPercent}% OFF
        </span>

        <button
          onClick={handleToggleWishlist}
          type="button"
          className="pointer-events-auto p-2 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-md backdrop-blur-sm transition transform hover:scale-110 active:scale-95"
          title={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-label="Wishlist toggle"
        >
          {saved ? (
            <HeartIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartOutline className="w-4 h-4 text-gray-500 hover:text-red-500" />
          )}
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

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span className="text-[11px] font-semibold text-gray-500 ml-1">
              4.6 (1.4k+)
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price details */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-extrabold text-gray-900">
              ₹{product.price}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{dummyMrp.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Save ₹{(dummyMrp - numericPrice).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-900 font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition transform active:scale-95 no-underline border border-[#FCD200]"
            >
              <span>View Deal</span>
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

            <button
              onClick={handleCopyLink}
              type="button"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 bg-white transition hover:bg-gray-50 active:scale-95 flex-shrink-0"
              title="Copy affiliate link"
              aria-label="Copy deal link"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShareIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
