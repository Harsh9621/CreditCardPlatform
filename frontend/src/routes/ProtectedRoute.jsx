import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait until authentication state is restored
  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" aria-hidden="true"></div>
        <p>Loading CardWise...</p>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    const returnTo = location.pathname + location.search + location.hash;

    if (returnTo && returnTo !== "/") {
      sessionStorage.setItem("cardwise_return_to", returnTo);
    }

    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toUpperCase();

  // Admin-only pages
  if (adminOnly && role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Customer pages should not be accessible by admin
  if (!adminOnly && role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
