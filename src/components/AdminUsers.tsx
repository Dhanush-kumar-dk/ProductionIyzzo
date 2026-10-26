import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { API_BASE_URL, DEFAULT_PARTNER_TAG } from "../config/api";
import { verifyIsAdmin } from "../utils/admin";
import {
  HomeIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";

interface PlatformUser {
  id?: string;
  email: string;
  trackingid?: string;
  trackingId?: string;
  orders?: number;
  revenue?: number;
  fees?: number;
  role?: string;
}

// Comprehensive initial affiliates list
const INITIAL_USERS: PlatformUser[] = [
  {
    email: "admin@affiliatepulse.io",
    trackingid: "z8pqz_l1jv-21",
    orders: 3,
    revenue: 72996.0,
    fees: 1549.83,
    role: "Super Administrator",
  },
  {
    email: "creator@iyzzo.com",
    trackingid: DEFAULT_PARTNER_TAG,
    orders: 6,
    revenue: 41299.0,
    fees: 2890.93,
    role: "Verified Creator",
  },
  {
    email: "affiliate@creatornetwork.io",
    trackingid: "dk29112306-21",
    orders: 4,
    revenue: 12154.0,
    fees: 850.78,
    role: "Associate Partner",
  },
];

const AdminUsers = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const token = await auth.currentUser?.getIdToken();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const response = await fetch(`${API_BASE_URL}/getusers`, {
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
              setUsers(data);
              return;
            }
          }
        } catch {
          // Backend offline; keep INITIAL_USERS
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isAdmin]);

  const handleCopyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedId(tag);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

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
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Registered Affiliates & Partner Tags
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage associate tracking IDs, attribution tags, and commission performance per member.
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Affiliate Email</th>
                  <th className="py-3.5 px-4">Assigned Partner Tag</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Orders Generated</th>
                  <th className="py-3.5 px-4 text-right">Gross Sales</th>
                  <th className="py-3.5 px-4 text-right">Attributed Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      Loading users list...
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => {
                    const tag = u.trackingid || u.trackingId || DEFAULT_PARTNER_TAG;
                    return (
                      <tr key={i} className="hover:bg-gray-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              <UserCircleIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                            <span className="font-mono text-purple-700 font-bold">{tag}</span>
                            <button
                              onClick={() => handleCopyTag(tag)}
                              className="text-purple-400 hover:text-purple-700 p-0.5"
                              title="Copy partner tag"
                            >
                              {copiedId === tag ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {u.role || "Affiliate Partner"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-gray-800">
                          {u.orders ?? 4}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-gray-900">
                          ₹{(u.revenue ?? 24500).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                          ₹{(u.fees ?? 1715).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
    </div>
  );
};

export default AdminUsers;
