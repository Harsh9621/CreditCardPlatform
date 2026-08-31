import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "USER",
      });

      console.log("REGISTER RESPONSE:", response.data);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : null) ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* LEFT SIDE */}

        <div className="register-brand">
          <Link to="/" className="register-brand-logo">
            <span className="register-logo-icon">C</span>
            CardWise
          </Link>

          <div className="register-brand-content">
            <span>START YOUR CARDWISE JOURNEY</span>

            <h1>
              Discover cards
              <br />
              built for you.
            </h1>

            <p>
              Create your CardWise account and compare credit cards, explore
              rewards and manage your applications from one place.
            </p>

            <div className="register-features">
              <div>
                <span>✓</span>
                Compare cards easily
              </div>

              <div>
                <span>✓</span>
                Find better rewards
              </div>

              <div>
                <span>✓</span>
                Track applications
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="register-form-area">
          <div className="register-card">
            <Link to="/" className="mobile-register-logo">
              <span className="register-logo-icon">C</span>
              CardWise
            </Link>

            <div className="register-heading">
              <h2>Create Account</h2>

              <p>Join CardWise and discover better credit cards.</p>
            </div>

            {error && <div className="register-error">{error}</div>}

            {success && <div className="register-success">{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="register-input-group">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-input-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-input-group">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="register-divider">
              <span></span>

              <p>Already have an account?</p>

              <span></span>
            </div>

            <Link to="/login" className="login-link-button">
              Login to CardWise
            </Link>

            <Link to="/" className="register-back-home">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
