import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // FIXED EMAIL REGEX
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // LOGIN API
      // =================================================

      console.log("Sending login request:", {
        email: cleanEmail,
      });

      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password: password,
      });

      console.log("Login response:", response.data);

      const data = response.data;

      // =================================================
      // GET TOKEN
      // =================================================

      const token = data?.token;

      if (!token) {
        setError("Login failed. Authentication token was not received.");
        return;
      }

      // =================================================
      // CREATE USER OBJECT
      // =================================================

      const user = {
        id: data?.id,
        name: data?.name,
        email: data?.email || cleanEmail,
        role: String(data?.role || "USER").toUpperCase(),
      };

      console.log("Authenticated user:", user);

      // =================================================
      // SAVE AUTHENTICATION
      // =================================================

      login(token, user);

      // =================================================
      // ROLE BASED REDIRECT
      // =================================================

      if (user.role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      const status = error.response?.status;

      const backendMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : "");

      console.error("Login status:", status);

      console.error("Login backend response:", error.response?.data);

      // =================================================
      // ERROR HANDLING
      // =================================================

      if (status === 400) {
        setError(
          backendMessage ||
            "Invalid login request. Please check your email and password.",
        );
      } else if (status === 401) {
        setError(backendMessage || "Invalid email or password.");
      } else if (status === 403) {
        setError(
          backendMessage || "Your account does not have permission to login.",
        );
      } else if (status === 404) {
        setError("Login service was not found. Please check the backend.");
      } else if (status >= 500) {
        setError(
          "Server error. Please make sure the CardWise backend is running.",
        );
      } else {
        setError(backendMessage || "Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="login-brand">
          <Link to="/" className="login-brand-logo">
            <span className="login-logo-icon">C</span>
            CardWise
          </Link>

          <div className="login-brand-content">
            <span>SMARTER CREDIT CARD CHOICES</span>

            <h1>
              Choose your card
              <br />
              with confidence.
            </h1>

            <p>
              Compare credit cards, discover rewards, and manage your
              applications from one secure platform.
            </p>

            <div className="login-features">
              <div>
                <span>✓</span>
                Compare credit cards
              </div>

              <div>
                <span>✓</span>
                Discover better rewards
              </div>

              <div>
                <span>✓</span>
                Track applications
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="login-form-area">
          <div className="login-card">
            <Link to="/" className="mobile-login-logo">
              <span className="login-logo-icon">C</span>
              CardWise
            </Link>

            <div className="login-heading">
              <h2>Welcome Back</h2>

              <p>Login to your CardWise account.</p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleLogin} noValidate>
              <div className="input-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="login-divider">
              <span></span>

              <p>New to CardWise?</p>

              <span></span>
            </div>

            <Link to="/register" className="register-link">
              Create a New Account
            </Link>

            <Link to="/" className="back-home">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
