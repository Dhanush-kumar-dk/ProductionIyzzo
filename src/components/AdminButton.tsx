import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AdminButton = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkAdminStatus = async () => {
    try {
      const res = await axios.get(
        "https://affiliate-server-8irx.onrender.com/check-admin",
        { withCredentials: true }
      );
      setIsAdmin(!!res.data.isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsChecking(true);
        checkAdminStatus();
      } else {
        setIsAdmin(false);
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isChecking || !isAdmin) return null;

  return (
    <button
      onClick={() => navigate("/admin/dashboard")}
      className="
        px-4 sm:px-6
        py-2 sm:py-2.5
        text-sm sm:text-base
        font-semibold
        text-white
        rounded-xl
        
        bg-gradient-to-r from-[#1E90FF] to-[#1C86EE]
        hover:from-[#1C86EE] hover:to-[#1E90FF]

        shadow-md hover:shadow-xl
        transform hover:scale-105 active:scale-95
        transition-all duration-300 ease-in-out
      "
    >
      Admin Dashboard
    </button>
  );
};

export default AdminButton;
