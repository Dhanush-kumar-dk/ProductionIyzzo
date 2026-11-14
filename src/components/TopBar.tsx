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
import YearnitLogo from "../assets/yearnit_logo-bg.png";
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

// Sub-nav (desktop strip) categories
const SUB_NAV_CATEGORIES = [
  { label: "Electronics", cat: "Electronics" },
  { label: "Fashion & Apparel", cat: "Clothing" },
  { label: "Audio & Wearables", cat: "Audio" },
  { label: "Home & Kitchen", cat: "Home" },
  { label: "Gadgets", cat: "Gadgets" },
];

// Mobile drawer categories
const DRAWER_CATEGORIES = [
  { label: "All Product Guides", cat: "All" },
  { label: "Electronics & Smart Devices", cat: "Electronics" },
  { label: "Fashion & Trending Apparel", cat: "Clothing" },
  { label: "Audio & Wearables", cat: "Audio" },
  { label: "Home & Kitchen Appliances", cat: "Home" },
  { label: "Gadgets & Daily Tech", cat: "Gadgets" },
];

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

  // Lock body scroll + close on Escape while the mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

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

  const storedEmail = localStorage.getItem("email");
  const isLoggedIn = !!(user || storedEmail);

  // Formatted User Display Name
  const userDisplayName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email
    ? user.email.split("@")[0]
    : storedEmail
    ? storedEmail.split("@")[0]
    : "Member";

  // Modern Clean Omnibar
  const renderOmnibar = (isMobile = false) => (
    <div className="relative flex items-center w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20 transition-all duration-200 overflow-hidden">
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
      {/* ── 1. Main Header ── */}
      <header className="font-poppins w-full bg-[#0F172A]/95 text-white shadow-lg sticky top-0 z-40 border-b border-white/[0.08] backdrop-blur-md">
        {/*
          Layout: [ left group ] [ search (fills remaining space) ] [ right group ]
          The "Deliver to" pill lives INSIDE the left group, so it always sits
          right next to the logo instead of floating in the middle.
        */}
        <div className="w-full px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Left group: menu toggle + logo + deliver-to */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Open mobile menu"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo */}
            <a href="/" aria-label="Yearnit home" className="flex items-center flex-shrink-0">
              <img
                src={YearnitLogo}
                alt="Yearnit"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 hover:scale-105"
                draggable={false}
              />
            </a>

            {/* Deliver-to pill (desktop only, sits next to the logo) */}
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition flex-shrink-0">
              <MapPinIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="leading-tight">
                <span className="text-[10px] text-slate-400 block font-normal">Deliver to</span>
                <span className="font-bold text-white block">India</span>
              </div>
            </div>
          </div>

          {/* Center: search omnibar (takes all remaining space, centered, capped width) */}
          <div className="hidden sm:flex flex-1 min-w-0 justify-center">
            <div className="w-full max-w-3xl">{renderOmnibar(false)}</div>
          </div>

          {/* Right group: wishlist, admin, account */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto sm:ml-0">
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
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-scale-in">
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
            {isLoggedIn ? (
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
                      {(user?.email || storedEmail || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block leading-tight pr-0.5 min-w-0">
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
                  <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-fade-in font-poppins">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {user?.email || storedEmail}
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

                      {(isAdmin || isEmailAdmin(user?.email || storedEmail)) && (
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
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-slate-950 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex-shrink-0 whitespace-nowrap"
              >
                <UserCircleIcon className="w-4 h-4 stroke-[2.2]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dedicated Omnibar */}
        <div className="sm:hidden px-3 pb-3 pt-0">{renderOmnibar(true)}</div>

        {/* ── 2. Secondary Sub-Nav Bar ── */}
        <div className="bg-[#0B1120] text-xs text-slate-300 border-t border-white/[0.06] font-medium">
          <div className="w-full px-3 sm:px-6 lg:px-12 py-2 flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none touch-scroll">
            <button
              onClick={() => handleQuickCategoryClick("All")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 border border-amber-400/30 font-bold whitespace-nowrap flex-shrink-0 transition shadow-xs"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              All Guides
            </button>

            {SUB_NAV_CATEGORIES.map((item) => (
              <button
                key={item.cat}
                onClick={() => handleQuickCategoryClick(item.cat)}
                className="px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 whitespace-nowrap transition flex-shrink-0"
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => handleQuickCategoryClick("All")}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-amber-300 font-semibold whitespace-nowrap transition flex-shrink-0"
            >
              Editorial Recommendations
            </button>
          </div>
        </div>
      </header>

      {/* ── 3. Mobile Drawer Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-poppins">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white text-slate-900 shadow-2xl flex flex-col z-50"
          >
            {/* Drawer Header: logo + close on top row, greeting below (never overlaps) */}
            <div className="bg-[#0A0E1A] text-white px-4 pt-4 pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center justify-between gap-3">
                <a
                  href="/"
                  aria-label="Yearnit home"
                  className="flex items-center min-w-0"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img
                    src={YearnitLogo}
                    alt="Yearnit"
                    className="h-9 w-auto max-w-full object-contain"
                    draggable={false}
                  />
                </a>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition flex-shrink-0"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 min-w-0">
                <p className="font-bold text-sm leading-tight text-white truncate">
                  {isLoggedIn ? `Hello, ${userDisplayName}` : "Welcome to Yearnit"}
                </p>
              </div>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
              {/* Category Quick Links */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Browse Categories
                </p>
                <div className="space-y-1">
                  {DRAWER_CATEGORIES.map((item) => (
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
                    <ShieldCheckIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Open Admin Console</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
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
          </aside>
        </div>
      )}
    </>
  );
}