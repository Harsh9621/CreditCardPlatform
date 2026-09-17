import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import "./ApplyApplication.css";

const INITIAL_FORM_DATA = {
  monthlyIncome: "",
  employmentType: "Salaried",
  dateOfBirth: "",
  phone: "",
  address: "",
};

function ApplyApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  /* =====================================================
     LOAD CARD
  ====================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchCard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/cards/${id}`);

        if (!isMounted) {
          return;
        }

        setCard(response.data);
      } catch (err) {
        console.error("Card loading error:", err);

        if (!isMounted) {
          return;
        }

        if (err.response?.status === 404) {
          setError("The selected credit card could not be found.");
        } else {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Unable to load credit card details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!id) {
      setError("Invalid credit card.");
      setLoading(false);
      return undefined;
    }

    fetchCard();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /* =====================================================
     FORM CHANGE
  ====================================================== */

  const handleChange = (event) => {
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

  /* =====================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {
    const monthlyIncome = Number(formData.monthlyIncome);
    const phone = formData.phone.trim();
    const address = formData.address.trim();

    if (!formData.monthlyIncome) {
      return "Please enter your monthly income.";
    }

    if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
      return "Please enter a valid monthly income.";
    }

    if (!formData.dateOfBirth) {
      return "Please enter your date of birth.";
    }

    const selectedDate = new Date(formData.dateOfBirth);
    const today = new Date();

    if (Number.isNaN(selectedDate.getTime())) {
      return "Please enter a valid date of birth.";
    }

    if (selectedDate > today) {
      return "Date of birth cannot be in the future.";
    }

    if (!phone) {
      return "Please enter your phone number.";
    }

    if (!/^[0-9+\-\s()]{10,15}$/.test(phone)) {
      return "Please enter a valid phone number.";
    }

    if (!address) {
      return "Please enter your complete address.";
    }

    if (address.length < 10) {
      return "Please enter a more complete address.";
    }

    return "";
  };

  /* =====================================================
     SUBMIT APPLICATION
  ====================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      sessionStorage.setItem("cardwise_return_to", window.location.pathname);

      navigate("/login", {
        state: {
          from: window.location.pathname,
        },
      });

      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (parseError) {
      console.error("Saved user parsing error:", parseError);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
        state: {
          from: window.location.pathname,
        },
      });

      return;
    }

    if (!user?.id) {
      setError("Your login session is invalid. Please login again.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const cardId = Number(id);

    if (!Number.isInteger(cardId) || cardId <= 0) {
      setError("Invalid credit card selected.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Backend endpoint:
       * POST /api/applications/apply?userId={userId}&creditCardId={cardId}
       */

      const response = await api.post("/applications/apply", null, {
        params: {
          userId: user.id,
          creditCardId: cardId,
        },
      });

      console.log("Application created:", response.data);

      setSuccess(
        "Your credit card application has been submitted successfully.",
      );

      setFormData(INITIAL_FORM_DATA);

      window.setTimeout(() => {
        navigate("/applications", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      console.error("Application submission error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
          state: {
            from: window.location.pathname,
          },
        });

        return;
      }

      if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            "You may already have an application for this credit card.",
        );

        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to submit your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING STATE
  ====================================================== */

  if (loading) {
    return (
      <div className="apply-page">
        <section className="apply-message" aria-live="polite">
          <div className="apply-loader" aria-hidden="true"></div>

          <h2>Loading Card Details...</h2>

          <p>Please wait while we prepare your application.</p>
        </section>
      </div>
    );
  }

  /* =====================================================
     CARD LOAD ERROR
  ====================================================== */

  if (error && !card) {
    return (
      <div className="apply-page">
        <section className="apply-message apply-error" role="alert">
          <div className="apply-message-icon" aria-hidden="true">
            !
          </div>

          <span className="apply-message-label">CARDWISE APPLICATION</span>

          <h2>Unable to Load Card</h2>

          <p>{error}</p>

          <Link to="/cards" className="apply-back-button">
            <span aria-hidden="true">←</span>
            Back to Cards
          </Link>
        </section>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const bankName = card.bank || "CardWise";
  const bankInitial = bankName.trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="apply-page">
      <div className="apply-container">
        {/* =================================================
            BACK NAVIGATION
        ================================================== */}

        <Link to={`/cards/${id}`} className="apply-back">
          <span aria-hidden="true">←</span>
          Back to Card Details
        </Link>

        {/* =================================================
            MAIN LAYOUT
        ================================================== */}

        <div className="apply-layout">
          {/* =================================================
              CARD INFORMATION
          ================================================== */}

          <section className="apply-card-info">
            <span className="apply-label">CARDWISE APPLICATION</span>

            <h1>Apply for Your Credit Card</h1>

            <p className="apply-intro">
              Complete the application form below to submit your application for
              this credit card.
            </p>

            {/* SELECTED CARD */}

            <div className="selected-card">
              <div className="selected-card-top">
                <div className="selected-card-logo" aria-hidden="true">
                  {bankInitial}
                </div>

                <div className="selected-card-name">
                  <span>{bankName}</span>

                  <strong>{card.name || "Credit Card"}</strong>
                </div>
              </div>

              <div className="selected-card-details">
                <div>
                  <span>Card Type</span>

                  <strong>{card.cardType || "Credit"}</strong>
                </div>

                <div>
                  <span>Cashback</span>

                  <strong>{card.cashbackPercentage ?? 0}%</strong>
                </div>

                <div>
                  <span>Annual Fee</span>

                  <strong>₹{card.annualFee ?? 0}</strong>
                </div>

                <div>
                  <span>Joining Fee</span>

                  <strong>₹{card.joiningFee ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* BENEFITS */}

            <div className="apply-benefits">
              <div className="apply-benefits-icon" aria-hidden="true">
                ✦
              </div>

              <div>
                <h3>Why Choose This Card?</h3>

                <p>
                  {card.benefits ||
                    "Enjoy valuable benefits, rewards and features with this credit card."}
                </p>
              </div>
            </div>

            {/* APPLICATION NOTE */}

            <div className="apply-info-note">
              <span aria-hidden="true">✓</span>

              <p>
                Your application will be reviewed by the CardWise administration
                team after submission.
              </p>
            </div>
          </section>

          {/* =================================================
              APPLICATION FORM
          ================================================== */}

          <section className="apply-form-card">
            <div className="apply-form-heading">
              <span>APPLICATION DETAILS</span>

              <h2>Tell Us About Yourself</h2>

              <p>
                Please provide accurate information to continue with your
                application.
              </p>
            </div>

            {error && (
              <div className="apply-form-error" role="alert">
                <span aria-hidden="true">!</span>

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                className="apply-form-success"
                role="status"
                aria-live="polite"
              >
                <span aria-hidden="true">✓</span>

                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* MONTHLY INCOME */}

              <div className="apply-input-group">
                <label htmlFor="monthlyIncome">
                  Monthly Income
                  <span aria-hidden="true">*</span>
                </label>

                <div className="apply-input-wrapper">
                  <span className="apply-input-prefix" aria-hidden="true">
                    ₹
                  </span>

                  <input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="Enter monthly income"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* EMPLOYMENT TYPE */}

              <div className="apply-input-group">
                <label htmlFor="employmentType">
                  Employment Type
                  <span aria-hidden="true">*</span>
                </label>

                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="Salaried">Salaried</option>

                  <option value="Self-Employed">Self-Employed</option>

                  <option value="Business">Business</option>

                  <option value="Student">Student</option>
                </select>
              </div>

              {/* DATE OF BIRTH */}

              <div className="apply-input-group">
                <label htmlFor="dateOfBirth">
                  Date of Birth
                  <span aria-hidden="true">*</span>
                </label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  autoComplete="bday"
                  required
                  disabled={submitting}
                />
              </div>

              {/* PHONE */}

              <div className="apply-input-group">
                <label htmlFor="phone">
                  Phone Number
                  <span aria-hidden="true">*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={15}
                  required
                  disabled={submitting}
                />
              </div>

              {/* ADDRESS */}

              <div className="apply-input-group">
                <label htmlFor="address">
                  Address
                  <span aria-hidden="true">*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  maxLength={500}
                  required
                  disabled={submitting}
                ></textarea>

                <small className="apply-character-count">
                  {formData.address.length}/500
                </small>
              </div>

              {/* SECURITY NOTE */}

              <div className="apply-security-note">
                <span className="apply-security-icon" aria-hidden="true">
                  🔒
                </span>

                <p>
                  Your information is securely processed by CardWise and used
                  only for your application.
                </p>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="apply-submit-button"
                disabled={submitting || Boolean(success)}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="apply-submit-spinner"
                      aria-hidden="true"
                    ></span>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="apply-required-note">
              <span aria-hidden="true">*</span>
              Required fields
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ApplyApplication;
