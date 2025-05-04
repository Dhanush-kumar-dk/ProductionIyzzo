import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardSidebar from "./AdminDashboardSidebar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Order {
  id: number;
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

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);
  const navigate = useNavigate();

  const handleSync = async () => {
    try {
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/syncjoins",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to sync orders");
      const data = await response.json();
      alert(`Sync successful. ${data.count || 0} orders updated.`);
    } catch (err) {
      alert((err as Error).message);
    }
  };

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
      } catch {
        setIsAdmin(false);
        navigate("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      const fetchOrders = async () => {
        try {
          const token = await auth.currentUser?.getIdToken(); // Get the current user's token
          if (!token) throw new Error("No token found");

          const response = await fetch(
            "https://affiliate-server-8irx.onrender.com/getorders",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) throw new Error("Failed to fetch orders");
          const data: Order[] = await response.json();
          setOrders(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [isAdmin]);

  if (isAdmin === null)
    return <p className="text-center mt-10">Checking access...</p>;
  if (!isAdmin) return null;

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminDashboardSidebar />

      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Orders</h2>
          <button
            onClick={handleSync}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 ease-in-out shadow-sm hover:shadow-md"
          >
            Sync Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Email</th>{" "}
                    {/* Added Email Column */}
                    <th className="border p-2">Tracking ID</th>
                    <th className="border p-2">Item Name</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Fees</th>
                    <th className="border p-2">Device Type</th>
                    <th className="border p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="border p-2 text-center">{order.id}</td>
                      <td className="border p-2">{order.email}</td>{" "}
                      {/* Display Email */}
                      <td className="border p-2">{order.tracking_id}</td>
                      <td className="border p-2">{order.item_name}</td>
                      <td className="border p-2">{order.category}</td>
                      <td className="border p-2 text-center">
                        ₹{order.price.toFixed(2)}
                      </td>
                      <td className="border p-2 text-center">
                        ₹{order.fees.toFixed(2)}
                      </td>
                      <td className="border p-2">{order.device_type}</td>
                      <td className="border p-2">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-lg mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg ml-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
