import { firestore } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);
    try {
      await addDoc(collection(firestore, "products"), {
        name,
        price,
        image,
        url,
      });
    } catch {
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
          <label
            htmlFor="referralUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Referral URL
          </label>
          <input
            type="url"
            id="referralUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
