import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import LogIn from "../components/Login";
import Footer from "../components/Footer";
import SavedDealsModal from "../components/SavedDealsModal";
import ProductCard, { Product } from "./ProductCard";
import { API_BASE_URL } from "../config/api";
import { getActiveTrackingId, buildAffiliateUrl, buildAmazonSearchUrl } from "../utils/affiliate";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";

interface SearchResult {
  DetailPageURL: string;
  Title: string;
  DisplayAmount: string;
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
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
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
          // Don't show hard error screen; let the zero-results UI show Amazon search button
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
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* Saved Deals Drawer */}
      <SavedDealsModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      <TopBar
        openLogIn={() => setOpenLogIn(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
          {/* Header & Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-gray-200 pb-4">
            <div>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mb-2 font-medium transition"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>Back to All Deals</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Results for <span className="text-blue-600">"{searchTerm}"</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Found {searchResults.length} verified Amazon product match{searchResults.length === 1 ? "" : "es"}.
              </p>
            </div>
          </div>

          {/* Results Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm font-medium">
                Searching Amazon catalog for best deals...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
              <p className="text-red-500 font-medium mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Looking for "{searchTerm}" on Amazon?
              </h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Click below to search the full live Amazon catalog with verified deals, Prime delivery, and the best available prices.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={buildAmazonSearchUrl(searchTerm)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold text-sm rounded-xl shadow-sm transition border border-[#FCD200] no-underline"
                >
                  <span>Search directly on Amazon</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
                >
                  Browse Store Deals
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
              {searchResults.map((item, index) => {
                const imageUrl = item.image
                  ? item.image.includes("_SL160_")
                    ? item.image.replace("_SL160_", "_SL500_")
                    : item.image
                  : "";

                const productItem: Product = {
                  id: `search-${index}-${encodeURIComponent(item.Title.slice(0, 15))}`,
                  name: item.Title,
                  price: item.DisplayAmount
                    ? item.DisplayAmount.replace(/[^0-9.]/g, "")
                    : "1,499",
                  image: imageUrl,
                  url: buildAffiliateUrl(item.DetailPageURL),
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
