import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import TopBar from "./components/TopBar";
import LogIn from "./components/Login";
import Carousel from "./components/Carousel";
import AdminDashboard from "./components/AdminDashboard";
import SearchResults from "./components/SearchResults";
import AdminUpload from "./components/AdminUpload";
import AdminOrders from "./components/AdminOrders";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function HomePage() {
  const [openLogIn, setOpenLogIn] = useState(false);

  return (
    <div className="h-full w-full">
      {openLogIn && (
        <div className="absolute backdrop-blur-sm bg-zinc-800/30 z-10 flex items-center justify-center w-full h-full">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}
      <TopBar openLogIn={() => setOpenLogIn(true)} />
      <Carousel />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/search/:searchTerm" element={<SearchResults />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
    </Router>
  );
}

export default App;
