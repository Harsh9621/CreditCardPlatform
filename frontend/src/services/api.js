import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    // =================================================
    // 401 = NOT AUTHENTICATED
    // =================================================

    if (status === 401) {
      console.warn("Authentication failed.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // =================================================
    // 403 = FORBIDDEN
    // =================================================

    if (status === 403) {
      console.warn(
        "Access denied. Administrator privileges required."
      );

      // IMPORTANT:
      // Do NOT remove the token.
      //
      // A valid USER token can receive 403 when trying
      // to access an ADMIN endpoint.
    }

    // =================================================
    // 409 = BUSINESS CONFLICT
    // =================================================

    if (status === 409) {
      console.warn(
        "Application conflict:",
        error.response?.data?.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;