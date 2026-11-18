import { metaEvents, parsePriceValue } from "./tracking";

export type SavedProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  url: string;
};

const WISHLIST_KEY = "iyzzo_saved_deals";

export const getSavedDeals = (): SavedProduct[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isDealSaved = (id: string): boolean => {
  const deals = getSavedDeals();
  return deals.some((d) => d.id === id);
};

export const toggleSaveDeal = (product: SavedProduct): boolean => {
  const deals = getSavedDeals();
  const exists = deals.some((d) => d.id === product.id);
  let updated: SavedProduct[];
  if (exists) {
    updated = deals.filter((d) => d.id !== product.id);
  } else {
    updated = [product, ...deals];
    metaEvents.addToWishlist({
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: parsePriceValue(product.price),
      currency: "INR",
    });
  }
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (err) {
    console.error("Failed to update saved deals", err);
  }
  return !exists;
};
