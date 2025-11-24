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
    <div className="w-full mt-6 px-3 sm:px-4 lg:px-10">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-900">
        Featured Products
      </h2>

      {loading ? (
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Loading...
        </p>
      ) : (
        <div
          className="
            grid gap-4 sm:gap-5 md:gap-6
            grid-cols-1
            xs:grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="
                product-card
                group relative
                bg-white rounded-2xl shadow-sm
                border border-gray-100
                p-3 sm:p-4
                flex flex-col
                h-full
                transition-all duration-300
                hover:shadow-lg hover:-translate-y-1
              "
            >
              {/* Image Carousel */}
              <div className="image-container w-full mb-3 sm:mb-4">
                <div className="relative w-full overflow-hidden rounded-xl aspect-[3/4] bg-gray-50">
                  <CCarousel
                    transition="crossfade"
                    controls
                    indicators
                    className="h-full w-full"
                  >
                    <CCarouselItem>
                      <img
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                        alt={product.name}
                      />
                    </CCarouselItem>
                    <CCarouselItem>
                      <img
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                        src={product.image1}
                        alt={product.name}
                      />
                    </CCarouselItem>
                    <CCarouselItem>
                      <img
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                        src={product.image2}
                        alt={product.name}
                      />
                    </CCarouselItem>
                  </CCarousel>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 sm:gap-2 flex-1">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base md:text-lg line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-900 font-bold text-base sm:text-lg mt-1">
                  ₹{product.price}
                </p>
              </div>

              {/* Button */}
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-3 sm:mt-4
                  inline-flex items-center justify-center
                  w-full
                  rounded-lg
                  text-xs sm:text-sm
                  font-semibold
                  bg-blue-600 text-white
                  py-1.5 sm:py-2
                  hover:bg-blue-700
                  hover:scale-[1.03] active:scale-[0.97]
                  transition-all duration-300
                  shadow-sm hover:shadow-md
                  no-underline
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                style={{ textDecoration: "none" }}
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
