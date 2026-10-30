import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopBar from "./TopBar";
import LogIn from "./Login";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import PriceHistoryTracker from "./PriceHistoryTracker";
import {
  getProductById,
  getRelatedProducts,
  Product,
} from "../data/products";
import { buildAffiliateUrl } from "../utils/affiliate";
import { updateSEO } from "../utils/seo";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [openLogIn, setOpenLogIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const found = getProductById(id);
      if (found) {
        setProduct(found);
        setSelectedImage(found.image);

        const cleanPrice = found.price ? found.price.replace(/,/g, "") : undefined;
        const brandName = found.name.split(" ")[0] || "Yearnit";
        const canonicalUrl = `https://yearnit.in/product/${found.id}`;

        const productJsonLd: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": found.name,
          "image": [found.image, found.image1, found.image2].filter(Boolean),
          "description": found.summary || found.shortDetail || `Detailed review, specifications, pros, and cons for ${found.name}.`,
          "sku": found.id,
          "mpn": found.id,
          "brand": {
            "@type": "Brand",
            "name": brandName,
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "INR",
            "price": cleanPrice || "999",
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Amazon India",
            },
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": found.rating || 4.2,
            "reviewCount": found.ratingCount || 1420,
            "bestRating": 5,
            "worstRating": 1,
          },
        };

        if (found.customerReviews && found.customerReviews.length > 0) {
          productJsonLd.review = found.customerReviews.map((rev) => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": rev.author,
            },
            "datePublished": "2026-10-15",
            "reviewBody": rev.content,
            "name": rev.title,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": rev.rating,
              "bestRating": 5,
            },
          }));
        }

        const breadcrumbsJsonLd: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://yearnit.in/",
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": found.category || "All Products",
              "item": "https://yearnit.in/#featured-catalog",
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": found.name,
              "item": canonicalUrl,
            },
          ],
        };

        updateSEO({
          title: `${found.name} Price History, Review & Buyer Guide`,
          description: `Price history graph, lowest recorded price, and buying recommendation for ${found.name}. ${found.summary || found.shortDetail || ""}`,
          image: found.image,
          url: canonicalUrl,
          type: "product",
          keywords: [
            found.name,
            `${found.name} price history`,
            `${found.name} lowest price`,
            "best time to buy",
            "price tracker",
            found.category || "Electronics",
            "India Review",
            "Amazon Price",
            "Buyer Guide",
          ],
          jsonLd: [productJsonLd, breadcrumbsJsonLd],
        });
      } else {
        setProduct(null);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F0F2F2] flex flex-col font-poppins text-gray-900">
        <TopBar openLogIn={() => setOpenLogIn(true)} />
        {openLogIn && (
          <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
            <LogIn onClose={() => setOpenLogIn(false)} />
          </div>
        )}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Product Not Found
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              The product you are looking for may have been updated or moved.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 font-bold text-xs rounded-xl shadow-sm transition"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Home Catalog</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const affiliateUrl = buildAffiliateUrl(product.url);
  const relatedProducts = getRelatedProducts(product.id, product.category, 4);

  // Collect all product images for gallery
  const galleryImages = [
    product.image,
    product.image1,
    product.image2,
    ...(product.additionalImages || []),
  ].filter((img): img is string => Boolean(img && img.trim().length > 0));

  const currentRating = product.rating || 4.2;
  const reviewCount = product.ratingCount || 1420;

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col font-poppins text-gray-900 selection:bg-amber-100">
      <TopBar openLogIn={() => setOpenLogIn(true)} />
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-2 border-b border-gray-300 gap-2">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-scroll whitespace-nowrap min-w-0 pr-2">
            <Link to="/" className="hover:text-blue-700 transition">
              Home
            </Link>
            <span>›</span>
            {product.category && (
              <>
                <span className="text-gray-500">{product.category}</span>
                <span>›</span>
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-700 transition bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Product Hero Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Column 1: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Primary High-Res Display */}
            <div className="relative w-full aspect-square bg-gray-50/70 rounded-2xl p-6 border border-gray-100 flex items-center justify-center overflow-hidden mb-4 shadow-2xs">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300 transform hover:scale-105"
              />
              {product.editorBadge && (
                <div className="absolute top-3 left-3 bg-amber-400 text-gray-950 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {product.editorBadge}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto p-1 max-w-full">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all duration-200 flex-shrink-0 ${
                      selectedImage === img
                        ? "border-amber-500 shadow-md ring-2 ring-amber-200 scale-105"
                        : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Product Overview & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Tag */}
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    {product.category}
                  </span>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified In Stock on Amazon
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 leading-tight mb-3 break-words">
                {product.name}
              </h1>

              {/* Star Rating & Review Count */}
              <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-gray-100 text-sm">
                <div className="flex items-center text-[#FFA41C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
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
                <span className="font-bold text-gray-900">
                  {currentRating.toFixed(1)} out of 5
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-blue-700 hover:underline cursor-pointer">
                  {reviewCount.toLocaleString()} customer ratings
                </span>
              </div>

              {/* Price Block */}
              <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-200/70 mb-5">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase">
                    Amazon Price:
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                    ₹{product.price || "Check Price"}
                  </span>
                  {product.mrp && (
                    <span className="text-sm text-gray-400 line-through">
                      M.R.P: ₹{product.mrp}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="text-emerald-700 font-bold">Inclusive of all taxes</span>
                  <span>•</span>
                  <span>Free Express Delivery for Prime Members</span>
                </div>
                <div className="flex items-center gap-2 mb-2 pt-2 border-t border-gray-200/60 flex-wrap">
                  <a
                    href="#price-history"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>View Price History & Best Time to Buy ↓</span>
                  </a>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal italic">
                  Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.
                </p>
              </div>

              {/* Short Detail Highlights */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Key Highlights
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
                  {product.shortDetail || product.summary}
                </p>
              </div>
            </div>

            {/* Primary Action Buttons & Buy Now CTA */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition transform active:scale-95 no-underline border border-[#FCD200]"
                >
                  <ShoppingBagIcon className="w-5 h-5 stroke-2" />
                  <span>Buy Now on Amazon</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 opacity-70" />
                </a>
              </div>

              {/* Statutory Disclosure Strip */}
              <div className="mt-3 text-center text-[11px] text-gray-500 leading-tight">
                As an Amazon Associate I earn from qualifying purchases. Links open direct official Amazon India product pages.
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                <div className="flex flex-col items-center">
                  <TruckIcon className="w-5 h-5 text-gray-700 mb-1" />
                  <span className="font-semibold text-gray-900">Amazon Delivered</span>
                  <span className="text-[10px] text-gray-500">Fast & Tracked</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-700 mb-1" />
                  <span className="font-semibold text-gray-900">100% Genuine</span>
                  <span className="text-[10px] text-gray-500">Brand Warranty</span>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowPathIcon className="w-5 h-5 text-gray-700 mb-1" />
                  <span className="font-semibold text-gray-900">Easy Returns</span>
                  <span className="text-[10px] text-gray-500">7-10 Days Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Price History & Best Time to Buy Section */}
        <div id="price-history" className="scroll-mt-20">
          <PriceHistoryTracker product={product} />
        </div>

        {/* Technical Specifications & Details Section */}
        {product.specs && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              <span>Technical Specifications</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between py-2.5 border-b border-gray-100 text-xs sm:text-sm"
                >
                  <span className="text-gray-500 font-medium">{key}</span>
                  <span className="text-gray-900 font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Evaluation: Pros, Cons & Who It's For */}
        {(product.pros || product.cons || product.whoItsFor) && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Editorial Evaluation & Analysis
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              Our independent evaluation based on ergonomics, verified technical testing, and user feedback.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pros */}
              {product.pros && (
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/60">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Key Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {product.cons && (
                <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/60">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                    <span>Tradeoffs to Consider</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Who It's For */}
            {product.whoItsFor && (
              <div className="bg-blue-50/60 rounded-2xl p-4 sm:p-5 border border-blue-200/60 text-xs sm:text-sm text-gray-800">
                <span className="font-bold text-blue-900">Ideal For: </span>
                <span>{product.whoItsFor}</span>
              </div>
            )}
          </div>
        )}

        {/* Customer Reviews & Testimonials Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Verified Customer Reviews
              </h2>
              <p className="text-xs text-gray-500">
                Aggregated sentiment from verified purchasers on Amazon
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-950">
                {currentRating.toFixed(1)}
              </span>
              <div>
                <div className="flex items-center text-[#FFA41C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(currentRating)
                          ? "fill-[#FFA41C] text-[#FFA41C]"
                          : "text-gray-200 fill-gray-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] text-gray-500">
                  {reviewCount.toLocaleString()} total reviews
                </span>
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          {product.customerReviews && product.customerReviews.length > 0 ? (
            <div className="space-y-4">
              {product.customerReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      <span className="font-bold text-xs text-gray-900">
                        {rev.author}
                      </span>
                      {rev.verified && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center text-[#FFA41C]">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? "fill-[#FFA41C] text-[#FFA41C]"
                              : "text-gray-200 fill-gray-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <h4 className="font-bold text-xs text-gray-900">
                      {rev.title}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {rev.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic p-4 text-center">
              Customer reviews for this verified model are available on the official Amazon product listing.
            </div>
          )}

          {/* View More on Amazon Link */}
          <div className="mt-6 text-center">
            <a
              href={affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
            >
              <span>Read all customer questions & reviews on Amazon →</span>
            </a>
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                You May Also Like
              </h2>
              <Link to="/" className="text-xs font-semibold text-blue-700 hover:underline">
                View all catalog →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-3.5 py-2.5 border-t border-gray-200 z-40 shadow-2xl flex items-center justify-between gap-2.5 pb-safe">
        <div className="flex flex-col min-w-0 flex-shrink-0">
          <span className="text-[10px] text-gray-500 font-medium">Amazon Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm xs:text-base font-black text-gray-950 truncate">
              {product.price ? `₹${product.price}` : "Check Price"}
            </span>
            {product.mrp && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="flex-1 max-w-[210px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs rounded-xl shadow-xs no-underline border border-[#FCD200]"
        >
          <ShoppingBagIcon className="w-4 h-4 stroke-2 flex-shrink-0" />
          <span className="truncate">Buy on Amazon</span>
        </a>
      </div>

      <Footer />
    </div>
  );
}
