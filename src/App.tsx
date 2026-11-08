import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition, { TopProgressBar } from "./components/PageTransition";
import TopBar from "./components/TopBar";
import LogIn from "./components/Login";
import Carousel from "./components/Carousel";
import AdminDashboard from "./components/AdminDashboard";
import SearchResults from "./components/SearchResults";
import AdminUpload from "./components/AdminUpload";
import AdminOrders from "./components/AdminOrders";
import AdminUsers from "./components/AdminUsers";
import AdminProducts from "./components/AdminProducts";
import NotFound from "./components/NotFound";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import HeroBanner from "./components/HeroBanner";
import CategoryStrip from "./components/CategoryStrip";
import CashbackSteps from "./components/CashbackSteps";
import FlashDealsBar from "./components/FlashDealsBar";
import TrustFeatures from "./components/TrustFeatures";
import DealsNewsletter from "./components/DealsNewsletter";
import Footer from "./components/Footer";
import AdLandingPage from "./components/AdLandingPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import AboutPage from "./components/AboutPage";
import AffiliateDisclosure from "./components/AffiliateDisclosure";
import ContactPage from "./components/ContactPage";
import ProductDetailPage from "./components/ProductDetailPage";
import SavedDealsModal from "./components/SavedDealsModal";
import CookieConsent from "./components/CookieConsent";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initAllTrackers, trackPageView } from "./utils/tracking";
import { captureAttribution } from "./utils/attribution";
import { updateSEO } from "./utils/seo";

/**
 * Route Tracker Component: handles SPA route transitions and attribution captures
 */
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    initAllTrackers();
    captureAttribution();
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function HomePage() {
  const [openLogIn, setOpenLogIn] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    updateSEO({
      title: "Yearnit - Independent Product Reviews & Curated Buyer Guides",
      description:
        "Yearnit provides independent product reviews, in-depth buyer guides, and curated recommendations across electronics, audio, home essentials, and lifestyle.",
      image: "https://yearnit.in/og-image.jpg",
      url: "https://yearnit.in/",
      type: "website",
      keywords: [
        "Product Reviews India",
        "Electronics Buyer Guides",
        "Best Earbuds India",
        "Best Smartphones 2026",
        "Amazon Affiliate Reviews",
        "Unbiased Tech Comparisons",
        "Yearnit",
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Yearnit",
          "url": "https://yearnit.in/",
          "description": "Independent product reviews and curated buyer guides in India.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yearnit.in/search/{search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Yearnit",
          "url": "https://yearnit.in/",
          "logo": "https://yearnit.in/logo.png",
          "description": "Independent product evaluation and review publication.",
          "foundingDate": "2024",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "url": "https://yearnit.in/contact",
            "availableLanguage": ["English", "Hindi"],
          },
        },
      ],
    });
  }, []);

  const scrollToCatalog = () => {
    const el = document.getElementById("featured-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      {/* Login Modal */}
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* Saved Deals Drawer */}
      <SavedDealsModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Main Header */}
      <TopBar
        openLogIn={() => setOpenLogIn(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Page Flow */}
      <main className="flex-1 space-y-2">
        {/* Promotional Hero Slider */}
        <HeroBanner onExploreClick={scrollToCatalog} />

        {/* Quick Category Chips */}
        <CategoryStrip
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Editorial Spotlight Banner */}
        <FlashDealsBar />

        {/* Products Grid with Filter Toolbar */}
        <Carousel
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Consumer Value & Trust Propositions */}
        <TrustFeatures />

        {/* Editorial Product Digest */}
        <DealsNewsletter />

        {/* Three Steps Towards Cashback (Before Footer) */}
        <CashbackSteps
          onLoginClick={() => setOpenLogIn(true)}
          onShopClick={scrollToCatalog}
        />
      </main>

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}

/**
 * Animated Routes Wrapper: enables smooth AnimatePresence page transitions across all routes
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/lp" element={<PageTransition><AdLandingPage /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/affiliate-disclosure" element={<PageTransition><AffiliateDisclosure /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/products" element={<PageTransition><AdminProducts /></PageTransition>} />
        <Route path="/search/:searchTerm" element={<PageTransition><SearchResults /></PageTransition>} />
        <Route path="/admin/upload" element={<PageTransition><AdminUpload /></PageTransition>} />
        <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <Router>
        <TopProgressBar />
        <RouteTracker />
        <AnimatedRoutes />
        <CookieConsent />
      </Router>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
