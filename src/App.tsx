import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import TopBar from "./components/TopBar";
import LogIn from "./components/Login";
import Carousel from "./components/Carousel";
import AdminDashboard from "./components/AdminDashboard";
import SearchResults from "./components/SearchResults";
import AdminUpload from "./components/AdminUpload";
import AdminOrders from "./components/AdminOrders";
import AdminUsers from "./components/AdminUsers";
import NotFound from "./components/NotFound";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import HeroBanner from "./components/HeroBanner";
import CategoryStrip from "./components/CategoryStrip";
import FlashDealsBar from "./components/FlashDealsBar";
import TrustFeatures from "./components/TrustFeatures";
import DealsNewsletter from "./components/DealsNewsletter";
import Footer from "./components/Footer";
import SavedDealsModal from "./components/SavedDealsModal";

function HomePage() {
  const [openLogIn, setOpenLogIn] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

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
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* Saved Deals Drawer */}
      <SavedDealsModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Main E-commerce Header */}
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

        {/* Live Flash Deals Ticker */}
        <FlashDealsBar />

        {/* Products Grid with Filter Toolbar */}
        <Carousel
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* E-Commerce Value & Trust Propositions */}
        <TrustFeatures />

        {/* Email Price Drop Alerts */}
        <DealsNewsletter />
      </main>

      {/* Comprehensive E-Commerce Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/search/:searchTerm" element={<SearchResults />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
