import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role?.toUpperCase())
  ) {
    if (user.role?.toUpperCase() === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/cards" replace />;
  }

  return children;
}

export default ProtectedRoute;