import { Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
const baseURL = 'https://backendfreelance-01e7cdd05a6d.herokuapp.com';

const Auth = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/auth/login";

  return (
    <div id="authCont" className="container">
      <div id="auth" className="container d-flex flex-column pt-5 align-items-center ">
        <div className="text-center mb-4">
          <Link to="/auth/login">
            <button
              className={`btn me-2 ${isLogin ? "btn-primary text-white" : "btn-outline-primary"}`}
            >
              KIRISH
            </button>
          </Link>
          <Link to="/auth/register">
            <button
              className={`btn ${!isLogin ? "btn-primary text-white" : "btn-outline-primary"}`}
            >
              Roʻyhatdan oʻtish
            </button>
          </Link>
        </div>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
};

const ToastContainer = ({ children }) => {
  return (
    <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1100 }}>
      {children}
    </div>
  );
};

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className={`toast show ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`} 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div className="toast-header">
        <strong className="me-auto">{type === 'success' ? 'Muvaffaqiyatli' : 'Xatolik'}</strong>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="toast" 
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhoneNumber = `+998${phoneNumber}`;
    const data = { phone_number: fullPhoneNumber, password };

    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
        console.log("Token stored:", localStorage.getItem("token"));
        showToast("Kirish muvaffaqiyatli!");
        setTimeout(() => {
          navigate("/notice");
        }, 1000);
      } else {
        showToast(result.error || "Xatolik yuz berdi", "error");
      }
    } catch (error) {
      showToast("Server bilan bogʻlanishda xatolik", "error");
    }
  };

  return (
    <>
      <div className="w-100 align d-flex justify-content-center align-items-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">+998</span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Telefon raqam"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            KIRISH
          </button>
        </form>
      </div>
      <ToastContainer>
        <Toast 
          message={toast.message} 
          type={toast.type} 
          show={toast.show} 
          onClose={hideToast} 
        />
      </ToastContainer>
    </>
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullPhoneNumber = `+998${phoneNumber}`;
    const data = { name, phone_number: fullPhoneNumber, password };

    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Registration response:", result); // Debug log
      if (response.ok) {
        localStorage.setItem("token", result.token); // Store the JWT
        console.log("Token stored:", localStorage.getItem("token")); // Debug log
        showToast("Roʻyhatdan oʻtish muvaffaqiyatli!");
        setName("");
        setPhoneNumber("");
        setPassword("");
        setTimeout(() => {
          navigate("/notice");
        }, 1000);
      } else {
        showToast(`${result.error}: ${result.details || "No details provided"}`, "error");
      }
    } catch (error) {
      showToast("Server bilan bogʻlanishda xatolik", "error");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="w-100 d-flex justify-content-center align-items-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Ism va familya"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon2">+998</span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Telefon raqam"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Roʻyxattan oʻtish
          </button>
        </form>
      </div>
      <ToastContainer>
        <Toast 
          message={toast.message} 
          type={toast.type} 
          show={toast.show} 
          onClose={hideToast} 
        />
      </ToastContainer>
    </>
  );
};

export default Auth;