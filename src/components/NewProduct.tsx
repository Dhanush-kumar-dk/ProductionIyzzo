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
        name: name,
        price: price,
        image: image,
        url: url,
      });
    } catch {
      alert("Unable to add product!");
    }
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="w-96 h-auto border p-4 rounded-md bg-white">
      <span className="font-bold">Add Product:</span>
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
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
            className="mt-1 h-8 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Price{" "}
          </label>
          <input
            type="text"
            id="Number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-b h-8 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

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
            className="mt-1 h-8 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
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
            className="mt-1 h-8 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isUploading ? "Uploading..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
