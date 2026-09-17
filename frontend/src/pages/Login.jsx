import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { loginWithCredentials } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // RETURN PATH
  // =====================================================

  const getReturnPath = () => {
    const stateFrom = location.state?.from;

    let returnPath = "";

    if (typeof stateFrom === "string") {
      returnPath = stateFrom;
    } else if (stateFrom?.pathname) {
      returnPath =
        stateFrom.pathname + (stateFrom.search || "") + (stateFrom.hash || "");
    }

    if (!returnPath) {
      returnPath = sessionStorage.getItem("cardwise_return_to") || "";
    }

    // Prevent external redirects.
    if (
      !returnPath.startsWith("/") ||
      returnPath.startsWith("//") ||
      returnPath === "/login" ||
      returnPath === "/register"
    ) {
      return "";
    }

    return returnPath;
  };

  // =====================================================
  // INPUT HANDLING
  // =====================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginWithCredentials(email, password);

      const loggedInUser = result.user;
      const role = String(loggedInUser?.role || "USER").toUpperCase();

      console.log("CardWise login successful:", {
        id: loggedInUser?.id,
        email: loggedInUser?.email,
        role,
      });

      // ===================================================
      // ADMIN REDIRECT
      // ===================================================

      if (role === "ADMIN") {
        sessionStorage.removeItem("cardwise_return_to");

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // ===================================================
      // CUSTOMER REDIRECT
      // ===================================================

      const returnPath = getReturnPath();

      sessionStorage.removeItem("cardwise_return_to");

      if (returnPath) {
        navigate(returnPath, {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      console.error("CardWise login failed:", err);

      const status = err.response?.status;

      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError("Your account does not have permission to log in.");
      } else if (status === 400) {
        setError(backendMessage || "Please check your login details.");
      } else if (!err.response) {
        setError(
          "Unable to connect to the CardWise server. Please make sure the backend is running.",
        );
      } else {
        setError(
          backendMessage || err.message || "Unable to login. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="login-page">
      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="login-background" aria-hidden="true">
        <div className="login-background-grid" />
        <div className="login-background-glow login-glow-one" />
        <div className="login-background-glow login-glow-two" />
      </div>

      <div className="login-layout">
        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="login-intro">
          <div className="login-intro-badge">
            <span className="login-intro-badge-dot" aria-hidden="true" />
            SMARTER CREDIT CARD CHOICES
          </div>

          <h1>
            Your cards.
            <span>Your choices.</span>
            <strong>Made smarter.</strong>
          </h1>

          <p>
            Sign in to CardWise to manage your credit card applications, track
            application status, and explore cards built around your needs.
          </p>

          <div className="login-trust-list">
            <div className="login-trust-item">
              <span className="login-trust-icon" aria-hidden="true">
                ✓
              </span>

              <div>
                <strong>Simple comparison</strong>
                <span>Understand cards before you apply.</span>
              </div>
            </div>

            <div className="login-trust-item">
              <span className="login-trust-icon" aria-hidden="true">
                ✓
              </span>

              <div>
                <strong>Application tracking</strong>
                <span>Keep your applications in one place.</span>
              </div>
            </div>

            <div className="login-trust-item">
              <span className="login-trust-icon" aria-hidden="true">
                ✓
              </span>

              <div>
                <strong>Secure account access</strong>
                <span>Your CardWise account stays protected.</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            LOGIN CARD
            ================================================= */}

        <section className="login-card">
          {/* BRAND */}

          <div className="login-card-top">
            <div className="login-brand-mark" aria-hidden="true">
              C
            </div>

            <span className="login-brand-name">
              Card<span>Wise</span>
            </span>
          </div>

          {/* HEADER */}

          <div className="login-header">
            <span className="login-eyebrow">WELCOME BACK</span>

            <h2>Sign in to your account</h2>

            <p>Access your dashboard and manage your CardWise applications.</p>
          </div>

          {/* =================================================
              EMAIL / PASSWORD FORM
              ================================================= */}

          <form className="login-form" onSubmit={handleLogin} noValidate>
            {error && (
              <div className="login-error" role="alert" aria-live="polite">
                <span className="login-error-icon" aria-hidden="true">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {/* EMAIL */}

            <div className="login-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  @
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="login-form-group">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password" className="login-forgot">
                  Forgot Password?
                </Link>
              </div>

              <div className="login-input-wrapper">
                <span className="login-input-icon" aria-hidden="true">
                  •••
                </span>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* SIGN IN */}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-submit-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="login-submit-arrow" aria-hidden="true">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              REGISTER
              ================================================= */}

          <div className="login-register">
            <span>Don't have an account?</span>

            <Link to="/register">Create Account</Link>
          </div>

          {/* =================================================
              SECURITY
              ================================================= */}

          <div className="login-security-note">
            <span aria-hidden="true">🔒</span>

            <span>Your connection and account information are protected.</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
