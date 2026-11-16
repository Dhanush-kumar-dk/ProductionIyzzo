import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AdminButton from "./AdminButton";
import { isEmailAdmin, verifyIsAdmin } from "../utils/admin";
import { getSavedDeals } from "../utils/wishlist";
import {
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface TopBarProps {
  openLogIn: () => void;
  onOpenWishlist?: () => void;
  onCategorySelect?: (category: string) => void;
}

const NAV_LINKS = [
  { label: "Home", href: "/", cat: "All" },
  { label: "Guides", href: "/#featured-catalog", cat: "All" },
  { label: "Electronics", href: "/#categories", cat: "Electronics" },
  { label: "Audio & Wearables", href: "/#categories", cat: "Audio" },
  { label: "Home & Kitchen", href: "/#categories", cat: "Home" },
  { label: "Fashion", href: "/#categories", cat: "Clothing" },
  { label: "Gadgets", href: "/#categories", cat: "Gadgets" },
  { label: "Reviews", href: "/#spotlight", cat: "All" },
];

export default function TopBar({
  openLogIn,
  onOpenWishlist,
  onCategorySelect,
}: TopBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(() => getSavedDeals().length);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return (
      localStorage.getItem("isAdmin") === "true" ||
      isEmailAdmin(localStorage.getItem("email"))
    );
  });

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

  useEffect(() => {
    const updateWishlist = () => setWishlistCount(getSavedDeals().length);
    window.addEventListener("wishlistUpdated", updateWishlist);
    return () => window.removeEventListener("wishlistUpdated", updateWishlist);
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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    setIsSearchOpen(false);
    navigate(`/search/${encodeURIComponent(query)}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("email");
      localStorage.removeItem("isAdmin");
      setUser(null);
      setUserMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleNavClick = (link: typeof NAV_LINKS[0]) => {
    if (onCategorySelect && link.cat !== "All") {
      onCategorySelect(link.cat);
    }
    if (link.href.startsWith("/#")) {
      const id = link.href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(link.href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E3E8E2] transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#3F4A44] hover:text-[#1E2A24] hover:bg-[#F1F4EF] transition"
              aria-label="Open navigation menu"
            >
              <Bars3Icon className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Editorial Logo */}
            <a
              href="/"
              className="flex items-center gap-2 group text-decoration-none select-none"
              aria-label="Yearnit Home"
            >
              <div className="w-7 h-7 rounded border-[1.5px] border-[#1E2A24] flex items-center justify-center bg-white group-hover:bg-[#FAFBF8] transition">
                <span className="font-serif font-bold text-xs text-[#1E2A24] tracking-tighter">
                  Y
                </span>
              </div>
              <span className="font-serif font-semibold tracking-[0.14em] text-base sm:text-lg text-[#1E2A24] uppercase">
                Yearnit
              </span>
            </a>
          </div>

          {/* Center: Desktop Editorial Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] font-sans font-medium text-[#7B857F]">
            {NAV_LINKS.map((link, idx) => {
              const isHome = idx === 0 && location.pathname === "/" && !location.hash;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`relative py-1 transition-colors hover:text-[#1E2A24] ${
                    isHome ? "text-[#1E2A24] font-semibold" : ""
                  }`}
                >
                  {link.label}
                  {isHome && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4F6F5D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions (Search, Wishlist, Profile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#3F4A44] hover:text-[#1E2A24] hover:bg-[#F1F4EF] transition"
              aria-label="Search buyer guides"
              title="Search"
            >
              <MagnifyingGlassIcon className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Bookmark / Saved Deals with count badge */}
            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#3F4A44] hover:text-[#1E2A24] hover:bg-[#F1F4EF] transition"
                aria-label="Saved Deals"
                title="Saved Deals"
              >
                <HeartIcon className="w-4 h-4 stroke-[2]" />
                {wishlistCount > 0 && (
                  <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4F6F5D] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden sm:block">
                <AdminButton />
              </div>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E3E8E2] overflow-hidden hover:ring-2 hover:ring-[#4F6F5D]/30 transition"
                  aria-label="User Account"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#1E2A24]">
                      {(user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-subtle border border-[#E3E8E2] py-2 z-50 text-xs animate-fade-in">
                    <div className="px-4 py-2 border-b border-[#E3E8E2]">
                      <p className="font-semibold text-[#1E2A24] truncate">
                        {user.displayName || "Member"}
                      </p>
                      <p className="text-[11px] text-[#7B857F] truncate">{user.email}</p>
                    </div>
                    <a
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-[#3F4A44] hover:bg-[#F1F4EF] hover:text-[#1E2A24] transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-[#7B857F]" />
                      My Profile & Settings
                    </a>
                    {isAdmin && (
                      <a
                        href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-[#4F6F5D] hover:bg-[#F1F4EF] font-medium transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                        Admin Dashboard
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLogIn}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#3F4A44] hover:text-[#1E2A24] hover:bg-[#F1F4EF] transition"
                aria-label="Sign In"
                title="Sign In"
              >
                <UserIcon className="w-4 h-4 stroke-[2]" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Input (Editorial Style) */}
        {isSearchOpen && (
          <div className="w-full bg-[#FAFBF8] border-t border-[#E3E8E2] px-4 sm:px-6 lg:px-8 py-3 animate-fade-in">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-[720px] mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-4 h-4 text-[#7B857F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search lab-tested reviews, buyer guides, gadgets..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E3E8E2] rounded-[10px] text-sm text-[#1E2A24] placeholder-[#7B857F] focus:outline-none focus:ring-2 focus:ring-[#5E7F6C]/30 focus:border-[#CBD3CB] transition"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#4F6F5D] text-white rounded-[10px] text-xs font-medium hover:bg-[#5E7F6C] transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-[#7B857F] hover:text-[#1E2A24] rounded-lg transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1E2A24]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-0 w-full max-w-xs bg-[#FAFBF8] h-full shadow-xl flex flex-col justify-between p-6 z-10 border-r border-[#E3E8E2]">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E3E8E2]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded border-[1.5px] border-[#1E2A24] flex items-center justify-center bg-white">
                    <span className="font-serif font-bold text-xs text-[#1E2A24]">Y</span>
                  </div>
                  <span className="font-serif font-semibold tracking-[0.14em] text-base text-[#1E2A24] uppercase">
                    Yearnit
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#7B857F] hover:text-[#1E2A24] hover:bg-[#E6EAE5]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      handleNavClick(link);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#3F4A44] hover:bg-[#F1F4EF] hover:text-[#1E2A24] transition flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E3E8E2] space-y-3">
              {user ? (
                <a
                  href="/profile"
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3E8E2] text-xs font-medium text-[#1E2A24]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <UserIcon className="w-4 h-4 text-[#7B857F]" />
                    <span className="truncate">{user.displayName || user.email}</span>
                  </div>
                  <span className="text-[#4F6F5D]">Settings →</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogIn();
                  }}
                  className="w-full py-2.5 px-4 bg-[#4F6F5D] text-white rounded-[10px] text-xs font-medium hover:bg-[#5E7F6C] transition"
                >
                  Sign In to Yearnit
                </button>
              )}
              <p className="text-[10px] text-[#7B857F] text-center">
                Independent product reviews & lab-audited guides.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
