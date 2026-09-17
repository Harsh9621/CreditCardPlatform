import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers = config.headers || {};

    config.headers.Accept = "application/json";

    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    // ==========================================================
    // LOG ACTUAL SERVER RESPONSE
    // ==========================================================

    if (status === 401) {
      console.warn(
        "CardWise API 401:",
        error?.response?.data || "Authentication required.",
      );
    }

    if (status === 403) {
      console.warn(
        "CardWise API 403:",
        error?.response?.data || "Access denied.",
      );
    }

    // ==========================================================
    // ONLY CLEAR SESSION FOR REAL AUTHENTICATION FAILURE
    // ==========================================================

    if (
      status === 401 &&
      !isAuthRequest &&
      !window.__cardwiseAuthHandling
    ) {
      window.__cardwiseAuthHandling = true;

      console.warn(
        "CardWise authentication failed. Clearing local session.",
      );

      const currentPath =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      const isPublicPage =
        currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath === "/forgot-password";

      if (!isPublicPage) {
        sessionStorage.setItem(
          "cardwise_return_to",
          currentPath,
        );
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new Event("cardwise-auth-expired"),
      );

      setTimeout(() => {
        window.__cardwiseAuthHandling = false;
      }, 1000);
    }

    if (status === 409) {
      console.warn(
        "CardWise request conflict:",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "The request conflicts with existing data.",
      );
    }

    if (status >= 500) {
      console.error(
        "CardWise server error:",
        error?.response?.data || error?.message,
      );
    }

    return Promise.reject(error);
  },
);

export default api;