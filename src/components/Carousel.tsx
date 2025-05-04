import { useEffect, useState } from "react";
import { CCarousel, CCarouselItem } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  image1: string;
  image2: string;
  url: string;
};

function Carousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://affiliate-server-8irx.onrender.com/getitems",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const trackingid = localStorage.getItem("trackingId");

        const updatedProducts = data.map((product: Product) => ({
          ...product,
          url: trackingid ? `${product.url}?tag=${trackingid}` : product.url,
        }));

        setProducts(updatedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full mt-6 px-4">
      <h2 className="text-xl font-bold mb-4">Featured Products</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {products.map((product, index) => (
            <div key={index} className="product-card slide-in group relative">
              {/* Product Image Carousel */}
              <div className="image-container">
                <CCarousel transition="crossfade">
                  <CCarouselItem>
                    <img
                      className="object-cover rounded-md h-30 w-full"
                      src={product.image}
                      alt={product.name}
                    />
                  </CCarouselItem>
                  <CCarouselItem>
                    <img
                      className="object-cover rounded-md h-30 w-full"
                      src={product.image1}
                      alt={product.name}
                    />
                  </CCarouselItem>
                  <CCarouselItem>
                    <img
                      className="object-cover rounded-md h-30 w-full"
                      src={product.image2}
                      alt={product.name}
                    />
                  </CCarouselItem>
                </CCarousel>
              </div>

              {/* Card Content */}
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-gray-900 font-bold text-lg">
                  {product.name}
                </h3>
                <p className="text-gray-900 font-bold text-lg">
                  ₹{product.price}
                </p>
              </div>

              {/* View Product Button */}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="product-button"
              >
                View Product
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
