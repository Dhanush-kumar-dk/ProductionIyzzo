import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import LogIn from "../components/Login";
import Footer from "../components/Footer";
import ProductCard, { Product } from "./ProductCard";
import { API_BASE_URL } from "../config/api";
import { getActiveTrackingId, buildAffiliateUrl, buildMarketplaceSearchUrl } from "../utils/affiliate";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { updateSEO } from "../utils/seo";

interface SearchResult {
  DetailPageURL: string;
  Title: string;
  DisplayAmount?: string;
  image: string;
}

export default function SearchResults() {
  const { searchTerm = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<SearchResult[]>(
    location.state?.results || []
  );
  const [loading, setLoading] = useState(!location.state?.results);
  const [error, setError] = useState<string | null>(null);
  const [openLogIn, setOpenLogIn] = useState(false);
  const queryTimestamp = useState(() => new Date().toLocaleString())[0];

  useEffect(() => {
    updateSEO({
      title: `Search: "${searchTerm}" | Yearnit Product Guides`,
      description: `Explore product guides, specifications, and buyer reviews matching "${searchTerm}" on Yearnit.`,
      url: `https://yearnit.in/search/${encodeURIComponent(searchTerm)}`,
      type: "website",
      keywords: [searchTerm, "Product Search", "Yearnit", "Buyer Guides", "India"],
    });

    if (searchTerm) {
      const partnerTag = getActiveTrackingId();

      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: searchTerm,
          searchIndex: "All",
          partnerTag: partnerTag,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Search request failed");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        })
        .catch((err) => {
          console.warn("Search API fallback:", err);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      {/* Login Modal */}
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      <TopBar openLogIn={() => setOpenLogIn(true)} />

      <main className="flex-1 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
          {/* Header & Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
            <div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mb-1.5 font-medium transition"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>Back to All Product Guides</span>
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                Results for <span className="text-blue-600">"{searchTerm}"</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Showing verified results from live product catalog.
              </p>
            </div>
          </div>

          {/* Pricing Disclaimer Banner (Mandatory under Amazon Associates Policy) */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs text-amber-900 mb-4 sm:mb-6 flex items-start gap-2.5">
            <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs">Amazon Associates Price & Availability Notice:</p>
              <p className="text-[10px] sm:text-[11px] text-amber-800 leading-relaxed">
                Product prices and availability are accurate as of {queryTimestamp} and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.
              </p>
            </div>
          </div>

          {/* Results Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Searching product catalog...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
              <p className="text-red-500 font-medium mb-3 text-xs sm:text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔍</div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                Looking for "{searchTerm}"?
              </h2>
              <p className="text-xs text-gray-500 mb-4 sm:mb-6 leading-relaxed">
                Direct search on official Amazon India storefront with our active Associate tag.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                <a
                  href={buildMarketplaceSearchUrl(searchTerm)}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition border border-[#FCD200] no-underline"
                >
                  <span>Search on Amazon.in</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  Browse Featured Guides
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {searchResults.map((item, index) => {
                const imageUrl = item.image
                  ? item.image.includes("_SL160_")
                    ? item.image.replace("_SL160_", "_SL500_")
                    : item.image
                  : "";

                const productItem: Product = {
                  id: `search-${index}-${encodeURIComponent(item.Title.slice(0, 15))}`,
                  name: item.Title,
                  price: item.DisplayAmount ? item.DisplayAmount.replace(/[^0-9.]/g, "") : undefined,
                  isLivePrice: Boolean(item.DisplayAmount),
                  priceTimestamp: queryTimestamp,
                  image: imageUrl,
                  url: buildAffiliateUrl(item.DetailPageURL),
                  summary: "Verified product catalog item with direct partner storefront link.",
                  editorBadge: "Catalog Match",
                };

                return (
                  <ProductCard key={productItem.id} product={productItem} />
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
