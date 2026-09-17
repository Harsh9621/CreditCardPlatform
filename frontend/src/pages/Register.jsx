import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // REGISTRATION
  // =====================================================

  const handleRegister = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (name.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "USER",
      });

      console.log("CardWise registration successful:", response.data);

      setSuccess("Account created successfully! Redirecting to login...");

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      console.error("CardWise registration failed:", err);

      const status = err.response?.status;

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (status === 409) {
        setError(
          backendMessage || "An account with this email already exists.",
        );
      } else if (status === 400) {
        setError(backendMessage || "Please check your registration details.");
      } else if (!err.response) {
        setError(
          "Unable to connect to the CardWise server. Please make sure the backend is running.",
        );
      } else {
        setError(
          backendMessage ||
            err.message ||
            "Registration failed. Please try again.",
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
    <main className="register-page">
      <div className="register-background" aria-hidden="true">
        <div className="register-background-grid" />

        <div className="register-background-glow register-glow-one" />

        <div className="register-background-glow register-glow-two" />
      </div>

      <div className="register-layout">
        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="register-intro">
          <Link
            to="/"
            className="register-brand-logo"
            aria-label="CardWise Home"
          >
            <span className="register-logo-icon" aria-hidden="true">
              C
            </span>

            <span className="register-logo-text">
              Card<span>Wise</span>
            </span>
          </Link>

          <div className="register-brand-content">
            <div className="register-intro-badge">
              <span className="register-intro-badge-dot" aria-hidden="true" />
              START YOUR CARDWISE JOURNEY
            </div>

            <h1>
              Discover cards
              <span>built for you.</span>
            </h1>

            <p>
              Create your CardWise account and compare credit cards, explore
              rewards, and manage your applications from one place.
            </p>

            <div className="register-features">
              <div className="register-feature">
                <span className="register-feature-icon" aria-hidden="true">
                  ✓
                </span>

                <div>
                  <strong>Compare cards easily</strong>
                  <span>Review important card features in one place.</span>
                </div>
              </div>

              <div className="register-feature">
                <span className="register-feature-icon" aria-hidden="true">
                  ✓
                </span>

                <div>
                  <strong>Find better rewards</strong>
                  <span>Discover benefits that match your needs.</span>
                </div>
              </div>

              <div className="register-feature">
                <span className="register-feature-icon" aria-hidden="true">
                  ✓
                </span>

                <div>
                  <strong>Track applications</strong>
                  <span>Manage your credit card applications easily.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REGISTER CARD
            ================================================= */}

        <section className="register-form-area">
          <div className="register-card">
            <div className="register-card-top">
              <div className="register-card-logo" aria-hidden="true">
                C
              </div>

              <span className="register-card-brand">
                Card<span>Wise</span>
              </span>
            </div>

            <div className="register-heading">
              <span className="register-eyebrow">GET STARTED</span>

              <h2>Create your account</h2>

              <p>Join CardWise and discover smarter credit card choices.</p>
            </div>

            {error && (
              <div
                className="register-message register-error"
                role="alert"
                aria-live="polite"
              >
                <span className="register-message-icon" aria-hidden="true">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="register-message register-success"
                role="status"
                aria-live="polite"
              >
                <span className="register-message-icon" aria-hidden="true">
                  ✓
                </span>

                <span>{success}</span>
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleRegister}
              noValidate
            >
              <div className="register-input-group">
                <label htmlFor="name">Full Name</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon" aria-hidden="true">
                    ◉
                  </span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-input-group">
                <label htmlFor="email">Email Address</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon" aria-hidden="true">
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

              <div className="register-input-group">
                <label htmlFor="password">Password</label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon" aria-hidden="true">
                    •••
                  </span>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>

                <span className="register-password-hint">
                  Use at least 6 characters.
                </span>
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="register-submit-spinner"
                      aria-hidden="true"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="register-submit-arrow" aria-hidden="true">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="register-divider">
              <span />
              <span>ALREADY A MEMBER?</span>
              <span />
            </div>

            <Link to="/login" className="login-link-button">
              Login to CardWise
            </Link>

            <Link to="/" className="register-back-home">
              ← Back to Home
            </Link>

            <div className="register-security-note">
              <span aria-hidden="true">🔒</span>

              <span>Your account information is securely handled.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
