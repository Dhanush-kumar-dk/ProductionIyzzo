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
      const partnerTag = localStorage.getItem("trackingId"); // Get the partner tag (trackingId) from localStorage

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

      <div className="container mx-auto mt-6 px-4">
        <h2 className="text-xl font-bold mb-4">
          Search Results for:{" "}
          <span className="text-blue-500">{searchTerm}</span>
        </h2>

        {searchResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {searchResults.map((item, index) => (
              <div key={index} className="product-card slide-in group relative">
                <div className="image-container">
                  <img
                    src={item.image.replace("_SL160_", "_SL500_")}
                    alt={item.Title}
                  />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <h3 className="text-gray-900 font-bold text-lg">
                    {item.Title}
                  </h3>
                  <p className="text-gray-900 font-bold text-lg">
                    {item.DisplayAmount}
                  </p>
                </div>

                <a
                  href={item.DetailPageURL}
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
    </>
  );
}
