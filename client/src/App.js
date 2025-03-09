import React from "react";
import { Route, Routes } from "react-router-dom"; // Removed BrowserRouter as Router
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Auth from "./pages/Auth";
import Notice from "./pages/Notice";
import Workers from "./pages/Workers"
import LoginAdmin from "./pages/LoginAdmin";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content"> {/* Changed div to main for semantic HTML */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/worker" element={<Workers />} />
          <Route path="/adminauth" element={<LoginAdmin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;