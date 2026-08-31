import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTORE SESSION
  // =====================================================

  useEffect(() => {
    try {
      const savedToken =
        localStorage.getItem("token");

      const savedUser =
        localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error,
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = (newToken, newUser) => {
    localStorage.setItem(
      "token",
      newToken,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(newUser),
    );

    setToken(newToken);
    setUser(newUser);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        isAuthenticated:
          Boolean(token && user),

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =======================================================
// USE AUTH
// =======================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}