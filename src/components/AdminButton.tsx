import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AdminButton = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    try {
      const res = await axios.get(
        "https://affiliate-server-8irx.onrender.com/check-admin",
        {
          withCredentials: true,
        }
      );
      setIsAdmin(res.data.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isAdmin) return null;

  return (
    <button onClick={() => navigate("/admin/dashboard")}>
      Admin Dashboard
    </button>
  );
};

export default AdminButton;
