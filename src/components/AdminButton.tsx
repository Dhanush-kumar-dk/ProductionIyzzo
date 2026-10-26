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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        px-3.5 py-1.5
        text-xs font-bold
        text-white
        rounded-xl
        bg-gradient-to-r from-purple-600 to-indigo-600
        hover:from-purple-700 hover:to-indigo-700
        shadow-sm hover:shadow-md
        border border-purple-400/30
        transform hover:scale-105 active:scale-95
        transition-all duration-200
      "
      title="Open Admin Management Console"
    >
      <ShieldCheckIcon className="w-4 h-4 text-amber-300" />
      <span>Admin Console</span>
    </button>
  );
};

export default AdminButton;
