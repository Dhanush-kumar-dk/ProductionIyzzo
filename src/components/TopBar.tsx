import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AdminButton from "./AdminButton";
import { API_BASE_URL } from "../config/api";
import { getActiveTrackingId } from "../utils/affiliate";
import { verifyIsAdmin, isEmailAdmin } from "../utils/admin";
import { getSavedDeals } from "../utils/wishlist";
import { ShieldCheckIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

interface TopBarProps {
  openLogIn: () => void;
  onOpenWishlist?: () => void;
  onCategorySelect?: (category: string) => void;
}

export default function TopBar({
  openLogIn,
  onOpenWishlist,
  onCategorySelect,
}: TopBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(() => getSavedDeals().length);

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return (
      localStorage.getItem("isAdmin") === "true" ||
      isEmailAdmin(localStorage.getItem("email"))
    );
  });

  // Track auth state & admin verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem("email", currentUser.email || "");
        const verified = await verifyIsAdmin(currentUser);
        setIsAdmin(verified);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Wishlist Count
  useEffect(() => {
    const updateWishlist = () => {
      setWishlistCount(getSavedDeals().length);
    };
    window.addEventListener("wishlistUpdated", updateWishlist);
    return () => window.removeEventListener("wishlistUpdated", updateWishlist);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.reload();
    }
  };

  const handleSearch = async () => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return;

    setIsSearching(true);
    try {
      const partnerTag = getActiveTrackingId();
      const searchCat = selectedCategory === "All" ? "All" : selectedCategory;
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: trimmedSearch,
          searchIndex: searchCat,
          partnerTag,
        }),
      });

      if (!response.ok) throw new Error("Search request did not return 200");
      const data = await response.json();
      navigate(`/search/${encodeURIComponent(trimmedSearch)}`, {
        state: { results: data },
      });
    } catch (error) {
      console.warn("Backend search fallback:", error);
      navigate(`/search/${encodeURIComponent(trimmedSearch)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleQuickCategoryClick = (categoryName: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName === "All" ? "" : categoryName);
    }
    const catalogEl = document.getElementById("featured-catalog");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Formatted User Display Name
  const userDisplayName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : localStorage.getItem("email")
    ? localStorage.getItem("email")!.split("@")[0]
    : "Member";

  // Modern Clean Omnibar
  const renderOmnibar = (isMobile = false) => (
    <div
      className={`relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200/90 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20 transition-all duration-200 overflow-hidden ${
        isMobile ? "w-full" : "w-full"
      }`}
    >
      {/* Category Dropdown (Desktop / Tablet only) */}
      {!isMobile && (
        <div className="relative border-r border-slate-200/80 hidden md:block flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter search category"
            className="appearance-none bg-slate-50 hover:bg-slate-100/80 text-slate-700 text-xs font-semibold py-2.5 pl-3.5 pr-8 cursor-pointer outline-none transition"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Fashion</option>
            <option value="Home">Home & Living</option>
            <option value="Gadgets">Gadgets</option>
          </select>
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Text Input */}
      <div className="relative flex-1 flex items-center min-w-0">
        <input
          type="text"
          placeholder="Search products, brands, reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 outline-none placeholder-slate-400 bg-transparent font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="p-1.5 text-slate-400 hover:text-slate-600 mr-1 flex-shrink-0 transition rounded-full hover:bg-slate-100"
            aria-label="Clear search text"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Submit Button */}
      <button
        type="button"
        onClick={handleSearch}
        disabled={isSearching}
        className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 px-4 sm:px-5 py-2.5 transition-all flex items-center justify-center disabled:opacity-50 flex-shrink-0 m-1 rounded-xl shadow-xs"
        aria-label="Execute search"
      >
        {isSearching ? (
          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* ── 1. Top Minimalist Announcement & Compliance Bar ── */}
      <div className="w-full bg-[#0A0E1A] text-slate-300 text-[11px] py-1.5 border-b border-white/[0.06] font-poppins">
        <div className="w-full px-3 sm:px-6 lg:px-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/25 text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Independent Curation
            </span>
            <span className="text-slate-300 hidden sm:inline truncate font-medium">
              Yearnit — Independent Product Reviews & In-Depth Buyer Comparisons
            </span>
            <span className="text-slate-300 sm:hidden truncate font-medium">
              Yearnit Product Reviews & Guides
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-shrink-0 font-medium">
            <span className="hidden md:inline text-slate-400 hover:text-slate-200 transition">
              Direct Partner Storefront Links
            </span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              <span className="hidden xs:inline text-[10px] font-semibold text-slate-300">India</span>
              <span>🇮🇳</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Main Header ── */}
      <header className="font-poppins w-full bg-[#0F172A]/95 text-white shadow-lg sticky top-0 z-40 border-b border-white/[0.08] backdrop-blur-md">
        <div className="w-full px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-5">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Open mobile menu"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo & Name */}
            <a href="/" className="flex items-center gap-2 sm:gap-2.5 group no-underline">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                Y
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors leading-none">
                  Yearnit
                </span>
                <span className="text-[9px] font-bold text-amber-400/90 uppercase tracking-widest mt-0.5 hidden xs:block">
                  Buyer Guides
                </span>
              </div>
            </a>
          </div>

          {/* Location Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition flex-shrink-0">
            <MapPinIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 block font-normal">Deliver to</span>
              <span className="font-bold text-white block">India</span>
            </div>
          </div>

          {/* Center: Search Omnibar */}
          <div className="hidden sm:block flex-1 max-w-3xl mx-1 sm:mx-3">
            {renderOmnibar(false)}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Wishlist Heart Button */}
            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/10 transition relative group border border-transparent hover:border-white/10"
                aria-label="Saved Deals"
                title="Saved Deals"
              >
                <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-scale-in">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Badge */}
            <div className="hidden lg:block">
              <AdminButton />
            </div>

            {/* User Account / Auth Dropdown */}
            {user || localStorage.getItem("email") ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition text-left"
                  aria-label="User Account Menu"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                      {(user?.email || localStorage.getItem("email") || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block leading-tight pr-0.5">
                    <span className="text-[10px] text-slate-400 block font-normal truncate max-w-[110px]">
                      Hello, {userDisplayName}
                    </span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      Account <ChevronDownIcon className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </button>

                {/* Account Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-fade-in font-poppins">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {user?.email || localStorage.getItem("email")}
                      </p>
                    </div>

                    <div className="py-1">
                      {onOpenWishlist && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenWishlist();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition text-left"
                        >
                          <HeartIcon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span>Saved Wishlist ({wishlistCount})</span>
                        </button>
                      )}

                      {(isAdmin ||
                        isEmailAdmin(user?.email || localStorage.getItem("email"))) && (
                        <>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate("/admin/products");
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-bold transition text-left"
                          >
                            <PlusCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Add & Manage Products</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate("/admin/dashboard");
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-bold transition text-left"
                          >
                            <ShieldCheckIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>Admin Dashboard</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-semibold transition text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLogIn}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex-shrink-0"
              >
                <UserCircleIcon className="w-4 h-4 stroke-[2.2]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dedicated Omnibar */}
        <div className="sm:hidden px-3 pb-3 pt-0">
          {renderOmnibar(true)}
        </div>

        {/* ── 3. Secondary Sub-Nav Bar ── */}
        <div className="bg-[#0B1120] text-xs text-slate-300 border-t border-white/[0.06] font-medium">
          <div className="w-full px-3 sm:px-6 lg:px-12 py-2 flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none touch-scroll">
            <button
              onClick={() => handleQuickCategoryClick("All")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/30 font-bold whitespace-nowrap flex-shrink-0 transition shadow-xs"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              All Guides
            </button>
            <button
              onClick={() => handleQuickCategoryClick("Electronics")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
            >
              Electronics
            </button>
            <button
              onClick={() => handleQuickCategoryClick("Clothing")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
            >
              Fashion & Apparel
            </button>
            <button
              onClick={() => handleQuickCategoryClick("Audio")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
            >
              Audio & Wearables
            </button>
            <button
              onClick={() => handleQuickCategoryClick("Home")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
            >
              Home & Kitchen
            </button>
            <button
              onClick={() => handleQuickCategoryClick("Gadgets")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
            >
              Gadgets
            </button>
            <button
              onClick={() => handleQuickCategoryClick("All")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-amber-300 font-semibold whitespace-nowrap transition flex-shrink-0"
            >
              Editorial Recommendations
            </button>
            
            <div className="ml-auto hidden lg:flex items-center gap-1.5 text-slate-400 text-[11px] font-medium flex-shrink-0">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Independent Product Research & Price History Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 4. Mobile Drawer Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-poppins">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white text-slate-900 shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 bg-[#0A0E1A] text-white flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-sm">
                  Y
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-tight text-white">
                    {user ? `Hello, ${userDisplayName}` : "Welcome to Yearnit"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    Curated Buyer Guides
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Category Quick Links */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Browse Categories
                </p>
                <div className="space-y-1">
                  {[
                    { label: "All Product Guides", cat: "All" },
                    { label: "Electronics & Smart Devices", cat: "Electronics" },
                    { label: "Fashion & Trending Apparel", cat: "Clothing" },
                    { label: "Audio & Wearables", cat: "Audio" },
                    { label: "Home & Kitchen Appliances", cat: "Home" },
                    { label: "Gadgets & Daily Tech", cat: "Gadgets" },
                  ].map((item) => (
                    <button
                      key={item.cat}
                      onClick={() => {
                        handleQuickCategoryClick(item.cat);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wishlist Link */}
              {onOpenWishlist && (
                <div className="border-t border-slate-100 pt-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-rose-500" />
                      Saved Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Admin Console in Mobile */}
              {isAdmin && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-2">
                    Admin Tools
                  </p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/admin/dashboard");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition text-left"
                  >
                    <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
                    <span>Open Admin Console</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogIn();
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
