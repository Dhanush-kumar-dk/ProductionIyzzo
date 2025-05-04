import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import Firebase auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import Logo from "../assets/Tile-Logo.png";
import AdminButton from "./AdminButton";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function TopBar({ openLogIn }: { openLogIn: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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
    if (!selectedCategory) {
      alert("Please select a category before searching.");
      return;
    }
    try {
      let partnerTag = localStorage.getItem("trackingId");
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword: searchTerm,
            searchIndex: selectedCategory,
            partnerTag: partnerTag,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      navigate(`/search/${searchTerm}`, { state: { results: data } });
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Error fetching search results. Please try again.");
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-12 py-4 bg-white shadow-md">
      <img className="h-6" src={Logo} alt="Logo" />

      {/* Search Bar in Navbar */}
      <div className="flex items-center bg-[#2790C3] text-white rounded-full px-6 py-2 w-full max-w-lg relative">
        <button
          onClick={handleSearch}
          className="text-lg text-white cursor-pointer bg-transparent border-none"
        >
          🔍
        </button>
        <input
          id="searchInput"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-transparent text-white placeholder-white placeholder-opacity-80 outline-none px-4 text-base"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white text-[#2790C3] px-4 py-1 rounded-lg border border-gray-300 text-base cursor-pointer outline-none"
        >
          <option>Select Category</option>
          <option value="All">All</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Category 3">Category 3</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        {user && <AdminButton />}{" "}
        {/* Show AdminButton only if user is logged in */}
        {user ? (
          <button
            className="bg-[#2790C3] text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-[#1f7aa6]"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="bg-[#2790C3] text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-[#1f7aa6]"
            onClick={openLogIn}
          >
            Register Now
          </button>
        )}
      </div>
    </header>
  );
}
