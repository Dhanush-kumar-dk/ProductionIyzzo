import { supabase } from "../supabase";
import { useState } from "react";
import { fetchProductDataFromUrl } from "../utils/amazonUrlParser";

export default function ProductUploadForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const handleFetchFromUrl = async (inputUrl?: string) => {
    const target = (inputUrl || url).trim();
    if (!target) return;

    setIsFetchingUrl(true);
    setFetchNotice({ type: "info", message: "Scraping product page for live data..." });
    try {
      const data = await fetchProductDataFromUrl(target);
      setName(data.name);
      const cleanPrice = data.price.replace(/[^0-9]/g, "");
      if (cleanPrice) setPrice(cleanPrice);
      setImage(data.image);
      setUrl(data.url);
      setFetchNotice({
        type: "success",
        message: `✨ ${data.sourceMessage || "Successfully scraped all product details from URL!"}`
      });
    } catch (err: unknown) {
      setFetchNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to scrape product data from URL."
      });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);
    try {
      const { error } = await supabase.from("products").insert([
        {
          name,
          price,
          image,
          url,
        },
      ]);
      if (error) {
        console.warn("Supabase insert notice:", error.message);
      }
    } catch (err) {
      console.error("Unable to add product:", err);
      alert("Unable to add product!");
    }
    setIsUploading(false);
    onClose();
  };

  return (
    <div
      className="
        w-full max-w-md 
        mx-auto 
        border p-4 sm:p-6 
        rounded-2xl bg-white 
        shadow-xl
      "
    >
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
        <span className="font-extrabold text-base sm:text-lg text-gray-900 block">
          Add New Product
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm font-bold"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* ⚡ URL Scraper Section */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300/80 space-y-2">
          <label
            htmlFor="referralUrl"
            className="block text-xs font-bold text-amber-950 flex items-center justify-between"
          >
            <span>⚡ Paste Product URL to Auto-Scrape</span>
            <span className="text-[10px] text-amber-800 font-semibold">Amazon & Stores</span>
          </label>
          <div className="relative">
            <input
              type="url"
              id="referralUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFetchFromUrl();
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted && pasted.includes("http")) {
                  setTimeout(() => handleFetchFromUrl(pasted), 100);
                }
              }}
              placeholder="https://www.amazon.in/dp/B0..."
              required
              className="
                h-9 pr-24
                border block w-full 
                rounded-lg border-amber-300 shadow-xs 
                focus:border-amber-500 focus:ring-1 focus:ring-amber-400
                text-xs px-2.5 bg-white font-medium
              "
            />
            <button
              type="button"
              onClick={() => handleFetchFromUrl()}
              disabled={isFetchingUrl || !url.trim()}
              className="absolute right-1 top-1 bottom-1 px-3 text-[11px] font-extrabold rounded-md bg-amber-400 hover:bg-amber-500 text-slate-950 disabled:opacity-40 transition shadow-xs cursor-pointer"
            >
              {isFetchingUrl ? "Scraping..." : "⚡ Scrape"}
            </button>
          </div>
          {fetchNotice && (
            <p
              className={`text-[11px] font-semibold leading-tight ${
                fetchNotice.type === "success"
                  ? "text-emerald-700"
                  : fetchNotice.type === "error"
                  ? "text-red-600"
                  : "text-amber-700"
              }`}
            >
              {fetchNotice.message}
            </p>
          )}
        </div>

        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="
              mt-1 h-9 px-2.5
              border block w-full 
              rounded-lg border-gray-300 shadow-xs 
              focus:border-blue-400 focus:ring-1 focus:ring-blue-300
              text-xs text-gray-900
            "
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-xs font-semibold text-gray-700"
          >
            Price (₹)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="
              mt-1 h-9 px-2.5
              border block w-full 
              rounded-lg border-gray-300 shadow-xs 
              focus:border-blue-400 focus:ring-1 focus:ring-blue-300
              text-xs text-gray-900
            "
          />
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-xs font-semibold text-gray-700"
          >
            Primary Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="
              mt-1 h-9 px-2.5
              border block w-full 
              rounded-lg border-gray-300 shadow-xs 
              focus:border-blue-400 focus:ring-1 focus:ring-blue-300
              text-xs text-gray-900
            "
          />
          {image && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={image}
                alt="Preview"
                className="w-10 h-10 object-contain rounded border border-gray-200 bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-[11px] text-gray-500 font-medium">Image Preview Loaded</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="
              w-full sm:w-auto
              px-4 py-2 
              text-xs font-semibold text-gray-700 
              bg-white border border-gray-300 rounded-lg 
              hover:bg-gray-50 
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="
              w-full sm:w-auto
              px-4 py-2 
              text-xs font-bold text-white 
              bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg 
              disabled:opacity-70 transition
            "
          >
            {isUploading ? "Uploading..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
