import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { supabase } from "../supabase";
import { verifyIsAdmin } from "../utils/admin";
import { buildAffiliateUrl } from "../utils/affiliate";
import {
  Product,
  getAllCatalogProducts,
  getCustomProducts,
  getDeletedProductIds,
  saveCustomProduct,
  deleteProduct,
  restoreProduct,
  resetCatalogToDefaults,
} from "../data/products";
import ProductCard from "./ProductCard";
import {
  PlusCircleIcon,
  HomeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  TrashIcon,
  TagIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  EyeIcon,
  BoltIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { fetchProductDataFromUrl } from "../utils/amazonUrlParser";

const CATEGORIES = [
  "Audio & Wearables",
  "Consumer Electronics",
  "Mobiles & Tech",
  "Home & Kitchen",
  "Fashion & Apparel",
  "Gadgets",
  "Fitness & Sports",
  "Books & Learning",
  "Other",
];

const BADGES = [
  "Top Value Pick",
  "Editor's Choice",
  "Best Seller",
  "Flagship Audio",
  "Trending Now",
  "Premium Pick",
  "Budget Hero",
];

export default function AdminProducts() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string; undoId?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [asin, setAsin] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [editorBadge, setEditorBadge] = useState(BADGES[0]);
  const [image, setImage] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [shortDetail, setShortDetail] = useState("");
  const [summary, setSummary] = useState("");
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");
  const [whoItsFor, setWhoItsFor] = useState("");
  const [rating, setRating] = useState("4.5");
  const [ratingCount, setRatingCount] = useState("1420");
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>([
    { key: "Brand", value: "" },
    { key: "Warranty", value: "1 Year Official Warranty" },
  ]);

  // URL Auto-Fetch feature state
  const [isFetchingUrlData, setIsFetchingUrlData] = useState(false);
  const [fetchFeedback, setFetchFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const handleAutoFetch = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl !== undefined ? targetUrl : url).trim();
    if (!urlToFetch) {
      setFetchFeedback({
        type: "error",
        message: "Please enter or paste an Amazon product URL first.",
      });
      return;
    }

    setIsFetchingUrlData(true);
    setFetchFeedback({
      type: "info",
      message: "Scraping live product page, prices, specs & high-resolution imagery from URL...",
    });

    try {
      const data = await fetchProductDataFromUrl(urlToFetch);

      // Populate form input fields with verified extracted data
      setName(data.name || "");
      setAsin(data.asin || "");
      setUrl(data.url || urlToFetch);
      setCategory(data.category || "Consumer Electronics");
      if (!CATEGORIES.includes(data.category)) {
        setCategory("Other");
        setCustomCategory(data.category);
      }
      setPrice(data.price || "");
      setMrp(data.mrp || "");
      setRating(data.rating || "4.5");
      setRatingCount(data.ratingCount || "1200");
      setImage(data.image || "");
      setImage1(data.image1 || "");
      setImage2(data.image2 || "");
      if (data.editorBadge) setEditorBadge(data.editorBadge);
      if (data.shortDetail) setShortDetail(data.shortDetail);
      if (data.summary) setSummary(data.summary);
      if (data.pros && data.pros.length > 0) setProsText(data.pros.join("\n"));
      if (data.cons && data.cons.length > 0) setConsText(data.cons.join("\n"));
      if (data.whoItsFor) setWhoItsFor(data.whoItsFor);

      if (data.specs && Object.keys(data.specs).length > 0) {
        setSpecRows(
          Object.entries(data.specs).map(([key, value]) => ({ key, value }))
        );
      }

      setFetchFeedback({
        type: "success",
        message: `✨ Verified product data extracted: "${(data.name || '').substring(0, 42)}..." | Price: ₹${data.price} | MRP: ₹${data.mrp}. All input fields have been populated.`,
      });
    } catch (err: unknown) {
      setFetchFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to extract product data from URL.",
      });
    } finally {
      setIsFetchingUrlData(false);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.search.includes("add=true") || (location.state as any)?.openAdd) {
      setShowAddForm(true);
    }
  }, [location]);

  // Authentication check
  useEffect(() => {
    let isMounted = true;
    const checkAccess = async (user: User | null) => {
      const verified = await verifyIsAdmin(user);
      if (isMounted) {
        setIsAdmin(verified);
        if (!verified) navigate("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAccess);
    checkAccess(auth.currentUser);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Load catalog
  const refreshCatalog = () => {
    setProducts(getAllCatalogProducts());
    setCustomProducts(getCustomProducts());
    setDeletedIds(getDeletedProductIds());
  };

  useEffect(() => {
    refreshCatalog();
    const handleUpdate = () => refreshCatalog();
    window.addEventListener("catalogUpdated", handleUpdate);
    return () => window.removeEventListener("catalogUpdated", handleUpdate);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategoryFilter === "all" ||
        (p.category || "").toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Live preview product object
  const previewProduct: Product = useMemo(() => {
    const finalCategory = customCategory.trim() || category;
    const pros = prosText.split("\n").map((s) => s.trim()).filter(Boolean);
    const cons = consText.split("\n").map((s) => s.trim()).filter(Boolean);
    const specsMap: { [key: string]: string } = {};
    specRows.forEach((r) => {
      if (r.key.trim() && r.value.trim()) {
        specsMap[r.key.trim()] = r.value.trim();
      }
    });

    return {
      id: asin.trim().toUpperCase() || "B0_PREVIEW",
      name: name.trim() || "Sample Product Title - High Performance Specifications",
      category: finalCategory,
      price: price.trim() || "1,999",
      mrp: mrp.trim() || "3,999",
      rating: parseFloat(rating) || 4.5,
      ratingCount: parseInt(ratingCount, 10) || 1200,
      image: image.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
      image1: image1.trim() || undefined,
      image2: image2.trim() || undefined,
      url: url.trim() || "https://www.amazon.in",
      editorBadge: editorBadge.trim() || undefined,
      shortDetail: shortDetail.trim() || "Active Noise Cancellation • 30-Hour Battery Life • Fast USB-C Charging",
      summary: summary.trim() || "An in-depth review evaluating design, durability, daily convenience, and audio fidelity.",
      pros: pros.length > 0 ? pros : ["Premium sound profile", "Fast charging capability"],
      cons: cons.length > 0 ? cons : ["Carrying pouch not included"],
      whoItsFor: whoItsFor.trim() || "Commuters, students, and professionals.",
      specs: Object.keys(specsMap).length > 0 ? specsMap : { Warranty: "1 Year Official Brand Warranty" },
    };
  }, [
    asin,
    name,
    category,
    customCategory,
    price,
    mrp,
    rating,
    ratingCount,
    image,
    image1,
    image2,
    url,
    editorBadge,
    shortDetail,
    summary,
    prosText,
    consText,
    whoItsFor,
    specRows,
  ]);

  const handleAddSpecRow = () => {
    setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (idx: number) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    setSpecRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "Product title is required." });
      return;
    }

    if (!image.trim()) {
      setStatusMessage({ type: "error", text: "Primary image URL is required." });
      return;
    }

    if (!url.trim()) {
      setStatusMessage({ type: "error", text: "Amazon Product URL is required." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const finalId = asin.trim().toUpperCase() || `PROD-${Date.now().toString(36).toUpperCase()}`;
      const finalCategory = customCategory.trim() || category;
      const pros = prosText.split("\n").map((s) => s.trim()).filter(Boolean);
      const cons = consText.split("\n").map((s) => s.trim()).filter(Boolean);
      const specsMap: { [key: string]: string } = {};
      specRows.forEach((r) => {
        if (r.key.trim() && r.value.trim()) {
          specsMap[r.key.trim()] = r.value.trim();
        }
      });

      const newProduct: Product = {
        id: finalId,
        name: name.trim(),
        category: finalCategory,
        price: price.trim() || undefined,
        mrp: mrp.trim() || undefined,
        rating: parseFloat(rating) || 4.5,
        ratingCount: parseInt(ratingCount, 10) || 1200,
        image: image.trim(),
        image1: image1.trim() || undefined,
        image2: image2.trim() || undefined,
        url: buildAffiliateUrl(url.trim()),
        editorBadge: editorBadge.trim() || undefined,
        shortDetail: shortDetail.trim() || undefined,
        summary: summary.trim() || undefined,
        pros: pros.length > 0 ? pros : undefined,
        cons: cons.length > 0 ? cons : undefined,
        whoItsFor: whoItsFor.trim() || undefined,
        specs: Object.keys(specsMap).length > 0 ? specsMap : undefined,
      };

      // 1. Save locally and emit event
      saveCustomProduct(newProduct);

      // 2. Sync to Supabase & Cloud Database
      try {
        await supabase.from("products").upsert({
          id: finalId,
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
          image1: newProduct.image1,
          image2: newProduct.image2,
          url: newProduct.url,
        });
      } catch (sbErr) {
        console.warn("Supabase sync notice:", sbErr);
      }

      try {
        await setDoc(doc(firestore, "products", finalId), newProduct);
      } catch (err) {
        console.warn("Firestore sync skipped:", err);
      }

      setStatusMessage({
        type: "success",
        text: `Product "${newProduct.name}" successfully added to catalog! 🎉`,
      });

      // Reset form
      setName("");
      setAsin("");
      setPrice("");
      setMrp("");
      setImage("");
      setImage1("");
      setImage2("");
      setUrl("");
      setShortDetail("");
      setSummary("");
      setProsText("");
      setConsText("");
      setWhoItsFor("");
      setShowAddForm(false);
      refreshCatalog();
    } catch (err) {
      console.error("Failed to add product:", err);
      setStatusMessage({
        type: "error",
        text: "Could not add product. Please check values and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const prod = productToDelete;

    try {
      deleteProduct(prod.id);
      try {
        await supabase.from("products").delete().eq("id", prod.id);
      } catch (sbErr) {
        console.warn("Supabase delete notice:", sbErr);
      }

      try {
        await deleteDoc(doc(firestore, "products", prod.id));
      } catch (err) {
        console.warn("Firestore delete skipped:", err);
      }
      setStatusMessage({
        type: "success",
        text: `Product "${prod.name}" was removed from the store catalog.`,
        undoId: prod.id,
      });
      refreshCatalog();
    } catch (err) {
      console.error("Error removing product:", err);
      setStatusMessage({
        type: "error",
        text: `Could not delete product ${prod.id}. Please try again.`,
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleUndo = (productId: string) => {
    restoreProduct(productId);
    setStatusMessage({
      type: "success",
      text: "Product restored to store catalog successfully! 🎉",
    });
    refreshCatalog();
  };

  const handleRestoreAll = () => {
    if (window.confirm("Are you sure you want to restore all default catalog products?")) {
      resetCatalogToDefaults();
      setStatusMessage({
        type: "success",
        text: "Default store catalog has been restored.",
      });
      refreshCatalog();
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-600 text-sm font-semibold">Verifying Administrator Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-poppins">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
              <span className="hidden xs:inline">Admin Dashboard</span>
              <span className="xs:hidden">Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition hidden sm:inline-flex"
            >
              <HomeIcon className="w-4 h-4 text-gray-500" />
              <span>Storefront</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              {showAddForm ? (
                <>
                  <XMarkIcon className="w-4 h-4" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-4 h-4" />
                  <span>Add New Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{statusMessage.text}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusMessage.undoId && (
                <button
                  type="button"
                  onClick={() => handleUndo(statusMessage.undoId!)}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  Undo
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="p-1 hover:opacity-70 text-gray-500"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Catalog & Manual Product Manager
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add custom products, affiliate links, pricing, multi-image carousels, and editorial reviews to your storefront.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{products.length}</h3>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Added</p>
              <h3 className="text-xl sm:text-2xl font-black text-purple-700 mt-1">{customProducts.length}</h3>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                {new Set(products.map((p) => p.category)).size}
              </h3>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <TagIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Expandable Manual Product Creation Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl p-4 sm:p-8 animate-fade-in space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <PlusCircleIcon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add New Product to Store Catalog</h2>
                  <p className="text-xs text-gray-500">Fill in product information, Amazon link, and reviews.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Fields (7 cols) */}
              <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-4">
                {/* 🚀 Quick Add: Auto-Fetch from Product URL */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-xs">
                        <BoltIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <span>Live URL Scraper &amp; Auto-Fill</span>
                          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                            Live Scraper
                          </span>
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Paste any Amazon product link to scrape live Title, ASIN, Real Price, MRP, High-Res Images &amp; Specs.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAutoFetch();
                          }
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text")?.trim();
                          if (pasted && (pasted.includes("amazon") || pasted.includes("amzn") || pasted.includes("a.co") || pasted.startsWith("http"))) {
                            setUrl(pasted);
                            setTimeout(() => handleAutoFetch(pasted), 50);
                          }
                        }}
                        placeholder="Paste Amazon product link (e.g. https://www.amazon.in/dp/B0CHX1W1XY...)"
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-amber-300/80 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-gray-900 placeholder-gray-400 font-medium"
                      />
                      {url && (
                        <button
                          type="button"
                          onClick={() => setUrl("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoFetch()}
                      disabled={isFetchingUrlData}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:from-amber-600 active:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 flex-shrink-0 cursor-pointer"
                    >
                      {isFetchingUrlData ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Scraping Data...</span>
                        </>
                      ) : (
                        <>
                          <BoltIcon className="w-4 h-4" />
                          <span>⚡ Scrape from URL</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {fetchFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                        fetchFeedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : fetchFeedback.type === "error"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {fetchFeedback.type === "success" && (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                      {fetchFeedback.type === "error" && (
                        <XMarkIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      {fetchFeedback.type === "info" && (
                        <ArrowPathIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                      )}
                      <span className="flex-1 font-medium leading-relaxed">
                        {fetchFeedback.message}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFetchFeedback(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 1. Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Title / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise Canceling Headphones"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* 2. ASIN / ID & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Amazon ASIN / Product ID
                    </label>
                    <input
                      type="text"
                      value={asin}
                      onChange={(e) => setAsin(e.target.value.toUpperCase())}
                      placeholder="e.g. B09XS7JWHH (Auto-generated if empty)"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Department / Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none bg-gray-50 focus:border-blue-500 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {category === "Other" && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category name..."
                        className="mt-2 w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Product URL & Editor Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Amazon Product URL <span className="text-red-500">*</span>
                      </label>
                      {url && (
                        <button
                          type="button"
                          onClick={() => handleAutoFetch()}
                          className="text-[11px] text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <BoltIcon className="w-3 h-3 text-amber-500" />
                          <span>Scrape from URL</span>
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.amazon.in/dp/..."
                        className="w-full pr-16 px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoFetch()}
                        disabled={isFetchingUrlData || !url.trim()}
                        className="absolute right-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        {isFetchingUrlData ? "..." : "Fetch"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Editorial Badge (Ribbon)
                    </label>
                    <input
                      type="text"
                      value={editorBadge}
                      onChange={(e) => setEditorBadge(e.target.value)}
                      placeholder="e.g. Top Value Pick, Editor's Choice"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 4. Pricing & Rating */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1,499"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">M.R.P. (₹)</label>
                    <input
                      type="text"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="e.g. 3,999"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Review Count</label>
                    <input
                      type="number"
                      value={ratingCount}
                      onChange={(e) => setRatingCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 5. Images (Multi-Image Carousel Support) */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700">
                    Product Image URLs (Multi-Image Carousel) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Primary Image URL: https://m.media-amazon.com/images/I/..."
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={image1}
                      onChange={(e) => setImage1(e.target.value)}
                      placeholder="Additional Image 1 (Optional)"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                    <input
                      type="url"
                      value={image2}
                      onChange={(e) => setImage2(e.target.value)}
                      placeholder="Additional Image 2 (Optional)"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 6. Short Highlights & Review Summary */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Short Spec Highlights (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={shortDetail}
                      onChange={(e) => setShortDetail(e.target.value)}
                      placeholder="e.g. 40mm Drivers • 40H Playback • Active Noise Cancellation"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Editorial Review & Summary
                    </label>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Detailed evaluation of product performance, ergonomics, build quality, and value..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 7. Pros & Cons (Strengths & Tradeoffs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      Key Strengths (Pros - One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={prosText}
                      onChange={(e) => setProsText(e.target.value)}
                      placeholder="Rich, detailed bass&#10;All-day comfort with plush earcups&#10;Fast USB-C charging"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 bg-emerald-50/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Tradeoffs (Cons - One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={consText}
                      onChange={(e) => setConsText(e.target.value)}
                      placeholder="No multipoint Bluetooth pairing&#10;Earcups do not fold completely flat"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-amber-500 bg-amber-50/20"
                    />
                  </div>
                </div>

                {/* 8. Who It's For */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Audience Recommendation (Who It's For)
                  </label>
                  <input
                    type="text"
                    value={whoItsFor}
                    onChange={(e) => setWhoItsFor(e.target.value)}
                    placeholder="e.g. Commuters, remote workers, and audiophiles seeking high fidelity."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                {/* 9. Technical Specifications */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700">
                      Technical Specifications
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      + Add Spec Field
                    </button>
                  </div>
                  <div className="space-y-2">
                    {specRows.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                          placeholder="Spec Name (e.g. Battery)"
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                          placeholder="Value (e.g. 40 Hours)"
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none"
                        />
                        {specRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-4 border-t border-gray-100 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full xs:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full xs:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 text-center"
                  >
                    {isSubmitting ? "Adding Product..." : "Save Product to Store"}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Card Preview (5 cols) */}
              <div className="lg:col-span-5 bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1">
                  <EyeIcon className="w-4 h-4 text-blue-600" />
                  <span>Live Storefront Card Preview</span>
                </div>
                <div className="max-w-[280px] sm:max-w-[320px] mx-auto">
                  <ProductCard product={previewProduct} />
                </div>
                <p className="text-[11px] text-gray-400 text-center">
                  This preview renders with live 3-second carousel transitions, pricing badges, and direct Amazon affiliate links.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Catalog Search & Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, ASIN, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {deletedIds.length > 0 && (
              <button
                type="button"
                onClick={handleRestoreAll}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition"
                title="Restore all default catalog products"
              >
                Restore Defaults ({deletedIds.length})
              </button>
            )}
            <label htmlFor="category-filter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">Category:</label>
            <select
              id="category-filter"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium bg-gray-50 outline-none cursor-pointer"
            >
              <option value="all">All Departments ({products.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table (Desktop & Tablet) & Cards (Mobile) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {/* Mobile Product Card List (sm:hidden) */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No products match your search.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isCustom = customProducts.some((c) => c.id.toUpperCase() === p.id.toUpperCase());
                return (
                  <div key={p.id} className="p-4 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-14 h-14 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {isCustom ? (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">
                              Custom Added
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md">
                              Curated Catalog
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-gray-400">{p.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{p.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                      <div>
                        <span className="font-extrabold text-gray-900">₹{p.price || "Check Price"}</span>
                        {p.mrp && <span className="text-[10px] text-gray-400 line-through ml-1.5">₹{p.mrp}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-lg text-xs transition border border-red-200"
                          title="Delete product from catalog"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tablet & Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item & Images</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      No products match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isCustom = customProducts.some((c) => c.id.toUpperCase() === p.id.toUpperCase());
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate" title={p.name}>
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-gray-400">ID: {p.id}</span>
                                {p.editorBadge && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                    {p.editorBadge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {p.category || "General"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-gray-950 text-sm">₹{p.price || "Check Price"}</span>
                          {p.mrp && (
                            <span className="text-[11px] text-gray-400 line-through block">₹{p.mrp}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-600">★ {p.rating?.toFixed(1) || "4.5"}</span>
                          <span className="text-[10px] text-gray-400 block">({p.ratingCount || 1000} ratings)</span>
                        </td>
                        <td className="py-3 px-4">
                          {isCustom ? (
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">
                              Custom Added
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-lg">
                              Curated Catalog
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/product/${p.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl text-xs transition"
                              title="View product detail page"
                            >
                              <span>View</span>
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-xl text-xs transition border border-red-200 hover:border-red-300"
                              title="Delete product from catalog"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!isDeleting) setProductToDelete(null);
          }}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-950">
                  Delete Product from Catalog?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This will immediately remove this product from your live store catalog, carousels, and search results.
                </p>
              </div>
            </div>

            {/* Product Snapshot */}
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 flex items-center gap-3 mb-5">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-gray-100 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 line-clamp-2">
                  {productToDelete.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-gray-950">
                    ₹{productToDelete.price || "Check Price"}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    ID: {productToDelete.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Yes, Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
