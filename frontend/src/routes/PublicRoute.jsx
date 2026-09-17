import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait until authentication state is restored
  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" aria-hidden="true"></div>
        <p>Loading CardWise...</p>
      </div>
    );
  }

  // Not logged in → allow access
  if (!isAuthenticated || !user) {
    return children;
  }

  const role = String(user.role || "").toUpperCase();

  // Already logged-in admin
  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  // Already logged-in customer
  return <Navigate to="/dashboard" replace />;
}

export default PublicRoute;
