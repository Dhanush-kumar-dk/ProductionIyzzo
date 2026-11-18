import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSavedDeals, toggleSaveDeal, SavedProduct } from "../utils/wishlist";
import { buildAffiliateUrl } from "../utils/affiliate";
import { getProductPath } from "../utils/productUrl";
import { XMarkIcon, TrashIcon, ArrowTopRightOnSquareIcon, HeartIcon } from "@heroicons/react/24/outline";

interface SavedDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedDealsModal({ isOpen, onClose }: SavedDealsModalProps) {
  const [deals, setDeals] = useState<SavedProduct[]>([]);

  const loadDeals = () => {
    setDeals(getSavedDeals());
  };

  useEffect(() => {
    if (isOpen) {
      loadDeals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleUpdate = () => loadDeals();
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleRemove = (deal: SavedProduct) => {
    toggleSaveDeal(deal);
    loadDeals();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Saved Deals Wishlist">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col font-poppins">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <HeartIcon className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Saved Deals</h2>
                <p className="text-xs text-gray-500">
                  {deals.length} {deals.length === 1 ? "deal" : "deals"} saved for later
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close saved deals"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Deals List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-3">
                  <HeartIcon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-800 text-base mb-1">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mb-4">
                  Tap the heart icon on any deal card to save it here and track price drops!
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Explore Deals
                </button>
              </div>
            ) : (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow transition items-center"
                >
                  <Link
                    to={getProductPath(deal)}
                    onClick={onClose}
                    className="flex gap-3 flex-1 min-w-0 items-center no-underline"
                  >
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                        {deal.name}
                      </h4>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        ₹{deal.price}
                      </p>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-1 items-end">
                    <a
                      href={buildAffiliateUrl(deal.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition"
                      title="View on Store"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleRemove(deal)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                      title="Remove from saved"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {deals.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 pb-safe">
              <p className="text-[11px] text-gray-400 text-center mb-3">
                * Prices may change based on availability and active discounts.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
