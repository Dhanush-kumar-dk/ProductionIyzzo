import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { verifyIsAdmin } from "../utils/admin";
import { DEFAULT_PARTNER_TAG } from "../config/api";
import {
  ArrowUpTrayIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  HomeIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CubeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAccess(user);
    });

    checkAccess(auth.currentUser);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-poppins">
      {/* Top Admin Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              <HomeIcon className="w-4 h-4 text-gray-500" />
              <span>Back to Store</span>
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <ShieldCheckIcon className="w-4 h-4" />
              </span>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">
                Iyzzo Admin Control Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Storefront
            </span>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-medium">Logged in as</span>
              <span className="font-bold text-gray-800 text-xs truncate max-w-[140px] sm:max-w-xs block">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/20 mb-3">
              ⚡ Amazon Affiliate Network Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Affiliate Operations & Performance
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Manage product imports, monitor orders generated via your tracking tag, sync affiliate report data, and manage your partner network.
            </p>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹84,240</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% this month</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Fees</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">₹5,896</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">~7.0% effective fee rate</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders Shipped</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">142</h3>
              <p className="text-[11px] text-gray-500 font-semibold mt-1">0 returns reported</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <CubeIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Partner Tag</p>
              <h3 className="text-sm font-extrabold text-purple-700 mt-1 truncate max-w-[150px]">
                {DEFAULT_PARTNER_TAG}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">PA-API / Creators Active</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Modules */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Management & Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Upload Orders */}
            <div
              onClick={() => navigate("/admin/upload")}
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowUpTrayIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Upload Order Reports
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Import official Amazon Associates Excel (.xlsx) / CSV monthly earnings and orders sheets into the analytics engine.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-blue-600 mt-5 group-hover:translate-x-1 transition-transform">
                Open Report Uploader →
              </span>
            </div>

            {/* 2. View Orders */}
            <div
              onClick={() => navigate("/admin/orders")}
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
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

            {/* 3. Manage Users */}
            <div
              onClick={() => navigate("/admin/users")}
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
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
      </main>
    </div>
  );
};

export default AdminDashboard;
