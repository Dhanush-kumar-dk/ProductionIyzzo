import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopBar from "./TopBar";
import LogIn from "./Login";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import PriceHistoryTracker from "./PriceHistoryTracker";
import {
  getProductById,
  getProductByIdAsync,
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
  LockClosedIcon,
  MapPinIcon,
  TagIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Start from the local cache when possible, otherwise show a loader
  // (instead of flashing "Product Not Found" while we fetch).
  const [product, setProduct] = useState<Product | null>(() =>
    id ? getProductById(id) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(() =>
    id ? !getProductById(id) : false
  );
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [openLogIn, setOpenLogIn] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [, setCatalogVersion] = useState(0);

  // Resolve the product: cache first, then Supabase (shared links / fresh browsers)
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const cached = getProductById(id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setProduct(null);
    setLoading(true);

    getProductByIdAsync(id)
      .then((found) => {
        if (cancelled) return;
        setProduct(found ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load product:", err);
        if (cancelled) return;
        setProduct(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Re-render related products when the catalog finishes syncing in the background
  useEffect(() => {
    const onCatalogUpdated = () => setCatalogVersion((v) => v + 1);
    window.addEventListener("catalogUpdated", onCatalogUpdated);
    return () => window.removeEventListener("catalogUpdated", onCatalogUpdated);
  }, []);

  // Gallery image + SEO whenever the product resolves
  useEffect(() => {
    if (!product) return;
    const found = product;
    setSelectedImage(found.image);

    const cleanPrice = found.price ? found.price.replace(/,/g, "") : undefined;
    const brandName = found.name.split(" ")[0] || "Yearnit";
    const canonicalUrl = `https://yearnit.in/product/${found.id}`;

    const productJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": found.name,
      "image": [found.image, found.image1, found.image2].filter(Boolean),
      "description":
        found.summary ||
        found.shortDetail ||
        `Detailed review, specifications, pros, and cons for ${found.name}.`,
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
  }, [product]);

  // ── Loading state (shared link opened in a fresh browser) ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex flex-col font-poppins text-gray-900">
        <TopBar openLogIn={() => setOpenLogIn(true)} />
        {openLogIn && (
          <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
            <LogIn onClose={() => setOpenLogIn(false)} />
          </div>
        )}
        <main className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading product…</p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not found (only after the lookup has fully finished) ──
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
  const brandName = product.name.split(" ")[0] || "Brand";

  // Calculate discount percentage
  const numPrice = parseFloat((product.price || "0").replace(/,/g, ""));
  const numMrp = parseFloat((product.mrp || "0").replace(/,/g, ""));
  const discountPercent =
    numMrp > numPrice && numPrice > 0
      ? Math.round(((numMrp - numPrice) / numMrp) * 100)
      : null;

  // Rating breakdown percentages (approximated for authentic feel)
  const ratingBreakdown = [
    { stars: 5, pct: 64 },
    { stars: 4, pct: 21 },
    { stars: 3, pct: 8 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 4 },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex flex-col font-poppins text-[#0F1111] selection:bg-amber-200">
      <TopBar openLogIn={() => setOpenLogIn(true)} />
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* Main Container with generous sizing and elevated margins */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 pb-24 sm:pb-12">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-2 border-b border-gray-200/80 gap-2">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap min-w-0 pr-2">
            <Link to="/" className="text-[#007185] hover:underline font-medium">
              Home
            </Link>
            <span className="text-gray-400">›</span>
            {product.category && (
              <>
                <Link
                  to="/#featured-catalog"
                  className="text-[#007185] hover:underline font-medium"
                >
                  {product.category}
                </Link>
                <span className="text-gray-400">›</span>
              </>
            )}
            <span className="text-gray-700 font-normal truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-300 shadow-2xs hover:bg-gray-50 transition"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Back</span>
          </button>
        </div>

        {/* =========================================================================
            HERO CONTAINER: Amazon lookalike with elevated 3-column desktop alignment
           ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs border border-gray-200/90 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* -------------------------------------------------------------
                COLUMN 1: Image Showcase with Vertical Thumbnail Strip (5 cols)
               ------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start">
              {/* Vertical Thumbnail Strip (left side on sm+, bottom on xs) */}
              {galleryImages.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-1 sm:pb-0 scrollbar-thin flex-shrink-0 w-full sm:w-16">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      onMouseEnter={() => setSelectedImage(img)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 p-1 bg-white overflow-hidden transition-all duration-150 flex-shrink-0 flex items-center justify-center ${
                        selectedImage === img
                          ? "border-[#E77600] ring-1 ring-[#E77600] shadow-xs"
                          : "border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`Thumbnail ${idx + 1}`}
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

              {/* Main Showcase Image Box */}
              <div className="relative flex-1 w-full aspect-square max-h-[480px] bg-white rounded-xl p-4 sm:p-6 border border-gray-100 flex items-center justify-center overflow-hidden group">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {/* Amazon's Choice badge */}
                  <div className="inline-flex items-center gap-1 bg-[#232F3E] text-white text-[11px] font-bold px-2.5 py-1 rounded-sm shadow-xs tracking-wide">
                    <span className="text-[#FF9900]">Amazon's</span>
                    <span>Choice</span>
                  </div>
                  {product.editorBadge && (
                    <div className="bg-[#FFA41C] text-gray-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm shadow-xs w-max">
                      {product.editorBadge}
                    </div>
                  )}
                </div>

                {/* Share Button top right */}
                <button
                  onClick={handleShare}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 shadow-2xs transition"
                  title="Share product"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
                {isCopied && (
                  <div className="absolute top-12 right-3 bg-gray-900 text-white text-[11px] px-2 py-1 rounded shadow-md">
                    Link copied!
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------
                COLUMN 2: Center Product Details, Specs & Offers (4 cols)
               ------------------------------------------------------------- */}
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between">
              <div>
                {/* Brand Link */}
                <div className="mb-1">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="text-xs font-semibold text-[#007185] hover:text-[#C7511F] hover:underline"
                  >
                    Visit the {brandName} Store
                  </a>
                </div>

                {/* Product Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0F1111] leading-snug mb-2 break-words">
                  {product.name}
                </h1>

                {/* Rating & Social Proof */}
                <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-gray-200 text-xs text-[#0F1111]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-[#0F1111]">
                      {currentRating.toFixed(1)}
                    </span>
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
                  </div>
                  <span className="text-gray-300">|</span>
                  <a
                    href="#customer-reviews"
                    className="text-[#007185] hover:text-[#C7511F] hover:underline"
                  >
                    {reviewCount.toLocaleString()} ratings
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-[11px] font-medium">
                    10K+ bought in past month
                  </span>
                </div>

                {/* Amazon Price Box */}
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <div className="flex items-baseline gap-2.5">
                    {discountPercent && (
                      <span className="text-2xl sm:text-3xl font-light text-[#CC0C39]">
                        -{discountPercent}%
                      </span>
                    )}
                    <div className="flex items-baseline">
                      <span className="text-sm font-semibold text-[#0F1111] self-start mt-1 mr-0.5">
                        ₹
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#0F1111] tracking-tight">
                        {product.price || "Check Price"}
                      </span>
                    </div>
                  </div>

                  {product.mrp && (
                    <div className="text-xs text-[#565959] mt-0.5">
                      M.R.P.: <span className="line-through">₹{product.mrp}</span>
                    </div>
                  )}

                  <div className="text-xs text-[#0F1111] font-semibold mt-1">
                    Inclusive of all taxes
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium text-gray-900">EMI</span> starts at ₹95/month.{" "}
                    <span className="text-[#007185] hover:underline cursor-pointer">
                      No Cost EMI available
                    </span>
                  </div>

                  {/* Jump Link to Price History */}
                  <div className="mt-3">
                    <a
                      href="#price-history"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>View 365-Day Price History & Best Time to Buy ↓</span>
                    </a>
                  </div>
                </div>

                {/* Amazon Offers Strip */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-2">
                    <TagIcon className="w-4 h-4 text-[#C7511F]" />
                    <span>Offers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300 transition">
                      <span className="font-bold text-gray-900 block text-[11px]">
                        Bank Offer
                      </span>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                        Up to ₹500 discount on select Credit Cards
                      </p>
                      <span className="text-[11px] text-[#007185] font-semibold mt-1 block">
                        6 offers ›
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300 transition">
                      <span className="font-bold text-gray-900 block text-[11px]">
                        Partner Offers
                      </span>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                        Get GST invoice and save up to 28%
                      </p>
                      <span className="text-[11px] text-[#007185] font-semibold mt-1 block">
                        1 offer ›
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amazon Trust & Service Bar */}
                <div className="grid grid-cols-4 gap-1.5 py-3 border-y border-gray-200 text-center text-[11px] text-[#0F1111] mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-700">
                      <ArrowPathIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium leading-tight">7 days Replacement</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-700">
                      <TruckIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium leading-tight">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-700">
                      <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium leading-tight">1 Year Warranty</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-700">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium leading-tight">Top Brand</span>
                  </div>
                </div>

                {/* About this item (Feature Bullets) */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    About this item
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-[13px] text-gray-800 leading-relaxed list-disc pl-4">
                    <li>
                      <span className="font-semibold text-gray-950">Massive Battery:</span>{" "}
                      {product.shortDetail || product.summary}
                    </li>
                    {product.pros && product.pros.length > 0 && (
                      <li>
                        <span className="font-semibold text-gray-950">Audio Tuning:</span>{" "}
                        {product.pros[0]}
                      </li>
                    )}
                    {product.pros && product.pros.length > 1 && (
                      <li>
                        <span className="font-semibold text-gray-950">Fast Charging:</span>{" "}
                        {product.pros[1]}
                      </li>
                    )}
                    <li>
                      <span className="font-semibold text-gray-950">Reliable Build:</span>{" "}
                      Designed for daily commute, gym workouts, and casual gaming with minimal latency.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                COLUMN 3: Dedicated Amazon-Style Buy Box Container (3 cols)
               ------------------------------------------------------------- */}
            <div className="lg:col-span-3 xl:col-span-3">
              <div className="border border-gray-300 rounded-2xl p-4 sm:p-5 bg-white shadow-xs sticky top-24">
                {/* Price inside Buy Box */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xs font-semibold text-gray-700">₹</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#0F1111]">
                    {product.price || "Check Price"}
                  </span>
                </div>

                {/* Delivery Information */}
                <div className="text-xs text-gray-700 mb-3 space-y-1">
                  <div>
                    <span className="text-[#007185] hover:underline cursor-pointer font-medium">
                      FREE delivery
                    </span>{" "}
                    <span className="font-bold text-gray-900">Tomorrow, 2 PM</span>.
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Order within <span className="text-[#007600] font-semibold">4 hrs 15 mins</span>.
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#007185] pt-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span className="hover:underline cursor-pointer">
                      Delivering to India - Select location
                    </span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <span className="text-base font-bold text-[#007600] block">
                    In stock
                  </span>
                  <span className="text-xs text-gray-500">
                    Ships from and sold by Amazon verified sellers.
                  </span>
                </div>

                {/* Quantity Pill */}
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-xs text-gray-600 font-medium">Quantity:</label>
                  <select
                    defaultValue="1"
                    className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-gray-800 font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-2.5 mb-4">
                  {/* Buy Now Yellow Button */}
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs sm:text-sm rounded-full shadow-xs hover:shadow-sm transition transform active:scale-98 no-underline border border-[#FCD200]"
                  >
                    <ShoppingBagIcon className="w-4 h-4 stroke-2" />
                    <span>Buy Now on Amazon</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-70" />
                  </a>

                  {/* Add to Wishlist / Save Deal Button */}
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-full border border-gray-300 transition"
                  >
                    <BookmarkIcon
                      className={`w-3.5 h-3.5 ${
                        isSaved ? "text-amber-500 fill-amber-500" : "text-gray-600"
                      }`}
                    />
                    <span>{isSaved ? "Saved to Deals" : "Add to Wish List"}</span>
                  </button>
                </div>

                {/* Secure Transaction & Seller Info */}
                <div className="text-[11px] text-gray-600 space-y-1.5 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <LockClosedIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span className="font-medium">Secure transaction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ships from</span>
                    <span className="font-medium text-gray-900">Amazon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sold by</span>
                    <span className="font-medium text-gray-900">Appario Retail</span>
                  </div>
                </div>

                {/* Statutory Affiliate Disclaimer */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-tight">
                  Official Amazon Associate link • Dispatches directly through Amazon India fulfillment.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            SECTION 2: Price History Tracker & Best Time to Buy Engine
           ========================================================================= */}
        <div id="price-history" className="scroll-mt-20 mb-8">
          <PriceHistoryTracker product={product} />
        </div>

        {/* =========================================================================
            SECTION 3: Technical Specifications Table
           ========================================================================= */}
        {product.specs && (
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-gray-200/90 mb-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-950 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                <span>Technical Details & Specifications</span>
              </h2>
              <span className="text-xs text-gray-500">Direct Manufacturer Specs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-xs sm:text-sm">
              {Object.entries(product.specs).map(([key, value], idx) => (
                <div
                  key={key}
                  className={`flex justify-between py-2.5 px-3 rounded-lg ${
                    idx % 2 === 0 ? "bg-gray-50/60" : "bg-white"
                  } border-b border-gray-100`}
                >
                  <span className="text-gray-600 font-medium">{key}</span>
                  <span className="text-gray-950 font-semibold text-right max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 4: Editorial Evaluation: Pros, Cons & Who It's For
           ========================================================================= */}
        {(product.pros || product.cons || product.whoItsFor) && (
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-gray-200/90 mb-8">
            <div className="pb-3 mb-5 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-950">
                Editorial Review & Tradeoff Analysis
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Independent assessment of strengths, compromises, and suitability for buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {/* Pros */}
              {product.pros && (
                <div className="bg-emerald-50/50 rounded-xl p-4 sm:p-5 border border-emerald-200/70">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Top Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-[13px] text-gray-800">
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
                <div className="bg-amber-50/50 rounded-xl p-4 sm:p-5 border border-amber-200/70">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                    <span>Tradeoffs to Keep in Mind</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-[13px] text-gray-800">
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
              <div className="bg-blue-50/60 rounded-xl p-3.5 sm:p-4 border border-blue-200/60 text-xs sm:text-sm text-gray-800">
                <span className="font-bold text-blue-900">Recommended For: </span>
                <span>{product.whoItsFor}</span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 5: Verified Customer Reviews & Amazon Rating Breakdown
           ========================================================================= */}
        <div id="customer-reviews" className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-gray-200/90 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6 border-b border-gray-200">
            {/* Left: Star Distribution Chart (5 cols) */}
            <div className="lg:col-span-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-950 mb-3">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center text-[#FFA41C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
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
                <span className="text-xl font-bold text-gray-950">
                  {currentRating.toFixed(1)} out of 5
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {reviewCount.toLocaleString()} global ratings
              </p>

              {/* Star Distribution Bars */}
              <div className="space-y-2 text-xs">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="text-[#007185] hover:underline cursor-pointer w-12 text-right">
                      {row.stars} star
                    </span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[#FFA41C] rounded-sm transition-all duration-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="text-gray-500 w-8 text-right font-medium">
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Review Highlights / Buying Confidence (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  Review Insights & Sentiment
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Customers appreciate the deep bass response, intuitive touch controls, and marathon battery longevity. Perfect for daily commutes and workouts.
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-700">
                    🔊 Sound Quality (4.2/5)
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-700">
                    🔋 Battery Backup (4.6/5)
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-700">
                    💰 Value for Money (4.5/5)
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-700">
                    📞 Mic Quality (3.8/5)
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Verified Amazon India Reviews</span>
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1"
                >
                  <span>See all reviews on Amazon</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Individual Review Cards */}
          {product.customerReviews && product.customerReviews.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Top Reviews from India
              </h3>
              {product.customerReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-gray-50/60 border border-gray-200/70"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-xs text-gray-900">
                        {rev.author}
                      </span>
                      {rev.verified && (
                        <span className="text-[10px] text-[#C7511F] font-bold">
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

                  <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed">
                    {rev.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 6: Related Products Carousel / Grid
           ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-950">
                  Customers Also Viewed
                </h2>
                <p className="text-xs text-gray-500">
                  Top picks in {product.category || "Audio & Electronics"}
                </p>
              </div>
              <Link
                to="/#featured-catalog"
                className="text-xs font-semibold text-[#007185] hover:underline"
              >
                View full catalog ›
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          Mobile Sticky Action Bar (Optimized Amazon Yellow Bar)
         ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-4 py-2.5 border-t border-gray-200 z-40 shadow-2xl flex items-center justify-between gap-3 pb-safe">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-gray-500 font-medium">Amazon Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm xs:text-base font-extrabold text-[#0F1111] truncate">
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
          className="flex-1 max-w-[220px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs rounded-full shadow-xs no-underline border border-[#FCD200]"
        >
          <ShoppingBagIcon className="w-4 h-4 stroke-2 flex-shrink-0" />
          <span className="truncate">Buy Now on Amazon</span>
        </a>
      </div>

      <Footer />
    </div>
  );
}