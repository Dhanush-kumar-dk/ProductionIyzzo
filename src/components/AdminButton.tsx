import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { verifyIsAdmin } from "../utils/admin";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

const AdminButton = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async (user: User | null) => {
      const adminVerified = await verifyIsAdmin(user);
      if (isMounted) {
        setIsAdmin(adminVerified);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      checkStatus(user);
    });

    // Also check initial cached state
    checkStatus(auth.currentUser);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <button
      onClick={() => navigate("/admin/dashboard")}
      className="
        inline-flex items-center gap-1.5
        px-3.5 py-2
        text-xs font-bold
        text-white
        rounded-xl
        bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600
        hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500
        shadow-sm hover:shadow-md
        border border-purple-400/30
        transform hover:scale-[1.02] active:scale-95
        transition-all duration-200
        flex-shrink-0
      "
      title="Open Admin Management Console"
    >
      <ShieldCheckIcon className="w-4 h-4 text-amber-300 flex-shrink-0" />
      <span>Admin Console</span>
    </button>
  );
};

export default AdminButton;
