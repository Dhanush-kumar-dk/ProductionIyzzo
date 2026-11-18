import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { supabase, supabaseUrl, supabaseKey } from "../supabase";
import { verifyIsAdmin } from "../utils/admin";
import { DEFAULT_PARTNER_TAG } from "../config/api";
import { getViewerSummary } from "../utils/visitorAnalytics";
import DailyViewersChart from "./DailyViewersChart";
import {
  Product,
  getAllCatalogProducts,
  getCustomProducts,
  getDeletedProductIds,
  deleteProduct,
  deleteMultipleProducts,
  restoreProduct,
  resetCatalogToDefaults,
  syncProductsFromSupabase,
  getProductPath,
} from "../data/products";
import {
  ArrowUpTrayIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  HomeIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CubeIcon,
  ChartBarIcon,
  EyeIcon,
  PlusCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
    undoId?: string;
  } | null>(null);
  const [viewerSummary, setViewerSummary] = useState(() => getViewerSummary(30));

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async (user: User | null) => {
      setAdminUser(user);
      const verified = await verifyIsAdmin(user);
      if (isMounted) {
        setIsAdmin(verified);
        if (!verified) {
          navigate("/");
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      checkAccess(user);
    });

    checkAccess(auth.currentUser);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const refreshCatalog = () => {
    setProducts(getAllCatalogProducts());
    setCustomProducts(getCustomProducts());
    setDeletedIds(getDeletedProductIds());
  };

  useEffect(() => {
    refreshCatalog();
    syncProductsFromSupabase();
    const handleUpdate = () => refreshCatalog();
    const handleViewerUpdate = () => setViewerSummary(getViewerSummary(30));

    window.addEventListener("catalogUpdated", handleUpdate);
    window.addEventListener("viewerStatsUpdated", handleViewerUpdate);
    return () => {
      window.removeEventListener("catalogUpdated", handleUpdate);
      window.removeEventListener("viewerStatsUpdated", handleViewerUpdate);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const prod = productToDelete;

    try {
      // 1. Delete locally & fire catalogUpdated event
      deleteProduct(prod.id);

      // 2. Cloud DB sync (Supabase & Firestore)
      try {
        const { error: sbErr } = await supabase.from("products").delete().eq("id", prod.id);
        if (sbErr) {
          await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(prod.id)}`, {
            method: "DELETE",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          });
        }
      } catch (sbErr) {
        console.warn("Supabase delete notice:", sbErr);
      }

      try {
        await deleteDoc(doc(firestore, "products", prod.id));
      } catch (fsErr) {
        console.warn("Firestore delete notice:", fsErr);
      }

      setToastMessage({
        type: "success",
        text: `Product "${prod.name}" was removed from the store catalog.`,
        undoId: prod.id,
      });

      refreshCatalog();
    } catch (err) {
      console.error("Error removing product:", err);
      setToastMessage({
        type: "error",
        text: `Could not delete product ${prod.id}. Please try again.`,
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));

  const isSomeSelected =
    selectedProductIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const visibleSet = new Set(filteredProducts.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const newSelected = new Set(selectedProductIds);
      filteredProducts.forEach((p) => newSelected.add(p.id));
      setSelectedProductIds(Array.from(newSelected));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const confirmBulkDelete = async () => {
    if (!selectedProductIds.length) return;
    setIsBulkDeleting(true);
    const count = selectedProductIds.length;
    const idsToDelete = [...selectedProductIds];

    try {
      // 1. Local batch deletion
      deleteMultipleProducts(idsToDelete);

      // 2. Cloud DB sync (Supabase)
      try {
        const { error: sbErr } = await supabase.from("products").delete().in("id", idsToDelete);
        if (sbErr) {
          for (const id of idsToDelete) {
            await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
              method: "DELETE",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            }).catch(() => {});
          }
        }
      } catch (sbErr) {
        console.warn("Supabase bulk delete notice:", sbErr);
      }

      // 3. Firestore delete
      try {
        for (const id of idsToDelete) {
          await deleteDoc(doc(firestore, "products", id)).catch(() => {});
        }
      } catch (fsErr) {
        console.warn("Firestore bulk delete notice:", fsErr);
      }

      setSelectedProductIds([]);
      setShowBulkDeleteModal(false);
      setToastMessage({
        type: "success",
        text: `Successfully removed ${count} product${count > 1 ? "s" : ""} from the catalog.`,
      });
      refreshCatalog();
    } catch (err) {
      console.error("Bulk delete error:", err);
      setToastMessage({
        type: "error",
        text: "Could not complete bulk deletion. Please try again.",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleUndo = (productId: string) => {
    restoreProduct(productId);
    setToastMessage({
      type: "success",
      text: "Product restored to store catalog successfully! 🎉",
    });
    refreshCatalog();
  };

  const handleRestoreAll = () => {
    if (window.confirm("Are you sure you want to restore all default catalog products?")) {
      resetCatalogToDefaults();
      setToastMessage({
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

  if (!isAdmin) {
    return null;
  }

  const adminEmail = adminUser?.email || localStorage.getItem("email") || "admin@affiliatepulse.io";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-poppins pb-16">
      {/* Top Admin Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex-shrink-0"
            >
              <HomeIcon className="w-4 h-4 text-gray-500" />
              <span className="hidden xs:inline">Back to Store</span>
              <span className="xs:hidden">Store</span>
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block flex-shrink-0" />
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="p-1 sm:p-1.5 bg-purple-100 text-purple-700 rounded-lg flex-shrink-0">
                <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <h1 className="text-xs sm:text-base font-bold text-gray-900 truncate">
                Admin Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Storefront
            </span>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-medium">Logged in as</span>
              <span className="font-bold text-gray-800 text-xs truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs block">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 sm:p-8 shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/20 mb-3">
              ⚡ Affiliate Network Engine
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
              Affiliate Operations & Performance
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Manage product imports, monitor orders generated via your tracking tag, sync affiliate report data, and manage your partner network.
            </p>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹84,240</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% this month</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Fees</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">₹5,896</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">~7.0% effective fee rate</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Viewers</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {viewerSummary.totalUniqueViewers.toLocaleString()}
              </h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {viewerSummary.todayUniqueViewers} today • Live
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <EyeIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalog Products</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{products.length}</h3>
              <p className="text-[11px] text-gray-500 font-semibold mt-1">
                {customProducts.length} custom • {deletedIds.length} hidden
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CubeIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Partner Tag</p>
              <h3 className="text-sm font-extrabold text-purple-700 mt-1 truncate max-w-[130px]">
                {DEFAULT_PARTNER_TAG}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">PA-API / Creators Active</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Day-Wise Total Viewers Analytics Graph */}
        <DailyViewersChart />

        {/* Action Modules */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Management & Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Manual Product Manager */}
            <div
              onClick={() => navigate("/admin/products")}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircleIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                  Add & Manage Products
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Manually add products to your catalog with Amazon affiliate URLs, images, prices, specs, and pros/cons.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-amber-600 mt-5 group-hover:translate-x-1 transition-transform">
                Open Product Manager →
              </span>
            </div>

            {/* 2. Upload Orders */}
            <div
              onClick={() => navigate("/admin/upload")}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpTrayIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Upload Order Reports
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Import official Associates Excel (.xlsx) / CSV monthly earnings and orders sheets into the analytics engine.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-blue-600 mt-5 group-hover:translate-x-1 transition-transform">
                Open Report Uploader →
              </span>
            </div>

            {/* 3. View Orders */}
            <div
              onClick={() => navigate("/admin/orders")}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCartIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  View & Filter Orders
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Review itemized orders, items shipped, fee breakdowns, device origins (Mobile vs Desktop), and commission payouts.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 mt-5 group-hover:translate-x-1 transition-transform">
                Inspect Sales Data →
              </span>
            </div>

            {/* 4. Manage Users */}
            <div
              onClick={() => navigate("/admin/users")}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  Affiliates & Partners
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Inspect registered affiliate creators, partner tracking IDs, assigned store sub-tags, and attributed performance.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-purple-600 mt-5 group-hover:translate-x-1 transition-transform">
                Manage Affiliates →
              </span>
            </div>
          </div>
        </div>

        {/* Live Catalog Management with Delete Product Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Store Products Catalog
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {products.length} Products
                </span>
                {deletedIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                    {deletedIds.length} Deleted
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage active products across your store. Click the delete button on any product to remove it from the live site.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {deletedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
                  title="Restore all default catalog products"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/admin/products?add=true", { state: { openAdd: true } })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-gray-950 font-bold text-xs rounded-xl shadow-xs transition"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Toast / Notification Banner */}
          {toastMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium animate-fade-in border ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {toastMessage.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className="truncate">{toastMessage.text}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toastMessage.undoId && (
                  <button
                    type="button"
                    onClick={() => handleUndo(toastMessage.undoId!)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition"
                  >
                    Undo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="p-1 hover:bg-black/5 rounded-lg text-gray-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Search & Bulk Select Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center gap-2 flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search products by title, ID/ASIN, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm outline-none placeholder-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {filteredProducts.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-bold border transition ${
                  isAllSelected
                    ? "bg-amber-500 text-gray-950 border-amber-500 shadow-xs"
                    : selectedProductIds.length > 0
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={() => {}} // handled by button onClick
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer accent-amber-500 pointer-events-none"
                />
                <span>
                  {isAllSelected
                    ? "Deselect All"
                    : `Select All (${filteredProducts.length})`}
                </span>
              </button>
            )}
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedProductIds.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border border-amber-300/80 rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  <span className="text-amber-800 font-extrabold">{selectedProductIds.length}</span> product{selectedProductIds.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedProductIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Products Table & Mobile Cards */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            {/* Mobile Product Cards (< 640px) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  No products found.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isCustom = customProducts.some(
                    (c) => c.id.toUpperCase() === p.id.toUpperCase()
                  );
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`p-4 space-y-3 transition ${
                        isChecked ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectProduct(p.id)}
                          aria-label={`Select product ${p.name}`}
                          className="w-4 h-4 mt-1 rounded text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer accent-amber-500 flex-shrink-0"
                        />
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
                            <span className="text-[10px] font-mono text-gray-400">
                              {p.id}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                            {p.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <div>
                          <span className="font-extrabold text-gray-900">
                            ₹{p.price || "Check Price"}
                          </span>
                          {p.mrp && (
                            <span className="text-[10px] text-gray-400 line-through ml-1.5">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(getProductPath(p))}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs transition"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-xl text-xs transition border border-red-200"
                            title="Delete this product"
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

            {/* Desktop & Tablet Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/90 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={toggleSelectAll}
                        aria-label="Select all products"
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer accent-amber-500"
                      />
                    </th>
                    <th className="py-3.5 px-4">Item & Title</th>
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
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                        No products match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isCustom = customProducts.some(
                        (c) => c.id.toUpperCase() === p.id.toUpperCase()
                      );
                      const isChecked = selectedProductIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-gray-50/70 transition ${
                            isChecked ? "bg-amber-50/60" : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectProduct(p.id)}
                              aria-label={`Select product ${p.name}`}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-gray-300 cursor-pointer accent-amber-500"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p
                                  className="font-bold text-gray-900 truncate max-w-xs"
                                  title={p.name}
                                >
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] text-gray-400">
                                    ID: {p.id}
                                  </span>
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
                            <span className="font-black text-gray-950 text-sm">
                              ₹{p.price || "Check Price"}
                            </span>
                            {p.mrp && (
                              <span className="text-[11px] text-gray-400 line-through block">
                                ₹{p.mrp}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-amber-600">
                              ★ {p.rating?.toFixed(1) || "4.5"}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              ({p.ratingCount || 1000} ratings)
                            </span>
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
                                onClick={() => navigate(getProductPath(p))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl text-xs transition"
                                title="View product page"
                              >
                                <span>View</span>
                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold rounded-xl text-xs transition border border-red-200 hover:border-red-300"
                                title="Delete product from store"
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
                  Delete Product from Store?
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && selectedProductIds.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            if (!isBulkDeleting) setShowBulkDeleteModal(false);
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
                  Delete {selectedProductIds.length} Products?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This will immediately remove {selectedProductIds.length} selected products from your live store catalog, carousels, and search results.
                </p>
              </div>
            </div>

            {/* Selected Items Summary Preview */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200/80 mb-5 max-h-40 overflow-y-auto divide-y divide-gray-100">
              {filteredProducts
                .filter((p) => selectedProductIds.includes(p.id))
                .map((p) => (
                  <div key={p.id} className="py-2 flex items-center gap-2.5 first:pt-0 last:pb-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {p.id} • ₹{p.price || "Check Price"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={confirmBulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting {selectedProductIds.length}...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Yes, Delete All Selected ({selectedProductIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
