import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Logo from "../assets/Tile-Logo.png";
import AdminButton from "./AdminButton";

export default function TopBar({ openLogIn }: { openLogIn: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Track screen width (< 800px = mobile)
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 800);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    await fetch("https://affiliate-server-8irx.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  const handleSearch = async () => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      alert("Please enter a search term");
      return;
    }
    if (!selectedCategory) {
      alert("Please select a category first");
      return;
    }

    try {
      const partnerTag = localStorage.getItem("trackingId");
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: trimmedSearch,
            searchIndex: selectedCategory,
            partnerTag,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      navigate(`/search/${trimmedSearch}`, { state: { results: data } });
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Error fetching results");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  return (
    <>
      <header className="font-poppins w-full bg-white shadow-md px-3 sm:px-6 lg:px-12 py-3 sticky top-0 z-30">
        <div className="flex items-center w-full gap-3 sm:gap-5 lg:gap-6 flex-wrap">
          {/* Logo (responsive) */}
          <div className="flex-shrink-0">
            <img
              className="h-6 sm:h-8 md:h-10 w-auto"
              src={Logo}
              alt="Logo"
            />
          </div>

          {/* Centered Search Bar */}
          <div className="flex-grow flex justify-center">
            <div className="flex items-center bg-[#2790C3] text-white rounded-full px-4 py-2 w-full max-w-3xl min-w-[220px]">
              {/* Search button with icon */}
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  />
                </svg>
              </button>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search for amazing deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-grow bg-transparent text-white px-3 text-sm sm:text-base outline-none placeholder-white/80"
              />

              {/* Dropdown (no border) */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="
                    appearance-none
                    bg-white text-[#2790C3]
                    pl-3 pr-8 py-1.5
                    rounded-full 
                    text-xs sm:text-sm cursor-pointer
                    outline-none focus:outline-none focus:ring-0
                  "
                >
                  <option value="">📂 Choose</option>
                  <option value="All">🛒 All</option>
                  <option value="Electronics">🔌 Electronics</option>
                  <option value="Clothing">👕 Clothing</option>
                  <option value="Category 3">✨ Category 3</option>
                </select>

                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#2790C3] text-xs">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex-shrink-0 flex items-center gap-3 ml-0 sm:ml-3 mt-2 sm:mt-0">
            {user && <AdminButton />}

            {/* Desktop / tablet: show Register in top bar when not logged in */}
            {!isMobile && !user && (
              <button
                className="bg-[#2790C3] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1f7aa6] transition"
                onClick={openLogIn}
              >
                Register
              </button>
            )}

            {/* Desktop / tablet logout */}
            {!isMobile && user && (
              <button
                className="bg-[#2790C3] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1f7aa6] transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

            {/* Mobile logout (keep logout visible on mobile if logged in) */}
            {isMobile && user && (
              <button
                className="bg-[#2790C3] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1f7aa6] transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating small popup button for mobile (when NOT logged in) */}
      {isMobile && !user && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={openRegisterModal}
            className="
              bg-[#2790C3] text-white shadow-xl 
              px-4 py-3 rounded-full text-sm font-semibold
              animate-bounce hover:animate-none
            "
          >
            🎁 Get Exclusive Discounts — Register
          </button>
        </div>
      )}

      {/* Centered Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm p-5 relative font-poppins">
            {/* Close button top-right */}
            <button
              onClick={closeRegisterModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">
              Get Exclusive discouunts on register
            </h2>

            <p className="text-sm text-gray-600 mb-5 text-center">
              Sign up now to unlock special offers, personalized deals, and
              more!
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  closeRegisterModal();
                  openLogIn();
                }}
                className="w-full bg-[#2790C3] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#1f7aa6] transition"
              >
                Register Now
              </button>
              <button
                onClick={closeRegisterModal}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-50 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
