import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Cards from "./pages/Cards";
import CardDetails from "./pages/CardDetails";
import CompareCards from "./pages/CompareCards";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminCards from "./pages/AdminCards";
import AdminProfile from "./pages/AdminProfile";
import AdminContact from "./pages/AdminContact";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import "./App.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon" aria-hidden="true">
          ?
        </div>

        <div className="not-found-number">404</div>

        <h1>Page Not Found</h1>

        <p>
          The page you are looking for doesn't exist or may have been moved.
        </p>

        <button
          type="button"
          className="not-found-button"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={logout} />

      <main className="app-main">
        <Routes>
          {/* =========================
              PUBLIC
          ========================= */}

          <Route path="/" element={<Home />} />

          <Route path="/cards" element={<Cards />} />

          <Route path="/cards/:id" element={<CardDetails />} />

          <Route path="/compare" element={<CompareCards />} />

          <Route path="/contact" element={<Contact />} />

          {/* =========================
              AUTH
          ========================= */}

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* =========================
              CUSTOMER
          ========================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/apply/:cardId"
            element={
              <ProtectedRoute>
                <Apply />
              </ProtectedRoute>
            }
          />

          {/* =========================
              ADMIN
          ========================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/cards"
            element={
              <ProtectedRoute adminOnly>
                <AdminCards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute adminOnly>
                <AdminApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute adminOnly>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute adminOnly>
                <AdminContact />
              </ProtectedRoute>
            }
          />

          {/* =========================
              404
          ========================= */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
