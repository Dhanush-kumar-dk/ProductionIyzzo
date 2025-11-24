import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";

interface SearchResult {
  DetailPageURL: string;
  Title: string;
  DisplayAmount: string;
  image: string;
}

export default function SearchResults() {
  const { searchTerm } = useParams();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResult[]>(
    location.state?.results || []
  );

  useEffect(() => {
    if (searchTerm) {
      const partnerTag = localStorage.getItem("trackingId");

      if (partnerTag) {
        fetch("https://affiliate-server-8irx.onrender.com/search", {
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
          .then((res) => res.json())
          .then((data) => {
            console.log("Search results:", data);
            setSearchResults(data);
          })
          .catch((error) =>
            console.error("Error fetching search results:", error)
          );
      } else {
        console.error("No partnerTag found in localStorage.");
      }
    }
  }, [searchTerm]);

  const openLogIn = () => {
    console.log("Trigger login modal or redirect");
  };

  return (
    <>
      <TopBar openLogIn={openLogIn} />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4 lg:px-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Search Results for:{" "}
            <span className="text-blue-500 break-words">{searchTerm}</span>
          </h2>

          {searchResults.length === 0 ? (
            <p className="text-gray-600 text-sm sm:text-base">
              No results found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className="
                    product-card slide-in group relative
                    flex flex-col
                    bg-white rounded-2xl
                    shadow-sm hover:shadow-lg
                    border border-gray-100
                    p-3 sm:p-4
                    transition-all duration-300
                  "
                >
                  {/* Image */}
                  <div className="image-container w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.image.replace("_SL160_", "_SL500_")}
                      alt={item.Title}
                      className="
                        h-full w-full
                        object-contain
                        group-hover:scale-105
                        transition-transform duration-300
                      "
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 mt-3 flex-1">
                    <h3 className="text-gray-900 font-semibold text-sm sm:text-base md:text-lg line-clamp-3">
                      {item.Title}
                    </h3>
                    <p className="text-gray-900 font-bold text-sm sm:text-base">
                      {item.DisplayAmount}
                    </p>
                  </div>

                  {/* Button */}
                  <a
                    href={item.DetailPageURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      product-button
                      mt-3
                      inline-flex items-center justify-center
                      w-full
                      rounded-xl
                      bg-blue-600 hover:bg-blue-700
                      text-white text-sm sm:text-base font-medium
                      py-2.5
                      shadow-sm hover:shadow-md
                      transition-all duration-300
                    "
                  >
                    View Product
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
