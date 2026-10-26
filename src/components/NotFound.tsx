import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import { useState } from "react";
import LogIn from "./Login";
import Footer from "./Footer";

export default function NotFound() {
  const navigate = useNavigate();
  const [openLogIn, setOpenLogIn] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      <TopBar openLogIn={() => setOpenLogIn(true)} />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-6xl font-extrabold text-amber-500 mb-3">404</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            The deals page or product category you're looking for doesn't exist or has expired.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-950 py-2.5 px-4 rounded-xl font-bold transition shadow-sm hover:shadow"
          >
            Explore Active Amazon Deals
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
