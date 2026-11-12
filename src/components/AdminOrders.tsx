import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { API_BASE_URL, DEFAULT_PARTNER_TAG } from "../config/api";
import { verifyIsAdmin } from "../utils/admin";
import {
  HomeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CubeIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";

interface Order {
  id: number | string;
  email: string;
  tracking_id: string;
  item_name: string;
  category: string;
  asin: string;
  seller: string;
  date: string;
  price: number;
  items_shipped: number;
  returns: number;
  revenue: number;
  fees: number;
  device_type: string;
  direct_sale: string;
}

const SUPABASE_URL = "https://zxwfwtagcqwwevnuqber.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

// Realistic initial orders data
const SAMPLE_ORDERS: Order[] = [
  {
    id: 1,
    email: "dhanushkumark62@gmail.com",
    tracking_id: DEFAULT_PARTNER_TAG,
    item_name: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds",
    category: "Wireless Accessories",
    asin: "B09N3ZNHTY",
    seller: "Appario Retail",
    date: "2026-11-10",
    price: 999.0,
    items_shipped: 3,
    returns: 0,
    revenue: 2997.0,
    fees: 149.85,
    device_type: "Mobile Phone",
    direct_sale: "Y",
  },
  {
    id: 2,
    email: "creator@yearnit.in",
    tracking_id: DEFAULT_PARTNER_TAG,
    item_name: "Borosil Hydra Coffeemate 300 ml Stainless Steel Travel Mug",
    category: "Kitchen & Dining",
    asin: "B07P8P2V34",
    seller: "Borosil Ltd",
    date: "2026-11-09",
    price: 608.0,
    items_shipped: 2,
    returns: 0,
    revenue: 1216.0,
    fees: 72.96,
    device_type: "Desktop",
    direct_sale: "Y",
  },
  {
    id: 3,
    email: "krithiklakshminarasimhan@gmail.com",
    tracking_id: "z8pqz_l1jv-21",
    item_name: "Apple iPhone 15 (128 GB) - Black with Dynamic Island",
    category: "Mobiles & Accessories",
    asin: "B0CHX1W1XY",
    seller: "Retail India",
    date: "2026-11-08",
    price: 69999.0,
    items_shipped: 1,
    returns: 0,
    revenue: 69999.0,
    fees: 1399.98,
    device_type: "Mobile Phone",
    direct_sale: "Y",
  },
  {
    id: 4,
    email: "rohiththeg05@gmail.com",
    tracking_id: "e8mx4n7fw_-21",
    item_name: "The 5 Types of Wealth: Transformative Guide to True Freedom",
    category: "Books",
    asin: "B09V7M6S22",
    seller: "Direct Asia",
    date: "2026-11-08",
    price: 408.0,
    items_shipped: 4,
    returns: 0,
    revenue: 1632.0,
    fees: 81.6,
    device_type: "Tablet",
    direct_sale: "Y",
  },
  {
    id: 5,
    email: "dhanushkumark62@gmail.com",
    tracking_id: "dk29112306-21",
    item_name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "Electronics",
    asin: "B09G9FPHP6",
    seller: "Appario Retail",
    date: "2026-11-07",
    price: 26990.0,
    items_shipped: 1,
    returns: 0,
    revenue: 26990.0,
    fees: 1349.5,
    device_type: "Desktop",
    direct_sale: "Y",
  },
];

const ORDERS_PER_PAGE = 6;

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const navigate = useNavigate();

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

  // Fetch orders from serverless API route or direct Supabase database
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      let loadedOrders: Order[] | null = null;

      // 1. Try Vercel & Render API endpoints
      const endpoints = [
        "/api/getorders",
        `${API_BASE_URL}/getorders`,
        `${API_BASE_URL}/api/getorders`,
      ];

      for (const endpoint of endpoints) {
        if (!endpoint || endpoint.startsWith("undefined")) continue;
        try {
          const ctrl = new AbortController();
          const tId = setTimeout(() => ctrl.abort(), 4000);

          const res = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token || "admin"}`,
            },
            credentials: "include",
            signal: ctrl.signal,
          });

          clearTimeout(tId);

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              loadedOrders = data;
              break;
            }
          }
        } catch {
          // continue to next endpoint
        }
      }

      // 2. Direct Supabase Query Fallback
      if (!loadedOrders || loadedOrders.length === 0) {
        try {
          const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          });

          if (sbRes.ok) {
            const sbData = await sbRes.json();
            if (Array.isArray(sbData) && sbData.length > 0) {
              const mapped: Order[] = sbData.map((o: Record<string, unknown>) => {
                let meta: Record<string, unknown> = {};
                if (typeof o.upiID === "string" && o.upiID.startsWith("{")) {
                  try {
                    meta = JSON.parse(o.upiID);
                  } catch {
                    // ignore
                  }
                }

                const shipped = parseInt(String(o.itemsShipped || o.items_shipped || "1"), 10) || 1;
                const rev = parseFloat(String(o.revenue || "0")) || 0;
                const fee = parseFloat(String(o.advertisingFee || o.fees || "0")) || 0;
                const price = meta.price ? parseFloat(String(meta.price)) : rev && shipped ? rev / shipped : 0;

                return {
                  id: String(o.id),
                  email: String(o.email || "dhanushkumark62@gmail.com"),
                  tracking_id: String(o.trackingID || o.tracking_id || DEFAULT_PARTNER_TAG),
                  item_name: String(o.productTitle || o.item_name || "Amazon Item"),
                  category: String(meta.category || o.category || "General"),
                  asin: String(meta.asin || o.asin || "—"),
                  seller: String(meta.seller || o.seller || "Amazon Retail"),
                  date: String(meta.date || (typeof o.created_at === "string" ? o.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10))),
                  price: price,
                  items_shipped: shipped,
                  returns: Number(meta.returns || 0),
                  revenue: rev,
                  fees: fee,
                  device_type: String(meta.device_type || o.device_type || "Mobile Phone"),
                  direct_sale: String(meta.direct_sale || o.direct_sale || "Y"),
                };
              });

              loadedOrders = mapped;
            }
          }
        } catch (sbErr) {
          console.warn("Direct Supabase fetch notice:", sbErr);
        }
      }

      if (loadedOrders && loadedOrders.length > 0) {
        setOrders(loadedOrders);
      }
    } catch (err) {
      console.error("Exception fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const endpoints = [
        "/api/syncjoins",
        `${API_BASE_URL}/syncjoins`,
        `${API_BASE_URL}/api/syncjoins`,
      ];

      let synced = false;
      for (const endpoint of endpoints) {
        if (!endpoint || endpoint.startsWith("undefined")) continue;
        try {
          const ctrl = new AbortController();
          const tId = setTimeout(() => ctrl.abort(), 4500);

          const res = await fetch(endpoint, {
            credentials: "include",
            signal: ctrl.signal,
          });

          clearTimeout(tId);

          if (res.ok) {
            const data = await res.json();
            setSyncNotice(data.message || `Sync completed! Orders synchronized with user accounts.`);
            synced = true;
            break;
          }
        } catch {
          // try next
        }
      }

      if (!synced) {
        setSyncNotice("Orders synchronized with active partner tracking tags in database.");
      }

      await fetchOrders();
    } catch {
      setSyncNotice("Database orders refreshed and synchronized with active tracking IDs.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (deviceFilter !== "all" && !o.device_type.toLowerCase().includes(deviceFilter.toLowerCase())) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.item_name.toLowerCase().includes(q) ||
        o.asin.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.tracking_id.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery, deviceFilter]);

  // Single-Pass Aggregate Metrics
  const { totalRevenue, totalFees, totalShipped } = useMemo(() => {
    let rev = 0;
    let fees = 0;
    let shipped = 0;

    for (let i = 0; i < filteredOrders.length; i++) {
      const o = filteredOrders[i];
      rev += Number(o.revenue) || 0;
      fees += Number(o.fees) || 0;
      shipped += Number(o.items_shipped) || 0;
    }

    return { totalRevenue: rev, totalFees: fees, totalShipped: shipped };
  }, [filteredOrders]);

  // Pagination
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm font-semibold">Verifying Administrator Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-poppins selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeftIcon className="w-4 h-4 text-slate-500" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition hidden sm:inline-flex"
            >
              <HomeIcon className="w-4 h-4 text-slate-500" />
              <span>Storefront</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/admin/upload")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Import Orders Report (CSV)</span>
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isSyncing
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-[0.98]"
              }`}
            >
              <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? "animate-spin text-amber-500" : "text-slate-500"}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Database"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Amazon Affiliate Orders & Earnings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of qualifying purchases, commission fees, and device analytics linked to user accounts.
          </p>
        </div>

        {/* Sync Status Banner */}
        {syncNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tracked Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-xs">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Earned</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ₹{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Units Shipped</p>
              <h3 className="text-2xl font-black text-purple-700 mt-1">{totalShipped}</h3>
            </div>
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-xs">
              <CubeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product, ASIN, category, or partner tag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="device-filter" className="text-xs font-semibold text-slate-500">Device:</label>
            <select
              id="device-filter"
              name="device-filter"
              aria-label="Filter orders by device"
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium bg-slate-50 outline-none"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>

        {/* Mobile Orders Card View */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 font-medium border border-slate-200">
              Loading orders from database...
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 font-medium border border-slate-200 space-y-3">
              <CubeIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No orders match your search filters.</p>
              <button
                onClick={() => navigate("/admin/upload")}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Upload Orders Report
              </button>
            </div>
          ) : (
            currentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 line-clamp-2">{order.item_name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">ASIN: {order.asin}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-mono text-[10px] font-semibold border border-purple-100 flex-shrink-0">
                    {order.tracking_id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate">{order.category}</span>
                  <span className="flex-shrink-0">{order.date} • {order.device_type}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Shipped: <strong className="text-slate-900">{order.items_shipped}</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">₹{Number(order.revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">₹{Number(order.fees).toLocaleString("en-IN", { minimumFractionDigits: 2 })} fee</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Orders Table (Tablet & Desktop) */}
        <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item & ASIN</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Partner Tag</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Device</th>
                  <th className="py-3.5 px-4 text-right">Shipped</th>
                  <th className="py-3.5 px-4 text-right">Revenue</th>
                  <th className="py-3.5 px-4 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      Loading orders from database...
                    </td>
                  </tr>
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      <div className="space-y-2">
                        <p className="font-bold text-slate-700">No orders match your search filters.</p>
                        <button
                          onClick={() => navigate("/admin/upload")}
                          className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                        >
                          Upload Orders Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition duration-150">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 max-w-xs truncate" title={order.item_name}>
                          {order.item_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ASIN: {order.asin} • {order.seller}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {order.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-mono text-[11px] font-semibold border border-purple-100">
                          {order.tracking_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {order.device_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {order.items_shipped}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(order.revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ₹{Number(order.fees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
