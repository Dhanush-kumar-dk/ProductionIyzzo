import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import PageTransition, { TopProgressBar } from "./components/PageTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import TopBar from "./components/TopBar";
import LogIn from "./components/Login";
import HeroBanner from "./components/HeroBanner";
import ExploreByCategory from "./components/ExploreByCategory";
import CuratedGuides from "./components/CuratedGuides";
import EditorialSpotlight from "./components/EditorialSpotlight";
import ResearchFeatureRow from "./components/ResearchFeatureRow";
import Benefits from "./components/Benefits";
import Testimonials from "./components/Testimonials";
import DealsNewsletter from "./components/DealsNewsletter";
import Footer from "./components/Footer";
import SavedDealsModal from "./components/SavedDealsModal";
import CookieConsent from "./components/CookieConsent";
import InstallAppPrompt from "./components/InstallAppPrompt";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Lazy-loaded secondary & admin routes to optimize initial bundle performance
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const SearchResults = lazy(() => import("./components/SearchResults"));
const AdminUpload = lazy(() => import("./components/AdminUpload"));
const AdminOrders = lazy(() => import("./components/AdminOrders"));
const AdminUsers = lazy(() => import("./components/AdminUsers"));
const AdminProducts = lazy(() => import("./components/AdminProducts"));
const NotFound = lazy(() => import("./components/NotFound"));
const AdLandingPage = lazy(() => import("./components/AdLandingPage"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const AffiliateDisclosure = lazy(() => import("./components/AffiliateDisclosure"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage"));
const UserProfilePage = lazy(() => import("./components/profile/UserProfilePage"));

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initAllTrackers, trackPageView } from "./utils/tracking";
import { captureAttribution } from "./utils/attribution";
import { updateSEO, DEFAULT_OG_IMAGE } from "./utils/seo";

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

/**
 * Lightweight loading skeleton for lazy-loaded route transitions
 */
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-gray-400">Loading page...</span>
    </div>
  );
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
      image: DEFAULT_OG_IMAGE,
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
    <div className="min-h-screen w-full bg-[#FAFBF8] flex flex-col font-sans text-[#3F4A44]">
      {/* Login Modal */}
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-[#1E2A24]/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* Saved Deals Drawer */}
      <SavedDealsModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* 1. Navbar */}
      <TopBar
        openLogIn={() => setOpenLogIn(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Editorial Flow */}
      <main className="flex-1">
        {/* 2. Hero Banner */}
        <HeroBanner
          onExploreClick={scrollToCatalog}
          onCategorySelect={setSelectedCategory}
        />

        {/* 3. Explore by Category */}
        <ExploreByCategory
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onExploreAll={scrollToCatalog}
        />

        {/* 4. Curated Buyer Guides & Recommendations */}
        <CuratedGuides
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Editorial Spotlight */}
        <EditorialSpotlight />

        {/* 6. Independent Research & Benchmark Lab */}
        <ResearchFeatureRow />

        {/* 7. Benefits for your experience (full-width tinted band) */}
        <Benefits />

        {/* 8. Testimonials */}
        <Testimonials />

        {/* 9. Newsletter (50/50 split panel) */}
        <DealsNewsletter />
      </main>

      {/* 10. Comprehensive Footer */}
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
    <Suspense fallback={<PageFallback />}>
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
          <Route path="/profile" element={<PageTransition><UserProfilePage /></PageTransition>} />
          <Route path="/profile/:tab" element={<PageTransition><UserProfilePage /></PageTransition>} />
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
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <TopProgressBar />
        <RouteTracker />
        <AnimatedRoutes />
        <CookieConsent />
        <InstallAppPrompt />
      </Router>
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;