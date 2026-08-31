import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Cards.css";

function Cards() {
  const navigate = useNavigate();

  const notificationTimer = useRef(null);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applyingId, setApplyingId] = useState(null);

  /*
   * Stores latest application status for each card.
   *
   * Example:
   * {
   *   2: "REJECTED",
   *   3: "PENDING",
   *   4: "PENDING",
   *   6: "APPROVED"
   * }
   */
  const [applicationStatusByCard, setApplicationStatusByCard] = useState({});

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
    };
  }, []);

  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  useEffect(() => {
    loadPageData();
  }, []);

  /* =====================================================
     LOAD CARDS + USER APPLICATIONS
     ===================================================== */

  const loadPageData = async () => {
    await Promise.all([fetchCards(), fetchUserApplications()]);
  };

  /* =====================================================
     FETCH CARDS
     ===================================================== */

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cards");

      console.log("Cards API response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      setCards(data);
    } catch (err) {
      console.error("Cards API error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load credit cards. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     GET LOGGED-IN USER
     ===================================================== */

  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Unable to parse user:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }
  };

  /* =====================================================
     FETCH USER APPLICATIONS
     ===================================================== */

  const fetchUserApplications = async () => {
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
      /*
       * This endpoint should return applications
       * belonging to the logged-in user.
       *
       * Your current backend response shows:
       * Array(27)
       */

      const response = await api.get(`/applications/user/${user.id}`);

      const applications = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      console.log("User applications:", applications);

      /*
       * Build:
       *
       * card ID -> latest application status
       */

      const statusMap = {};

      applications.forEach((application) => {
        const creditCardId = application?.creditCard?.id;
        const status = application?.status;

        if (creditCardId && status) {
          /*
           * Because the backend is returning applications
           * in newest-first order, the first application
           * for a card is the latest one.
           */
          if (!statusMap[creditCardId]) {
            statusMap[creditCardId] = status.toUpperCase();
          }
        }
      });

      console.log("Active application status by card:", statusMap);

      setApplicationStatusByCard(statusMap);
    } catch (err) {
      console.error(
        "User applications API error:",
        err.response?.data || err.message,
      );

      /*
       * Do not break the cards page if application history
       * cannot be loaded.
       */
      setApplicationStatusByCard({});
    }
  };

  /* =====================================================
     SHOW NOTIFICATION
     ===================================================== */

  const showNotification = (type, title, message) => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    setNotification({
      show: true,
      type,
      title,
      message,
    });

    notificationTimer.current = setTimeout(() => {
      setNotification((previous) => ({
        ...previous,
        show: false,
      }));
    }, 5000);
  };

  /* =====================================================
     CLOSE NOTIFICATION
     ===================================================== */

  const closeNotification = () => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    setNotification((previous) => ({
      ...previous,
      show: false,
    }));
  };

  /* =====================================================
     APPLY FOR CARD
     ===================================================== */

  const applyForCard = async (cardId) => {
    if (applyingId !== null) {
      return;
    }

    const token = localStorage.getItem("token");

    /* -----------------------------------------------------
       LOGIN CHECK
       ----------------------------------------------------- */

    if (!token) {
      showNotification(
        "error",
        "Login Required",
        "Please login before applying for a credit card.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1400);

      return;
    }

    /* -----------------------------------------------------
       USER CHECK
       ----------------------------------------------------- */

    const user = getLoggedInUser();

    if (!user) {
      showNotification(
        "error",
        "Session Expired",
        "Your login session is no longer valid. Please login again.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1400);

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

    /* -----------------------------------------------------
       CURRENT APPLICATION STATUS
       ----------------------------------------------------- */

    const currentStatus = applicationStatusByCard[cardId]?.toUpperCase();

    /*
     * APPROVED
     *
     * User cannot apply again.
     */

    if (currentStatus === "APPROVED") {
      showNotification(
        "success",
        "Application Approved",
        "Your application for this credit card has already been approved.",
      );

      return;
    }

    /*
     * PENDING
     *
     * User cannot submit another application while
     * the current one is being processed.
     */

    if (currentStatus === "PENDING") {
      showNotification(
        "warning",
        "Application Pending",
        "Your application for this credit card is currently under review.",
      );

      return;
    }

    /*
     * REJECTED
     *
     * User IS allowed to apply again.
     */

    try {
      setApplyingId(cardId);

      console.log("Submitting application:", {
        userId: user.id,
        creditCardId: cardId,
        previousStatus: currentStatus || "NONE",
      });

      const response = await api.post(
        `/applications/apply?userId=${user.id}&creditCardId=${cardId}`,
      );

      console.log("Application response:", response.data);

      const applicationId = response.data?.id;

      /*
       * New application is pending.
       */

      setApplicationStatusByCard((previous) => ({
        ...previous,
        [cardId]: "PENDING",
      }));

      showNotification(
        "success",
        "Application Submitted",
        applicationId
          ? `Your application has been submitted successfully. Application ID: #${applicationId}.`
          : "Your credit card application has been submitted successfully.",
      );
    } catch (err) {
      console.error("Application error:", err);
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);

      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "");

      /* ---------------------------------------------------
         DUPLICATE APPLICATION
         --------------------------------------------------- */

      if (err.response?.status === 409) {
        /*
         * Do NOT assume it is approved.
         *
         * Refresh applications so the actual latest
         * status is displayed.
         */

        await fetchUserApplications();

        showNotification(
          "warning",
          "Application Already Exists",
          backendMessage ||
            "You already have an active application for this card.",
        );

        return;
      }

      /* ---------------------------------------------------
         UNAUTHORIZED
         --------------------------------------------------- */

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setApplicationStatusByCard({});

        showNotification(
          "error",
          "Session Expired",
          "Your login session has expired. Please login again.",
        );

        setTimeout(() => {
          navigate("/login");
        }, 1400);

        return;
      }

      /* ---------------------------------------------------
         FORBIDDEN
         --------------------------------------------------- */

      if (err.response?.status === 403) {
        showNotification(
          "error",
          "Access Denied",
          "You do not have permission to submit this application.",
        );

        return;
      }

      /* ---------------------------------------------------
         GENERAL ERROR
         --------------------------------------------------- */

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
     BUTTON TEXT
     ===================================================== */

  const getApplicationButtonText = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

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

  /* =====================================================
     BUTTON DISABLED
     ===================================================== */

  const isApplicationButtonDisabled = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

    /*
     * Only PENDING and APPROVED are disabled.
     *
     * REJECTED remains enabled.
     * NONE remains enabled.
     */

    return (
      applyingId === cardId || status === "PENDING" || status === "APPROVED"
    );
  };

  /* =====================================================
     STATUS CLASS
     ===================================================== */

  const getApplicationStatusClass = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

    if (status === "PENDING") {
      return "status-pending";
    }

    if (status === "APPROVED") {
      return "status-approved";
    }

    if (status === "REJECTED") {
      return "status-rejected";
    }

    return "";
  };

  /* =====================================================
     CURRENCY
     ===================================================== */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="cards-page">
        <section className="cards-section">
          <div className="cards-message">
            <div className="loader"></div>

            <h3>Loading Credit Cards...</h3>

            <p>Fetching the latest cards from CardWise.</p>
          </div>
        </section>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="cards-page">
        <section className="cards-section">
          <div className="cards-message">
            <div className="message-icon">!</div>

            <h3>Unable to Load Cards</h3>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={loadPageData}
            >
              Try Again
            </button>
          </div>
        </section>
      </div>
    );
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="cards-page">
      {/* =================================================
          APPLICATION POPUP
      ================================================= */}

      {notification.show && (
        <div
          className={`cardwise-toast cardwise-toast-${notification.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast-icon">
            {notification.type === "success" && "✓"}

            {notification.type === "warning" && "!"}

            {notification.type === "error" && "×"}
          </div>

          <div className="toast-content">
            <strong>{notification.title}</strong>

            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="toast-close"
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

      <section className="cards-hero">
        <div className="cards-hero-content">
          <span className="section-badge">CARDWISE CREDIT CARDS</span>

          <h1>Find the Right Credit Card for You</h1>

          <p>
            Compare fees, cashback, rewards and benefits to find a credit card
            that fits your lifestyle.
          </p>

          <div className="hero-stats">
            <div>
              <strong>{cards.length}+</strong>

              <span>Available Cards</span>
            </div>

            <div>
              <strong>10+</strong>

              <span>Major Banks</span>
            </div>

            <div>
              <strong>100%</strong>

              <span>Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CARDS
      ================================================= */}

      <section className="cards-section">
        <div className="cards-container">
          <div className="cards-heading">
            <div>
              <span className="small-title">AVAILABLE CARDS</span>

              <h2>Explore Credit Cards</h2>

              <p>
                View card fees, rewards, eligibility and benefits before
                applying.
              </p>
            </div>

            <span className="card-count">
              {cards.length} {cards.length === 1 ? "Card" : "Cards"}
            </span>
          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {cards.length === 0 ? (
            <div className="cards-message">
              <div className="message-icon">💳</div>

              <h3>No Credit Cards Available</h3>

              <p>
                There are currently no credit cards available in the CardWise
                database.
              </p>
            </div>
          ) : (
            /* =================================================
               CARD GRID
            ================================================= */

            <div className="credit-cards-grid">
              {cards.map((card) => {
                const status = applicationStatusByCard[card.id]?.toUpperCase();

                const isApplying = applyingId === card.id;

                return (
                  <article className="credit-card-item" key={card.id}>
                    {/* =================================================
                        CARD VISUAL
                    ================================================= */}

                    <div className="card-visual">
                      <div className="card-visual-top">
                        <div className="bank-logo">
                          {card.bank?.charAt(0)?.toUpperCase() || "C"}
                        </div>

                        <span className="card-brand">CardWise</span>
                      </div>

                      <div className="card-chip">
                        <span></span>
                      </div>

                      <div className="card-number">4532 •••• •••• 7821</div>

                      <div className="card-visual-bottom">
                        <div>
                          <small>CARD HOLDER</small>

                          <strong>CARDWISE USER</strong>
                        </div>

                        <div>
                          <small>VALID THRU</small>

                          <strong>12/29</strong>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        CARD CONTENT
                    ================================================= */}

                    <div className="credit-card-content">
                      <div className="card-title-row">
                        <div>
                          <h3>{card.name}</h3>

                          <p className="bank-name">{card.bank}</p>
                        </div>

                        <span className="card-type">
                          {card.cardType || "Credit Card"}
                        </span>
                      </div>

                      {/* =================================================
                          APPLICATION STATUS
                      ================================================= */}

                      {status && (
                        <div
                          className={`application-status ${getApplicationStatusClass(
                            card.id,
                          )}`}
                        >
                          <span className="application-status-dot"></span>

                          <span>
                            {status === "PENDING" && "Application under review"}

                            {status === "APPROVED" && "Application approved"}

                            {status === "REJECTED" &&
                              "Previous application rejected"}
                          </span>
                        </div>
                      )}

                      {/* =================================================
                          FEES
                      ================================================= */}

                      <div className="card-details">
                        <div className="detail-item">
                          <span>Annual Fee</span>

                          <strong>{formatCurrency(card.annualFee)}</strong>
                        </div>

                        <div className="detail-item">
                          <span>Joining Fee</span>

                          <strong>{formatCurrency(card.joiningFee)}</strong>
                        </div>

                        <div className="detail-item highlight">
                          <span>Cashback</span>

                          <strong>{card.cashbackPercentage ?? 0}%</strong>
                        </div>
                      </div>

                      {/* =================================================
                          REWARD
                      ================================================= */}

                      <div className="reward-box">
                        <div className="feature-icon">★</div>

                        <div>
                          <span>Reward Type</span>

                          <strong>{card.rewardType || "Rewards"}</strong>
                        </div>
                      </div>

                      {/* =================================================
                          ELIGIBILITY
                      ================================================= */}

                      <div className="info-box">
                        <h4>Who can apply?</h4>

                        <p>
                          {card.eligibility ||
                            "Eligibility information is currently unavailable."}
                        </p>
                      </div>

                      {/* =================================================
                          BENEFITS
                      ================================================= */}

                      <div className="info-box">
                        <h4>Key Benefits</h4>

                        <p>
                          {card.benefits ||
                            "Benefits information is currently unavailable."}
                        </p>
                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="card-actions">
                        <Link to="/contact" className="contact-card-button">
                          Contact Admin
                        </Link>

                        <button
                          type="button"
                          className={`apply-button ${
                            status === "PENDING" ? "application-pending" : ""
                          } ${
                            status === "APPROVED" ? "application-approved" : ""
                          } ${
                            status === "REJECTED" ? "application-rejected" : ""
                          }`}
                          onClick={() => applyForCard(card.id)}
                          disabled={isApplicationButtonDisabled(card.id)}
                        >
                          {getApplicationButtonText(card.id)}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          CONTACT CTA
      ================================================= */}

      <section className="cards-contact-cta">
        <div>
          <span>NEED HELP?</span>

          <h2>Have Questions About a Card?</h2>

          <p>
            Contact the CardWise team if you need help understanding
            eligibility, benefits or the application process.
          </p>

          <Link to="/contact">Contact CardWise →</Link>
        </div>
      </section>
    </div>
  );
}

export default Cards;
