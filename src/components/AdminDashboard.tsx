import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowUpTrayIcon,
  ShoppingCartIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/16/solid";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      if (!user) {
        setIsAdmin(false);
        navigate("/");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          "https://affiliate-server-8irx.onrender.com/check-admin",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/");
        }
      } catch (err) {
        setIsAdmin(false);
        navigate("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isAdmin === null) {
    return <p className="text-center mt-10">Checking access...</p>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 relative">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="
          absolute top-4 left-4
          flex items-center gap-2
          bg-blue-600 hover:bg-blue-700
          text-white font-medium
          px-4 py-2 rounded-xl shadow-md
          transition-all duration-300 hover:shadow-lg hover:scale-105
        "
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-sm sm:text-base">Home</span>
      </button>

      <main className="w-full max-w-5xl space-y-6 py-8">
        {/* Hero / Header card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl shadow-lg p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome to the Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-blue-50">
            Manage uploads, monitor orders, and keep track of your users all in
            one place.
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Upload Orders */}
          <button
            onClick={() => navigate("/admin/upload")}
            className="
              group bg-white rounded-2xl shadow-md p-4 sm:p-5 text-left
              flex flex-col gap-3
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300
            "
          >
            <div className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors duration-300">
              <ArrowUpTrayIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Upload Orders
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Upload your latest Excel (.xlsx) orders file and sync it with
                your store data.
              </p>
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium text-blue-600 group-hover:underline">
              Go to upload →
            </span>
          </button>

          {/* View Orders */}
          <button
            onClick={() => navigate("/admin/orders")}
            className="
              group bg-white rounded-2xl shadow-md p-4 sm:p-5 text-left
              flex flex-col gap-3
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300
            "
          >
            <div className="inline-flex items-center justify-center rounded-xl bg-green-50 p-3 group-hover:bg-green-100 transition-colors duration-300">
              <ShoppingCartIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                View Orders
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Review order details, fees, revenue, and device type insights.
              </p>
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium text-green-600 group-hover:underline">
              Go to orders →
            </span>
          </button>

          {/* Manage Users */}
          <button
            onClick={() => navigate("/admin/users")}
            className="
              group bg-white rounded-2xl shadow-md p-4 sm:p-5 text-left
              flex flex-col gap-3
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300
            "
          >
            <div className="inline-flex items-center justify-center rounded-xl bg-purple-50 p-3 group-hover:bg-purple-100 transition-colors duration-300">
              <UserIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Manage Users
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                View and manage users who are using your affiliate platform.
              </p>
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium text-purple-600 group-hover:underline">
              Go to users →
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
