import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext(null);

// =====================================================
// STORAGE HELPERS
// =====================================================

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch (error) {
    console.error("CardWise: failed to read saved user.", error);

    localStorage.removeItem("user");

    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("token");
}

// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // RESTORE SESSION
  // ===================================================

  useEffect(() => {
    try {
      const savedToken = getStoredToken();
      const savedUser = getStoredUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("CardWise: failed to restore authentication.", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================
  // HANDLE EXPIRED TOKEN
  // ===================================================

  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn("CardWise session expired. Logging out.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("cardwise_return_to");

      setToken(null);
      setUser(null);
    };

    window.addEventListener("cardwise-auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("cardwise-auth-expired", handleAuthExpired);
    };
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = useCallback((newToken, newUser) => {
    if (!newToken) {
      throw new Error("Authentication token is missing.");
    }

    if (!newUser) {
      throw new Error("User information is missing.");
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }, []);

  // ===================================================
  // LOGIN WITH BACKEND
  // ===================================================

  const loginWithCredentials = useCallback(
    async (email, password) => {
      const cleanEmail = String(email || "").trim();

      if (!cleanEmail) {
        throw new Error("Email is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      // Remove any old token before starting a fresh login.
      localStorage.removeItem("token");

      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      const data = response.data;

      if (!data?.token) {
        throw new Error(
          "Login succeeded but the server did not return a token.",
        );
      }

      const loggedInUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: String(data.role || "USER").toUpperCase(),
        active: data.active,
      };

      if (!loggedInUser.id) {
        throw new Error("Login succeeded but user ID is missing.");
      }

      if (!loggedInUser.email) {
        throw new Error("Login succeeded but user email is missing.");
      }

      login(data.token, loggedInUser);

      return {
        token: data.token,
        user: loggedInUser,
        data,
      };
    },
    [login],
  );

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("cardwise_return_to");

    setToken(null);
    setUser(null);
  }, []);

  // ===================================================
  // UPDATE USER
  // ===================================================

  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) {
      return;
    }

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);
  }, []);

  // ===================================================
  // AUTH STATUS
  // ===================================================

  const isAuthenticated = Boolean(token && user);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,

      login,
      loginWithCredentials,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      login,
      loginWithCredentials,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export default AuthContext;
