import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
    <div className="flex min-h-screen bg-gray-100">
      <AdminDashboardSidebar />
      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h1>
        <p className="text-gray-700">
          Use the sidebar to manage uploads and view orders.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
