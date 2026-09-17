import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    clearMessages();

    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone) {
      setError("Please enter your registered mobile number.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password/request-otp", {
        identifier: cleanPhone,
      });

      setPhone(cleanPhone);

      setMessage(response.data?.message || "OTP generated successfully.");

      setStep(2);
    } catch (err) {
      console.error("CardWise OTP request failed:", err);

      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;

      if (err.response?.status === 404) {
        setError(
          backendMessage ||
            "No CardWise account was found with this mobile number.",
        );
      } else if (err.response?.status === 400) {
        setError(
          backendMessage || "Please enter a valid registered mobile number.",
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the CardWise server. Please make sure the backend is running.",
        );
      } else {
        setError(backendMessage || "Unable to generate OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    clearMessages();

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password/reset", {
        identifier: phone,
        otp: cleanOtp,
        newPassword,
      });

      setMessage(response.data?.message || "Password reset successfully.");

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      console.error("CardWise password reset failed:", err);

      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;

      if (err.response?.status === 400) {
        setError(
          backendMessage ||
            "The OTP is invalid or expired. Please request a new OTP.",
        );
      } else if (err.response?.status === 404) {
        setError(backendMessage || "The account could not be found.");
      } else if (!err.response) {
        setError(
          "Unable to connect to the CardWise server. Please make sure the backend is running.",
        );
      } else {
        setError(
          backendMessage || "Unable to reset password. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    if (loading) {
      return;
    }

    setStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");

    clearMessages();
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setPhone(value);
    clearMessages();
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    clearMessages();
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    clearMessages();
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    clearMessages();
  };

  return (
    <main className="forgot-page">
      <div className="forgot-background" aria-hidden="true">
        <div className="forgot-background-grid" />

        <div className="forgot-background-glow forgot-glow-one" />

        <div className="forgot-background-glow forgot-glow-two" />
      </div>

      <div className="forgot-layout">
        <section className="forgot-intro">
          <Link to="/" className="forgot-brand-logo" aria-label="CardWise Home">
            <span className="forgot-logo-icon" aria-hidden="true">
              C
            </span>

            <span className="forgot-logo-text">
              Card<span>Wise</span>
            </span>
          </Link>

          <div className="forgot-intro-content">
            <div className="forgot-intro-badge">
              <span className="forgot-intro-badge-dot" aria-hidden="true" />
              SECURE ACCOUNT RECOVERY
            </div>

            <h1>
              Get back to your
              <span>CardWise account.</span>
            </h1>

            <p>
              Reset your password securely using the mobile number registered
              with your CardWise account.
            </p>

            <div className="forgot-trust-list">
              <div className="forgot-trust-item">
                <span className="forgot-trust-icon" aria-hidden="true">
                  01
                </span>

                <div>
                  <strong>Verify your number</strong>

                  <span>Enter the mobile number linked to your account.</span>
                </div>
              </div>

              <div className="forgot-trust-item">
                <span className="forgot-trust-icon" aria-hidden="true">
                  02
                </span>

                <div>
                  <strong>Enter your OTP</strong>

                  <span>Use the six-digit verification code you receive.</span>
                </div>
              </div>

              <div className="forgot-trust-item">
                <span className="forgot-trust-icon" aria-hidden="true">
                  03
                </span>

                <div>
                  <strong>Create a new password</strong>

                  <span>Set a new password and continue securely.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="forgot-form-area">
          <div className="forgot-card">
            <div className="forgot-card-top">
              <div className="forgot-card-logo" aria-hidden="true">
                C
              </div>

              <span className="forgot-card-brand">
                Card<span>Wise</span>
              </span>
            </div>

            <div className="forgot-header">
              <span className="forgot-eyebrow">
                {step === 1 ? "ACCOUNT RECOVERY" : "VERIFY & RESET"}
              </span>

              <div className="forgot-header-icon" aria-hidden="true">
                {step === 1 ? "?" : "✓"}
              </div>

              <h2>
                {step === 1 ? "Forgot your password?" : "Reset your password"}
              </h2>

              <p>
                {step === 1
                  ? "Enter your registered mobile number to receive a password reset OTP."
                  : "Enter the OTP and create a new password for your account."}
              </p>
            </div>

            <div
              className="forgot-progress"
              aria-label={`Password recovery step ${step} of 2`}
            >
              <div
                className={`forgot-progress-step ${step >= 1 ? "active" : ""}`}
              >
                <span>1</span>
                <strong>Mobile</strong>
              </div>

              <div
                className={`forgot-progress-line ${step >= 2 ? "active" : ""}`}
              />

              <div
                className={`forgot-progress-step ${step >= 2 ? "active" : ""}`}
              >
                <span>2</span>
                <strong>Reset</strong>
              </div>
            </div>

            {message && (
              <div
                className="forgot-message forgot-success"
                role="status"
                aria-live="polite"
              >
                <span className="forgot-message-icon" aria-hidden="true">
                  ✓
                </span>

                <span>{message}</span>
              </div>
            )}

            {error && (
              <div
                className="forgot-message forgot-error"
                role="alert"
                aria-live="polite"
              >
                <span className="forgot-message-icon" aria-hidden="true">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form
                className="forgot-form"
                onSubmit={handleRequestOtp}
                noValidate
              >
                <div className="forgot-input-group">
                  <label htmlFor="phone">Registered Mobile Number</label>

                  <div className="phone-input-wrapper">
                    <span className="country-code" aria-hidden="true">
                      +91
                    </span>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter 10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      disabled={loading}
                      required
                    />
                  </div>

                  <small className="forgot-hint">
                    Use the mobile number registered with your CardWise account.
                  </small>
                </div>

                <button
                  type="submit"
                  className="forgot-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="forgot-submit-spinner"
                        aria-hidden="true"
                      />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <span className="forgot-submit-arrow" aria-hidden="true">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                className="forgot-form"
                onSubmit={handleResetPassword}
                noValidate
              >
                <div className="otp-info">
                  <span>OTP sent to</span>

                  <strong>+91 {phone}</strong>
                </div>

                <div className="forgot-input-group">
                  <label htmlFor="otp">Verification OTP</label>

                  <input
                    id="otp"
                    name="otp"
                    className="forgot-standard-input forgot-otp-input"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={loading}
                    required
                  />

                  <small className="forgot-hint">
                    Your OTP is valid for 5 minutes.
                  </small>
                </div>

                <div className="forgot-input-group">
                  <label htmlFor="newPassword">New Password</label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    className="forgot-standard-input"
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="forgot-input-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    className="forgot-standard-input"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="forgot-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="forgot-submit-spinner"
                        aria-hidden="true"
                      />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <span className="forgot-submit-arrow" aria-hidden="true">
                        →
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="change-identifier"
                  onClick={handleChangePhone}
                  disabled={loading}
                >
                  ← Use a different mobile number
                </button>
              </form>
            )}

            <div className="forgot-footer">
              <Link to="/login">← Back to Login</Link>
            </div>

            <div className="forgot-security-note">
              <span aria-hidden="true">🔒</span>

              <span>
                Your account recovery information is handled securely.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
