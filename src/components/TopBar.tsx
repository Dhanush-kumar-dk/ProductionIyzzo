import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AdminButton from "./AdminButton";
import { API_BASE_URL } from "../config/api";
import { getActiveTrackingId } from "../utils/affiliate";
import { verifyIsAdmin, isEmailAdmin } from "../utils/admin";
import { ShieldCheckIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
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

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("isAdmin") === "true" || isEmailAdmin(localStorage.getItem("email"));
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
        body: JSON.stringify({ keyword: trimmedSearch, searchIndex: searchCat, partnerTag }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      navigate(`/search/${encodeURIComponent(trimmedSearch)}`, { state: { results: data } });
    } catch (error) {
      navigate(`/search/${encodeURIComponent(trimmedSearch)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
  };

  const handleQuickCategoryClick = (categoryName: string) => {
    if (onCategorySelect) onCategorySelect(categoryName === "All" ? "" : categoryName);
    const catalogEl = document.getElementById("featured-catalog");
    if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── Announcement Ticker Bar ── */}
      <div className="w-full bg-[#1a1a2e] text-white text-[11px] py-1.5 px-4 flex items-center justify-between font-poppins overflow-hidden">
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            <span className="font-semibold text-green-300">1M+ Users</span>
          </span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-1 text-orange-300">
            <span>🎁</span>
            <span className="font-medium">₹42 Cr+ Cashback paid till date</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-300 flex-shrink-0">
          <span className="hidden md:inline">Help & Support</span>
          <span>🇮🇳</span>
        </div>
      </div>

      {/* ── Main White Header ── */}
      <header className="font-poppins w-full bg-white shadow-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-5">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition flex-shrink-0"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group no-underline flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-xl leading-none" style={{ fontFamily: "Georgia, serif" }}>Y</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight group-hover:text-orange-500 transition leading-none">
              earn<span className="text-orange-500">it</span>
            </span>
          </a>

          {/* Search Bar (desktop) */}
          <div className="hidden sm:flex flex-1 max-w-2xl items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 overflow-hidden transition">
            <div className="relative border-r border-gray-200 hidden md:block flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent text-gray-700 text-xs font-semibold py-2.5 pl-3 pr-7 outline-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Fashion</option>
                <option value="Home">Home</option>
                <option value="Gadgets">Gadgets</option>
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <input
              type="text"
              placeholder="Search Brand & Store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 py-2.5 px-4 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="p-1.5 text-gray-400 hover:text-gray-600 mr-1">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 flex items-center justify-center transition disabled:opacity-60 flex-shrink-0"
              aria-label="Search"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MagnifyingGlassIcon className="w-5 h-5 stroke-2" />
              )}
            </button>
          </div>

          {/* Right Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-600 flex-shrink-0">
            <a href="/" className="hover:text-orange-500 transition no-underline whitespace-nowrap">Deals</a>
            <a href="/about" className="hover:text-orange-500 transition no-underline whitespace-nowrap">All Stores</a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="p-1.5 rounded-xl text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition"
                title="Saved Deals"
              >
                <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <div className="hidden lg:block">
              <AdminButton />
            </div>

            {(user || localStorage.getItem("email")) ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 transition text-left"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="user" className="w-7 h-7 rounded-full object-cover border-2 border-orange-400" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                      {(user?.email || localStorage.getItem("email") || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block leading-tight">
                    <span className="text-[10px] text-gray-500 block">Hello,</span>
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      Account <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{user?.email || localStorage.getItem("email")}</p>
                    </div>
                    {(isAdmin || isEmailAdmin(user?.email || localStorage.getItem("email"))) && (
                      <div className="py-1">
                        <button onClick={() => { setUserMenuOpen(false); navigate("/admin/products"); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-bold transition text-left">
                          <PlusCircleIcon className="w-4 h-4 text-amber-600" />+ Add & Manage Products
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); navigate("/admin/dashboard"); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-bold transition text-left">
                          <ShieldCheckIcon className="w-4 h-4 text-purple-600" />Admin Dashboard
                        </button>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-semibold transition text-left">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLogIn}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl font-bold text-sm shadow-sm shadow-orange-200 transition flex-shrink-0"
              >
                <UserCircleIcon className="w-4 h-4" />
                <span className="hidden xs:inline">Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden px-3 pb-3 pt-0">
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:border-orange-400">
            <input
              type="text"
              placeholder="Search Brand & Store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 py-2.5 px-3 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            />
            <button onClick={handleSearch} disabled={isSearching} className="bg-orange-500 text-white px-3.5 py-2.5 flex items-center transition">
              <MagnifyingGlassIcon className="w-5 h-5 stroke-2" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white text-gray-900 shadow-2xl flex flex-col z-50">
            <div className="p-4 bg-orange-500 text-white flex items-center justify-between">
              <span className="font-bold text-lg">Yearnit</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white p-1">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-scroll">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Browse</h4>
                <div className="space-y-1">
                  {["All", "Electronics", "Clothing", "Audio", "Home"].map((cat) => (
                    <button key={cat} onClick={() => { handleQuickCategoryClick(cat); setMobileMenuOpen(false); }}
                      className="w-full text-left py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium transition">
                      {cat} Guides
                    </button>
                  ))}
                </div>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Info</h4>
                {[{ href: "/about", label: "About Yearnit" }, { href: "/affiliate-disclosure", label: "Affiliate Disclosure" }, { href: "/privacy-policy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Service" }, { href: "/contact", label: "Contact Us" }].map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-gray-100 font-medium transition no-underline mb-1">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 pb-safe">
              {(user || localStorage.getItem("email")) ? (
                <button onClick={handleLogout} className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-bold transition">Log Out</button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); openLogIn(); }} className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-bold shadow transition">
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
