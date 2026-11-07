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
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  const handleFetchFromUrl = async (inputUrl?: string) => {
    const target = (inputUrl || url).trim();
    if (!target) return;

    setIsFetchingUrl(true);
    setFetchNotice(null);
    try {
      const data = await fetchProductDataFromUrl(target);
      setName(data.name);
      const cleanPrice = data.price.replace(/[^0-9]/g, "");
      if (cleanPrice) setPrice(cleanPrice);
      setImage(data.image);
      setUrl(data.url);
      setFetchNotice("✨ Successfully fetched product details!");
    } catch (err: unknown) {
      setFetchNotice(
        err instanceof Error ? err.message : "Failed to fetch from URL"
      );
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
        rounded-md bg-white 
        shadow-md
      "
    >
      <span className="font-bold text-base sm:text-lg block mb-2">
        Add Product
      </span>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
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
              mt-1 h-9 
              border-2 block w-full 
              rounded-md border-gray-300 shadow-sm 
              focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
              text-sm
            "
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="
              mt-1 h-9 
              border-2 block w-full 
              rounded-md border-gray-300 shadow-sm 
              focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
              text-sm
            "
          />
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="
              mt-1 h-9 
              border-2 block w-full 
              rounded-md border-gray-300 shadow-sm 
              focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
              text-sm
            "
          />
        </div>

        {/* Referral URL */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="referralUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Amazon / Referral URL
            </label>
            {url && (
              <button
                type="button"
                onClick={() => handleFetchFromUrl()}
                disabled={isFetchingUrl}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                {isFetchingUrl ? "Fetching..." : "⚡ Auto-Fetch Data"}
              </button>
            )}
          </div>
          <div className="relative mt-1">
            <input
              type="url"
              id="referralUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted && pasted.includes("amazon")) {
                  setTimeout(() => handleFetchFromUrl(pasted), 100);
                }
              }}
              placeholder="https://www.amazon.in/dp/..."
              required
              className="
                h-9 pr-20
                border-2 block w-full 
                rounded-md border-gray-300 shadow-sm 
                focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                text-sm px-2
              "
            />
            <button
              type="button"
              onClick={() => handleFetchFromUrl()}
              disabled={isFetchingUrl || !url.trim()}
              className="absolute right-1 top-1 bottom-1 px-2.5 text-xs font-bold rounded bg-amber-400 hover:bg-amber-500 text-slate-950 disabled:opacity-40"
            >
              {isFetchingUrl ? "..." : "Fetch"}
            </button>
          </div>
          {fetchNotice && (
            <p className="mt-1 text-xs text-emerald-700 font-medium">
              {fetchNotice}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="
              w-full sm:w-auto
              px-4 py-2 
              text-sm font-medium text-gray-700 
              bg-white border border-gray-300 rounded-md 
              hover:bg-gray-50 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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
              text-sm font-medium text-white 
              bg-blue-600 border border-transparent rounded-md 
              hover:bg-blue-700 disabled:opacity-70 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            "
          >
            {isUploading ? "Uploading..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
