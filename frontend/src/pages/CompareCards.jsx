import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";

import "./CompareCards.css";

function CompareCards() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const notificationTimer = useRef(null);
  const redirectTimer = useRef(null);

  const [cards, setCards] = useState([]);
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applicationStatusByCard, setApplicationStatusByCard] = useState({});
  const [applyingId, setApplyingId] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }

      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /* =====================================================
     GET LOGGED-IN USER
  ===================================================== */

  const getLoggedInUser = useCallback(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (parseError) {
      console.error("Unable to parse CardWise user:", parseError);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }
  }, []);

  /* =====================================================
     FETCH USER APPLICATIONS
  ===================================================== */

  const fetchUserApplications = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setApplicationStatusByCard({});
      return;
    }

    const user = getLoggedInUser();

    if (!user?.id) {
      setApplicationStatusByCard({});
      return;
    }

    try {
      const response = await api.get(`/applications/user/${user.id}`);

      const applications = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      const statusMap = {};

      applications.forEach((application) => {
        const creditCardId = application?.creditCard?.id;
        const status = application?.status;

        if (creditCardId && status) {
          statusMap[String(creditCardId)] = String(status).toUpperCase();
        }
      });

      setApplicationStatusByCard(statusMap);
    } catch (err) {
      console.error(
        "Compare applications error:",
        err.response?.data || err.message,
      );

      setApplicationStatusByCard({});
    }
  }, [getLoggedInUser]);

  /* =====================================================
     LOAD CARDS
  ===================================================== */

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cards");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      setCards(data);

      const requestedCard = searchParams.get("card");

      if (requestedCard) {
        const exists = data.some(
          (card) => String(card.id) === String(requestedCard),
        );

        if (exists) {
          setFirstId(String(requestedCard));
        }
      }

      await fetchUserApplications();
    } catch (err) {
      console.error("Compare cards error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load cards for comparison.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchUserApplications, searchParams]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  /* =====================================================
     SELECTED CARDS
  ===================================================== */

  const firstCard = useMemo(
    () => cards.find((card) => String(card.id) === String(firstId)),
    [cards, firstId],
  );

  const secondCard = useMemo(
    () => cards.find((card) => String(card.id) === String(secondId)),
    [cards, secondId],
  );

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const showNotification = useCallback((type, title, message) => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    setNotification({
      show: true,
      type,
      title,
      message,
    });

    notificationTimer.current = window.setTimeout(() => {
      setNotification((previous) => ({
        ...previous,
        show: false,
      }));
    }, 5000);
  }, []);

  const closeNotification = () => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    setNotification((previous) => ({
      ...previous,
      show: false,
    }));
  };

  const redirectToLogin = () => {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
    }

    redirectTimer.current = window.setTimeout(() => {
      navigate("/login", {
        state: {
          from: "/compare",
        },
      });
    }, 1400);
  };

  /* =====================================================
     APPLY FOR CARD
  ===================================================== */

  const applyForCard = async (cardId) => {
    if (applyingId !== null) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showNotification(
        "error",
        "Login Required",
        "Please login before applying for a credit card.",
      );

      redirectToLogin();
      return;
    }

    const user = getLoggedInUser();

    if (!user) {
      showNotification(
        "error",
        "Session Expired",
        "Your login session is no longer valid. Please login again.",
      );

      redirectToLogin();
      return;
    }

    if (!user.id) {
      showNotification(
        "error",
        "Account Error",
        "Your account information is incomplete. Please login again.",
      );

      return;
    }

    const normalizedCardId = String(cardId);
    const currentStatus =
      applicationStatusByCard[normalizedCardId]?.toUpperCase();

    if (currentStatus === "APPROVED") {
      showNotification(
        "success",
        "Application Approved",
        "Your application for this credit card has already been approved.",
      );

      return;
    }

    if (currentStatus === "PENDING") {
      showNotification(
        "warning",
        "Application Pending",
        "Your application for this credit card is currently under review.",
      );

      return;
    }

    try {
      setApplyingId(cardId);

      const response = await api.post(
        `/applications/apply?userId=${encodeURIComponent(
          user.id,
        )}&creditCardId=${encodeURIComponent(cardId)}`,
      );

      const applicationId = response.data?.id;

      setApplicationStatusByCard((previous) => ({
        ...previous,
        [normalizedCardId]: "PENDING",
      }));

      showNotification(
        "success",
        "Application Submitted",
        applicationId
          ? `Your application has been submitted successfully. Application ID: #${applicationId}.`
          : "Your credit card application has been submitted successfully.",
      );
    } catch (err) {
      console.error("Comparison application error:", err);

      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "");

      if (err.response?.status === 409) {
        await fetchUserApplications();

        showNotification(
          "warning",
          "Application Already Exists",
          backendMessage ||
            "You already have an active application for this card.",
        );

        return;
      }

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setApplicationStatusByCard({});

        showNotification(
          "error",
          "Session Expired",
          "Your login session has expired. Please login again.",
        );

        redirectToLogin();
        return;
      }

      if (err.response?.status === 403) {
        showNotification(
          "error",
          "Access Denied",
          "You do not have permission to submit this application.",
        );

        return;
      }

      showNotification(
        "error",
        "Application Failed",
        backendMessage ||
          "Unable to submit your application. Please try again.",
      );
    } finally {
      setApplyingId(null);
    }
  };

  /* =====================================================
     APPLICATION BUTTON
  ===================================================== */

  const getApplicationButtonText = (cardId) => {
    const status = applicationStatusByCard[String(cardId)]?.toUpperCase();

    if (applyingId === cardId) {
      return "Applying...";
    }

    switch (status) {
      case "PENDING":
        return "Application Pending";

      case "APPROVED":
        return "✓ Application Approved";

      case "REJECTED":
        return "Apply Again →";

      default:
        return "Apply Now →";
    }
  };

  const isApplicationButtonDisabled = (cardId) => {
    const status = applicationStatusByCard[String(cardId)]?.toUpperCase();

    return (
      applyingId === cardId || status === "PENDING" || status === "APPROVED"
    );
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getApplicationStatusClass = (cardId) => {
    const status = applicationStatusByCard[String(cardId)]?.toUpperCase();

    if (status === "PENDING") {
      return "compare-status-pending";
    }

    if (status === "APPROVED") {
      return "compare-status-approved";
    }

    if (status === "REJECTED") {
      return "compare-status-rejected";
    }

    return "";
  };

  /* =====================================================
     FORMATTERS
  ===================================================== */

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not specified";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  const getValue = (card, field, fallback = "Not specified") => {
    if (!card) {
      return fallback;
    }

    const value = card[field];

    if (value === null || value === undefined || String(value).trim() === "") {
      return fallback;
    }

    return value;
  };

  const getCashback = (card) => {
    if (
      card?.cashbackPercentage === null ||
      card?.cashbackPercentage === undefined ||
      card?.cashbackPercentage === ""
    ) {
      return "Not specified";
    }

    return `${card.cashbackPercentage}%`;
  };

  /* =====================================================
     COMPARISON DATA
  ===================================================== */

  const comparisonRows = [
    {
      label: "Bank",
      icon: "▣",
      first: getValue(firstCard, "bank"),
      second: getValue(secondCard, "bank"),
    },
    {
      label: "Card Type",
      icon: "◈",
      first: getValue(firstCard, "cardType"),
      second: getValue(secondCard, "cardType"),
    },
    {
      label: "Annual Fee",
      icon: "₹",
      first: formatCurrency(firstCard?.annualFee),
      second: formatCurrency(secondCard?.annualFee),
    },
    {
      label: "Joining Fee",
      icon: "＋",
      first: formatCurrency(firstCard?.joiningFee),
      second: formatCurrency(secondCard?.joiningFee),
    },
    {
      label: "Cashback",
      icon: "%",
      first: getCashback(firstCard),
      second: getCashback(secondCard),
    },
    {
      label: "Reward Type",
      icon: "★",
      first: getValue(firstCard, "rewardType"),
      second: getValue(secondCard, "rewardType"),
    },
    {
      label: "Eligibility",
      icon: "✓",
      first: getValue(firstCard, "eligibility"),
      second: getValue(secondCard, "eligibility"),
    },
    {
      label: "Benefits",
      icon: "✦",
      first: getValue(firstCard, "benefits"),
      second: getValue(secondCard, "benefits"),
    },
  ];

  /* =====================================================
     VALIDATION
  ===================================================== */

  const canCompare =
    Boolean(firstCard) &&
    Boolean(secondCard) &&
    String(firstCard.id) !== String(secondCard.id);

  /* =====================================================
     CARD PREVIEW
  ===================================================== */

  const renderCardPreview = (card, number) => {
    if (!card) {
      return null;
    }

    return (
      <div className="compare-card-preview-wrapper">
        <div className="compare-credit-card">
          <div className="compare-card-glow"></div>

          <div className="compare-credit-card-top">
            <span className="compare-card-brand">CARDWISE</span>

            <span className="compare-card-number-label">
              {number === 1 ? "01" : "02"}
            </span>
          </div>

          <div className="compare-card-chip" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="compare-card-info">
            <div>
              <small>CREDIT CARD</small>
              <strong>{card.name || "Credit Card"}</strong>
            </div>

            <div className="compare-card-bank">{card.bank || "CardWise"}</div>
          </div>
        </div>
      </div>
    );
  };

  /* =====================================================
     APPLICATION CARD
  ===================================================== */

  const renderApplyCard = (card, number) => {
    const status = applicationStatusByCard[String(card.id)]?.toUpperCase();

    return (
      <div className="comparison-apply-card">
        <div className="apply-card-top">
          <span className="apply-card-number">CARD {number}</span>

          <span className="apply-card-arrow" aria-hidden="true">
            ↗
          </span>
        </div>

        <h4>{card.name || "Credit Card"}</h4>

        <p>{card.bank || "CardWise"}</p>

        <div className="apply-card-mini-stats">
          <div>
            <small>Annual Fee</small>
            <strong>{formatCurrency(card.annualFee)}</strong>
          </div>

          <div>
            <small>Cashback</small>
            <strong>{getCashback(card)}</strong>
          </div>
        </div>

        {status && (
          <div
            className={`compare-application-status ${getApplicationStatusClass(
              card.id,
            )}`}
          >
            <span className="status-dot"></span>

            {status === "PENDING" && "Application under review"}

            {status === "APPROVED" && "Application approved"}

            {status === "REJECTED" && "Previous application rejected"}
          </div>
        )}

        <button
          type="button"
          className={`comparison-apply-button ${
            status === "PENDING" ? "application-pending" : ""
          } ${status === "APPROVED" ? "application-approved" : ""}`}
          onClick={() => applyForCard(card.id)}
          disabled={isApplicationButtonDisabled(card.id)}
        >
          {getApplicationButtonText(card.id)}
        </button>

        <Link to={`/cards/${card.id}`} className="comparison-view-card">
          Explore full card details →
        </Link>
      </div>
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="compare-page">
        <div className="compare-message" role="status" aria-live="polite">
          <div className="compare-loader" aria-hidden="true"></div>

          <h2>Loading Cards...</h2>

          <p>Fetching the latest cards from CardWise.</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="compare-page">
        <div className="compare-message" role="alert">
          <div className="compare-error-icon" aria-hidden="true">
            !
          </div>

          <h2>Unable to Compare Cards</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadCards}
            className="compare-primary-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="compare-page">
      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          className={`compare-toast compare-toast-${notification.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="compare-toast-icon" aria-hidden="true">
            {notification.type === "success" && "✓"}
            {notification.type === "warning" && "!"}
            {notification.type === "error" && "×"}
          </div>

          <div className="compare-toast-content">
            <strong>{notification.title}</strong>

            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="compare-toast-close"
            onClick={closeNotification}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <section className="compare-hero">
        <div className="compare-hero-content">
          <span className="compare-badge">CARDWISE COMPARISON</span>

          <h1>Compare Credit Cards</h1>

          <p>
            Make a more informed choice by comparing fees, rewards, cashback,
            eligibility and benefits side by side.
          </p>
        </div>
      </section>

      <main className="compare-content">
        <div className="compare-container">
          {/* =================================================
              SELECTORS
          ================================================= */}

          <section className="compare-selector-card">
            <div className="compare-selector-header">
              <div>
                <span>STEP 01</span>

                <h2>Choose Two Cards</h2>

                <p>Select two different cards to see how they compare.</p>
              </div>

              <span className="compare-count">
                {cards.length} {cards.length === 1 ? "Card" : "Cards"} Available
              </span>
            </div>

            <div className="compare-select-grid">
              <div className="compare-select-group">
                <label htmlFor="first-card">First Card</label>

                <select
                  id="first-card"
                  value={firstId}
                  onChange={(event) => setFirstId(event.target.value)}
                >
                  <option value="">Select first card</option>

                  {cards.map((card) => (
                    <option
                      key={card.id}
                      value={card.id}
                      disabled={String(card.id) === String(secondId)}
                    >
                      {card.name} — {card.bank}
                    </option>
                  ))}
                </select>
              </div>

              <div className="compare-vs" aria-hidden="true">
                VS
              </div>

              <div className="compare-select-group">
                <label htmlFor="second-card">Second Card</label>

                <select
                  id="second-card"
                  value={secondId}
                  onChange={(event) => setSecondId(event.target.value)}
                >
                  <option value="">Select second card</option>

                  {cards.map((card) => (
                    <option
                      key={card.id}
                      value={card.id}
                      disabled={String(card.id) === String(firstId)}
                    >
                      {card.name} — {card.bank}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {firstId && secondId && String(firstId) === String(secondId) && (
              <div className="compare-warning" role="alert">
                Please select two different credit cards.
              </div>
            )}
          </section>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!canCompare && (
            <section className="compare-empty">
              <div className="compare-empty-icon" aria-hidden="true">
                ⇄
              </div>

              <h2>Your Comparison Starts Here</h2>

              <p>
                Select two credit cards above and CardWise will show their key
                features, fees, rewards and benefits side by side.
              </p>
            </section>
          )}

          {/* =================================================
              COMPARISON
          ================================================= */}

          {canCompare && (
            <section className="comparison-result">
              {/* =================================================
                  SELECTED CARD HEADER
              ================================================= */}

              <div className="comparison-cards-header">
                <div className="comparison-card-column">
                  {renderCardPreview(firstCard, 1)}

                  <div className="comparison-card-name">
                    <span>CARD 01</span>

                    <h2>{firstCard.name}</h2>

                    <p>{firstCard.bank}</p>
                  </div>
                </div>

                <div className="comparison-vs-large" aria-hidden="true">
                  VS
                </div>

                <div className="comparison-card-column right">
                  {renderCardPreview(secondCard, 2)}

                  <div className="comparison-card-name right">
                    <span>CARD 02</span>

                    <h2>{secondCard.name}</h2>

                    <p>{secondCard.bank}</p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  QUICK SUMMARY
              ================================================= */}

              <div className="comparison-summary">
                <div className="comparison-summary-heading">
                  <span>AT A GLANCE</span>

                  <h3>Key card highlights</h3>

                  <p>
                    Quickly review the most important numbers before exploring
                    the full comparison.
                  </p>
                </div>

                <div className="comparison-highlight-grid">
                  <div className="comparison-highlight">
                    <span className="highlight-label">Annual Fee</span>

                    <div className="highlight-values">
                      <strong>{formatCurrency(firstCard.annualFee)}</strong>

                      <span>vs</span>

                      <strong>{formatCurrency(secondCard.annualFee)}</strong>
                    </div>
                  </div>

                  <div className="comparison-highlight">
                    <span className="highlight-label">Joining Fee</span>

                    <div className="highlight-values">
                      <strong>{formatCurrency(firstCard.joiningFee)}</strong>

                      <span>vs</span>

                      <strong>{formatCurrency(secondCard.joiningFee)}</strong>
                    </div>
                  </div>

                  <div className="comparison-highlight">
                    <span className="highlight-label">Cashback</span>

                    <div className="highlight-values">
                      <strong>{getCashback(firstCard)}</strong>

                      <span>vs</span>

                      <strong>{getCashback(secondCard)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="comparison-table-section">
                <div className="comparison-section-heading">
                  <div>
                    <span>DETAILED COMPARISON</span>

                    <h3>Features &amp; Benefits</h3>
                  </div>

                  <p>Compare each important card feature side by side.</p>
                </div>

                <div className="comparison-table-wrapper">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Feature</th>

                        <th>{firstCard.name}</th>

                        <th>{secondCard.name}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.label}>
                          <td>
                            <div className="comparison-feature-label">
                              <span className="feature-icon" aria-hidden="true">
                                {row.icon}
                              </span>

                              <strong>{row.label}</strong>
                            </div>
                          </td>

                          <td>{row.first}</td>

                          <td>{row.second}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================================
                  APPLY SECTION
              ================================================= */}

              <div className="comparison-apply-area">
                <div className="comparison-apply-heading">
                  <span>READY TO APPLY?</span>

                  <h3>Take the next step with CardWise</h3>

                  <p>
                    Explore the card details or start your application directly.
                  </p>
                </div>

                <div className="comparison-apply-grid">
                  {renderApplyCard(firstCard, 1)}

                  {renderApplyCard(secondCard, 2)}
                </div>
              </div>

              {/* =================================================
                  FOOT ACTIONS
              ================================================= */}

              <div className="comparison-actions">
                <Link
                  to={`/cards/${firstCard.id}`}
                  className="comparison-secondary-button"
                >
                  View {firstCard.name}
                </Link>

                <Link
                  to={`/cards/${secondCard.id}`}
                  className="comparison-secondary-button"
                >
                  View {secondCard.name}
                </Link>

                <Link to="/cards" className="comparison-secondary-button">
                  Browse All Cards
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default CompareCards;
