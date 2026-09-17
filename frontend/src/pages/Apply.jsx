import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import "./Apply.css";

function Apply() {
  const { cardId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCard = async () => {
      try {
        setLoading(true);
        setError("");

        if (!cardId) {
          throw new Error("Invalid credit card ID.");
        }

        const response = await api.get(`/cards/${cardId}`);

        if (isMounted) {
          setCard(response.data);
        }
      } catch (err) {
        console.error("Unable to load card:", err);

        if (isMounted) {
          setCard(null);
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Unable to load this credit card.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCard();

    return () => {
      isMounted = false;
    };
  }, [cardId]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const getBankInitial = () => {
    return card?.bank?.trim()?.charAt(0)?.toUpperCase() || "C";
  };

  const getSavedUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      const parsedUser = JSON.parse(savedUser);

      return parsedUser?.id ? parsedUser : null;
    } catch (err) {
      console.error("Unable to read saved user:", err);

      localStorage.removeItem("user");
      return null;
    }
  };

  const redirectToLogin = () => {
    navigate("/login", {
      state: {
        from: `/apply/${cardId}`,
      },
    });
  };

  const submitApplication = async () => {
    if (submitting || success) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const user = getSavedUser();

      if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        redirectToLogin();
        return;
      }

      if (!card?.id) {
        setError("The selected credit card is no longer available.");
        return;
      }

      const response = await api.post(
        `/applications/apply?userId=${user.id}&creditCardId=${card.id}`,
      );

      setSuccess(
        response.data?.message ||
          "Your application has been submitted successfully.",
      );

      window.setTimeout(() => {
        navigate("/applications", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Application submission error:", err);

      if (err.response?.status === 401) {
        redirectToLogin();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You do not have permission to submit this application.",
        );
        return;
      }

      if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            "The selected credit card could not be found.",
        );
        return;
      }

      if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            "You already have an application for this card.",
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

  if (loading) {
    return (
      <div className="apply-page">
        <section className="apply-loading">
          <div className="apply-loader" aria-hidden="true"></div>

          <h2>Loading Card...</h2>

          <p>Preparing your application.</p>
        </section>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="apply-page">
        <section className="apply-error-page">
          <div className="apply-error-icon" aria-hidden="true">
            !
          </div>

          <span className="apply-error-badge">CREDIT CARD</span>

          <h2>Card Not Found</h2>

          <p>{error || "We could not find the credit card you selected."}</p>

          <Link to="/cards" className="apply-primary-button">
            Browse Cards
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="apply-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="apply-hero">
        <div className="apply-container">
          <div className="apply-hero-content">
            <div className="apply-hero-copy">
              <span className="apply-eyebrow">CARDWISE APPLICATION</span>

              <h1>Apply for Your Credit Card</h1>

              <p>
                Review your selected card and submit your application securely.
              </p>
            </div>

            <div className="apply-hero-icon" aria-hidden="true">
              💳
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="apply-section">
        <div className="apply-container">
          {/* ERROR */}

          {error && (
            <div className="apply-alert apply-alert-error" role="alert">
              <span aria-hidden="true">!</span>

              <div>
                <strong>Application Error</strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="apply-alert apply-alert-success" role="status">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Application Submitted</strong>

                <p>{success}</p>
              </div>
            </div>
          )}

          <div className="apply-layout">
            {/* =================================================
                CARD SUMMARY
            ================================================= */}

            <section className="apply-card-summary">
              <div className="apply-section-label">SELECTED CREDIT CARD</div>

              <div className="apply-credit-card">
                <div className="apply-card-glow"></div>

                <div className="apply-card-top">
                  <div className="apply-bank">
                    <div className="apply-bank-circle">{getBankInitial()}</div>

                    <span>{card.bank || "CardWise"}</span>
                  </div>

                  <span className="apply-card-network">VISA</span>
                </div>

                <div className="apply-chip" aria-hidden="true">
                  <span></span>
                </div>

                <div className="apply-card-number">•••• •••• •••• ••••</div>

                <div className="apply-card-bottom">
                  <div>
                    <small>CARD MEMBER</small>

                    <strong>CARDWISE CUSTOMER</strong>
                  </div>

                  <div>
                    <small>TYPE</small>

                    <strong>{card.cardType || "CREDIT"}</strong>
                  </div>
                </div>
              </div>

              <div className="apply-card-name">
                <span className="apply-card-type">
                  {card.cardType || "Credit Card"}
                </span>

                <h2>{card.name}</h2>

                <p>
                  {card.bank || "CardWise"}
                  {" • "}
                  {card.cardType || "Credit Card"}
                </p>
              </div>

              {/* FEATURES */}

              <div className="apply-features">
                <div className="apply-feature">
                  <span>Annual Fee</span>

                  <strong>{formatCurrency(card.annualFee)}</strong>

                  <small>Yearly</small>
                </div>

                <div className="apply-feature">
                  <span>Joining Fee</span>

                  <strong>{formatCurrency(card.joiningFee)}</strong>

                  <small>One-time</small>
                </div>

                <div className="apply-feature">
                  <span>Cashback</span>

                  <strong>{card.cashbackPercentage ?? 0}%</strong>

                  <small>Rewards</small>
                </div>

                <div className="apply-feature">
                  <span>Rewards</span>

                  <strong>{card.rewardType || "Rewards"}</strong>

                  <small>Card benefits</small>
                </div>
              </div>
            </section>

            {/* =================================================
                APPLICATION CONFIRMATION
            ================================================= */}

            <section className="apply-form-card">
              <div className="apply-form-header">
                <span className="apply-section-label">APPLICATION</span>

                <h2>Confirm Your Application</h2>

                <p>
                  Your CardWise account information will be used to process this
                  application.
                </p>
              </div>

              <div className="apply-confirmation">
                <div className="apply-confirmation-icon" aria-hidden="true">
                  ✓
                </div>

                <div>
                  <h3>Ready to Apply?</h3>

                  <p>
                    By clicking <strong>Submit Application</strong>, your
                    application for <strong>{card.name}</strong> will be
                    submitted for review.
                  </p>
                </div>
              </div>

              <div className="apply-benefits">
                <div>
                  <span aria-hidden="true">✓</span>
                  Secure application
                </div>

                <div>
                  <span aria-hidden="true">✓</span>
                  Application tracking
                </div>

                <div>
                  <span aria-hidden="true">✓</span>
                  Status updates
                </div>
              </div>

              <button
                type="button"
                className="apply-submit-button"
                onClick={submitApplication}
                disabled={submitting || Boolean(success)}
                aria-busy={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : success
                    ? "Application Submitted ✓"
                    : "Submit Application"}
              </button>

              <Link to={`/cards/${card.id}`} className="apply-back-button">
                ← Back to Card Details
              </Link>
            </section>
          </div>

          {/* =================================================
              SECURITY NOTE
          ================================================= */}

          <div className="apply-security-note">
            <span aria-hidden="true">🔒</span>

            <div>
              <strong>Your information is secure</strong>

              <p>
                CardWise uses secure authentication to protect your account and
                application information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Apply;
