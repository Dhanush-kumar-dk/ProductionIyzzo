import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

interface Order {
  id: number;
  customerName: string;
  product: string;
  status: string;
  orderDate: string;
  quantity: number;
  totalPrice: number;
  shippingAddress: string;
  paymentMethod: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      if (!user) {
        setIsAdmin(false);
        navigate("/"); // Redirect if not logged in
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
          navigate("/"); // Redirect if not an admin
        }
      } catch (err) {
        setIsAdmin(false);
        navigate("/");
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  // Fetch orders from API if admin
  useEffect(() => {
    if (isAdmin) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(
            "https://affiliate-server-8irx.onrender.com/get-orders"
          );
          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }
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

  if (isAdmin === null) {
    return <p className="text-center mt-10">Checking access...</p>; // Show loading state
  }

  if (!isAdmin) {
    return null; // Prevent rendering anything for unauthorized users
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="h-screen w-64 bg-white shadow-md fixed md:relative md:w-64">
        <div className="p-4 border-b text-xl font-bold">Admin Panel</div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Dashboard
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Users
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Orders
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Settings
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Total Price</th>
                  <th className="border p-2">Payment</th>
                  <th className="border p-2">Shipping Address</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Order Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="border p-2 text-center">{order.id}</td>
                    <td className="border p-2">{order.customerName}</td>
                    <td className="border p-2">{order.product}</td>
                    <td className="border p-2 text-center">{order.quantity}</td>
                    <td className="border p-2 text-center">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="border p-2">{order.paymentMethod}</td>
                    <td className="border p-2">{order.shippingAddress}</td>
                    <td
                      className={`border p-2 ${
                        order.status === "Completed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className="border p-2">{order.orderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
