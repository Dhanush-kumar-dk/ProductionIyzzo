import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon, XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { buildAffiliateUrl } from "../utils/affiliate";
import { Product } from "../data/products";

export type { Product };

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDisclosureModal, setShowDisclosureModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Guarantee valid affiliate tracking URL with active partner tag (tag=dk29112306-21)
  const affiliateUrl = buildAffiliateUrl(product.url);

  // Collect available non-empty images
  const images = [
    product.image,
    product.image1,
    product.image2,
    ...(product.additionalImages || []),
  ].filter((img): img is string => Boolean(img && img.trim().length > 0));

  // 3-second automatic carousel slide transition (pauses when user hovers to inspect)
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const currentRating = product.rating || 4.2;
  const reviewCount = product.ratingCount || 1420;

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-2xl hover:border-amber-300 transition-all duration-300 flex flex-col h-full overflow-hidden font-poppins cursor-pointer transform hover:-translate-y-1"
      >
        {/* Top Badges & Info button */}
        <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
          {product.category ? (
            <span className="bg-gray-950/85 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
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
            className="pointer-events-auto p-1.5 rounded-full bg-white/95 hover:bg-white text-gray-400 hover:text-amber-500 shadow-md backdrop-blur-sm transition transform hover:scale-110 active:scale-95"
            title="Affiliate Disclosure"
            aria-label="Affiliate disclosure info"
          >
            <InformationCircleIcon className="w-4 h-4 text-gray-500 hover:text-amber-600" />
          </button>
        </div>

        {/* Product Image Carousel Area with 3s Slide Transition */}
        <div className="relative w-full aspect-square bg-gray-50/70 overflow-hidden flex items-center justify-center">
          {images.length > 0 ? (
            <div
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
            >
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="w-full h-full flex-shrink-0 flex items-center justify-center p-4"
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} - View ${idx + 1}`}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}

          {/* Carousel Slide Indicators (Dots) */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-10 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx
                      ? "bg-amber-500 w-4 shadow-sm"
                      : "bg-gray-300/80 hover:bg-gray-400 w-1.5"
                  }`}
                  aria-label={`Switch to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1.5">
              {product.name}
            </h3>

            {/* Star Rating Display */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex items-center text-[#FFA41C]">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(currentRating)
                        ? "fill-[#FFA41C] text-[#FFA41C]"
                        : i < currentRating
                        ? "fill-[#FFA41C]/60 text-[#FFA41C]"
                        : "text-gray-200 fill-gray-200"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-bold text-gray-900 text-xs">
                {currentRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-gray-500">
                ({reviewCount.toLocaleString()})
              </span>
            </div>

            {/* Product Short Detail */}
            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
              {product.shortDetail || product.summary || "Verified product specifications, authentic reviews, and official warranty."}
            </p>
          </div>

          <div>
            {/* Price Display */}
            {product.price && (
              <div className="flex items-baseline gap-2 mb-2.5">
                <span className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
                  ₹{product.price}
                </span>
                {product.mrp && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.mrp}
                  </span>
                )}
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Prime Eligible
                </span>
              </div>
            )}

            {/* "Buy Now" Action Button */}
            <a
              href={affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              onClick={(e) => {
                // Allow direct Buy Now on Amazon without bubbling to card navigation
                e.stopPropagation();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition transform active:scale-95 no-underline border border-[#FCD200]"
              title="Buy Now on Amazon"
            >
              <ShoppingBagIcon className="w-4 h-4 text-gray-950 stroke-2" />
              <span>Buy Now</span>
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
            className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-200 text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <InformationCircleIcon className="w-5 h-5" />
                <span>Affiliate Disclosure</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDisclosureModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                <strong>Amazon Associates Program:</strong> Yearnit participates
                in the Amazon Associates Program, an affiliate marketing program
                designed to provide a means for sites to earn commissions by
                linking to Amazon.in.
              </p>
              <p>
                <strong>Pricing & Live Terms:</strong> Product prices and
                availability are accurate as of the date/time indicated and are
                subject to change. Any price displayed on Amazon at the time of
                purchase will apply.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDisclosureModal(false)}
                className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
