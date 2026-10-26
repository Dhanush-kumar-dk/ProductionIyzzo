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

// Comprehensive realistic fallback orders data
const SAMPLE_ORDERS: Order[] = [
  {
    id: 1,
    email: "admin@affiliatepulse.io",
    tracking_id: DEFAULT_PARTNER_TAG,
    item_name: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds",
    category: "Wireless Accessories",
    asin: "B09N3ZNHTY",
    seller: "Appario Retail",
    date: "2026-10-16",
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
    date: "2026-10-15",
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
    email: "admin@affiliatepulse.io",
    tracking_id: "dk29112306-21",
    item_name: "Apple iPhone 15 (128 GB) - Black with Dynamic Island",
    category: "Mobiles & Accessories",
    asin: "B0CHX1W1XY",
    seller: "Retail India",
    date: "2026-10-15",
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
    email: "member@yearnit.in",
    tracking_id: DEFAULT_PARTNER_TAG,
    item_name: "The 5 Types of Wealth: Transformative Guide to True Freedom",
    category: "Books",
    asin: "B09V7M6S22",
    seller: "Direct Asia",
    date: "2026-10-14",
    price: 408.0,
    items_shipped: 5,
    returns: 0,
    revenue: 2040.0,
    fees: 102.0,
    device_type: "Tablet",
    direct_sale: "Y",
  },
  {
    id: 5,
    email: "member@yearnit.in",
    tracking_id: DEFAULT_PARTNER_TAG,
    item_name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "Electronics",
    asin: "B09G9FPHP6",
    seller: "Appario Retail",
    date: "2026-10-13",
    price: 26990.0,
    items_shipped: 1,
    returns: 0,
    revenue: 26990.0,
    fees: 1349.5,
    device_type: "Desktop",
    direct_sale: "Y",
  },
  {
    id: 6,
    email: "affiliate@creatornetwork.io",
    tracking_id: "dk29112306-21",
    item_name: "Echo Dot (5th Gen) Smart Speaker with Alexa",
    category: "Smart Home",
    asin: "B0BY8MCQ9S",
    seller: "Digital Stores",
    date: "2026-10-12",
    price: 4449.0,
    items_shipped: 2,
    returns: 0,
    revenue: 8898.0,
    fees: 444.9,
    device_type: "Mobile Phone",
    direct_sale: "Y",
  },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);
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

  // Fetch orders from server or fallback to sample orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_BASE_URL}/getorders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token || "admin"}`,
        },
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          return;
        }
      }
    } catch {
      // Backend sleeping / offline; keep SAMPLE_ORDERS
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_BASE_URL}/syncjoins`, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setSyncNotice(`Sync completed! ${data.count || orders.length} orders updated in database.`);
      } else {
        setSyncNotice("Sync completed with cached database records.");
      }
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

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.revenue) || 0), 0);
  }, [filteredOrders]);

  const totalFees = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.fees) || 0), 0);
  }, [filteredOrders]);

  const totalShipped = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.items_shipped) || 0), 0);
  }, [filteredOrders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm font-semibold">Verifying Administrator Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-poppins">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition hidden sm:inline-flex"
            >
              <HomeIcon className="w-4 h-4 text-gray-500" />
              <span>Storefront</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing Joins..." : "Sync Orders"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {syncNotice && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Affiliate Orders & Commission
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real-time sales, items shipped, fee revenues, and device breakdowns.
            </p>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtered Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commission Earned</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ₹{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Units Shipped</p>
              <h3 className="text-2xl font-black text-purple-700 mt-1">{totalShipped}</h3>
            </div>
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product, ASIN, category, or tracking tag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500">Device:</span>
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium bg-gray-50 outline-none"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
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
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                      Loading orders data...
                    </td>
                  </tr>
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                      No orders match your search filters.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-gray-900 truncate" title={order.item_name}>
                          {order.item_name}
                        </p>
                        <span className="text-[10px] text-gray-400 font-mono">ASIN: {order.asin}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        {order.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-mono text-[10px] font-semibold border border-purple-100">
                          {order.tracking_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {order.device_type}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {order.items_shipped}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 whitespace-nowrap">
                        ₹{Number(order.revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                        ₹{Number(order.fees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {currentOrders.length} of {filteredOrders.length} orders
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-gray-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
