import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =====================================================
// USER PAGES
// =====================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cards from "./pages/Cards";
import Applications from "./pages/Applications";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminApplications from "./pages/AdminApplications";
import AdminCards from "./pages/AdminCards";
import AdminProfile from "./pages/AdminProfile";
import AdminContact from "./pages/AdminContact";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar";

// =====================================================
// GLOBAL CSS
// =====================================================

import "./App.css";

// =====================================================
// GET CURRENT USER
// =====================================================

function getCurrentUser() {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Error reading user:", error);
    return null;
  }
}

// =====================================================
// GET USER ROLE
// =====================================================

function getUserRole() {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return String(user.role || "").toUpperCase();
}

// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  // Only ADMIN can access admin pages
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// =====================================================
// USER PROTECTED ROUTE
// =====================================================

function UserRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  // ADMIN should use admin dashboard
  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

// =====================================================
// PUBLIC AUTH ROUTE
// =====================================================

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  // User already logged in
  if (token && user) {
    const role = getUserRole();

    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

// =====================================================
// 404 PAGE
// =====================================================

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-number">404</div>

        <h2>Page Not Found</h2>

        <p>The page you are looking for does not exist.</p>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      {/* =================================================
          ONE GLOBAL NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>
        {/* =================================================
            AUTH ROUTES
        ================================================= */}

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

        {/* =================================================
            USER HOME
        ================================================= */}

        <Route
          path="/"
          element={
            <UserRoute>
              <Home />
            </UserRoute>
          }
        />

        {/* =================================================
            CREDIT CARDS
        ================================================= */}

        <Route
          path="/cards"
          element={
            <UserRoute>
              <Cards />
            </UserRoute>
          }
        />

        {/* =================================================
            USER APPLICATIONS
        ================================================= */}

        <Route
          path="/applications"
          element={
            <UserRoute>
              <Applications />
            </UserRoute>
          }
        />

        {/* =================================================
            USER PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <UserRoute>
              <Profile />
            </UserRoute>
          }
        />

        {/* =================================================
            CONTACT
        ================================================= */}

        <Route
          path="/contact"
          element={
            <UserRoute>
              <Contact />
            </UserRoute>
          }
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN CARDS
        ================================================= */}

        <Route
          path="/admin/cards"
          element={
            <AdminRoute>
              <AdminCards />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN APPLICATIONS
        ================================================= */}

        <Route
          path="/admin/applications"
          element={
            <AdminRoute>
              <AdminApplications />
            </AdminRoute>
          }
        />

        {/* =================================================
            ADMIN PROFILE
        ================================================= */}

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />

        <Route
  path="/admin/contact"
  element={
    <AdminRoute>
      <AdminContact />
    </AdminRoute>
  }
/>

        {/* =================================================
            404
        ================================================= */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
