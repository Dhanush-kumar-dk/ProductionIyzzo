import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
          const token = await auth.currentUser?.getIdToken();
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              All Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and review customer orders from your store.
            </p>
          </div>

          <button
            onClick={handleSync}
            className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 ease-in-out shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Sync Orders
          </button>
        </div>

        {/* Orders card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Orders
            </h2>
            <span className="text-xs sm:text-sm text-gray-500">
              Total: {orders.length}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm sm:text-base">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-sm sm:text-base">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">
              No orders found.
            </p>
          ) : (
            <>
              {/* Responsive table container */}
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="border border-gray-200 px-3 py-2 text-center">
                        ID
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Email
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Tracking ID
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Item Name
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Category
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center">
                        Price
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center">
                        Fees
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Device Type
                      </th>
                      <th className="border border-gray-200 px-3 py-2">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          {order.id}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {order.email}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {order.tracking_id}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {order.item_name}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {order.category}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
                          ₹{order.price.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
                          ₹{order.fees.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {order.device_type}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm sm:text-base">
                  Page{" "}
                  <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
