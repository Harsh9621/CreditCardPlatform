import { useEffect, useMemo, useRef, useState } from "react";
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
  const [applicationStatusByCard, setApplicationStatusByCard] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("FEATURED");

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =========================================================
     LOAD PAGE
     ========================================================= */

  useEffect(() => {
    loadPageData();

    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  const loadPageData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchCards(), fetchUserApplications()]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CARD DATA
     ========================================================= */

  const fetchCards = async () => {
    try {
      const response = await api.get("/cards");

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
    }
  };

  /* =========================================================
     AUTH HELPERS
     ========================================================= */

  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (err) {
      console.error("Unable to parse saved user:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    }
  };

  /* =========================================================
     APPLICATION DATA
     ========================================================= */

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

        if (!creditCardId || !status) {
          return;
        }

        const normalizedStatus = String(status).toUpperCase();

        const applicationId = Number(application?.id || 0);

        const existing = statusMap[creditCardId];

        if (!existing || applicationId > existing.id) {
          statusMap[creditCardId] = {
            id: applicationId,
            status: normalizedStatus,
          };
        }
      });

      const finalStatusMap = {};

      Object.entries(statusMap).forEach(([cardId, value]) => {
        finalStatusMap[cardId] = value.status;
      });

      setApplicationStatusByCard(finalStatusMap);
    } catch (err) {
      console.error(
        "User applications API error:",
        err.response?.data || err.message,
      );

      setApplicationStatusByCard({});
    }
  };

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */

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

  const closeNotification = () => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }

    setNotification((previous) => ({
      ...previous,
      show: false,
    }));
  };

  /* =========================================================
     APPLY FOR CARD
     ========================================================= */

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

      setTimeout(() => {
        navigate("/login");
      }, 1400);

      return;
    }

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

    const currentStatus = applicationStatusByCard[cardId]?.toUpperCase();

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
        `/applications/apply?userId=${user.id}&creditCardId=${cardId}`,
      );

      const applicationId = response.data?.id;

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

        setTimeout(() => {
          navigate("/login");
        }, 1400);

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

  /* =========================================================
     APPLICATION UI HELPERS
     ========================================================= */

  const getApplicationButtonText = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

    if (applyingId === cardId) {
      return "Applying...";
    }

    if (status === "PENDING") {
      return "Application Pending";
    }

    if (status === "APPROVED") {
      return "✓ Application Approved";
    }

    if (status === "REJECTED") {
      return "Apply Again →";
    }

    return "Apply Now →";
  };

  const isApplicationButtonDisabled = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

    return (
      applyingId === cardId || status === "PENDING" || status === "APPROVED"
    );
  };

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

  const getApplicationStatusLabel = (cardId) => {
    const status = applicationStatusByCard[cardId]?.toUpperCase();

    if (status === "PENDING") {
      return "Application under review";
    }

    if (status === "APPROVED") {
      return "Application approved";
    }

    if (status === "REJECTED") {
      return "Previous application rejected";
    }

    return "";
  };

  /* =========================================================
     FORMATTING
     ========================================================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  /* =========================================================
     FILTERS + SORTING
     ========================================================= */

  const cardTypes = useMemo(() => {
    const types = cards
      .map((card) => card.cardType)
      .filter(Boolean)
      .map((type) => String(type).trim());

    return ["ALL", ...new Set(types)];
  }, [cards]);

  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = cards.filter((card) => {
      const matchesSearch =
        !query ||
        String(card.name || "")
          .toLowerCase()
          .includes(query) ||
        String(card.bank || "")
          .toLowerCase()
          .includes(query) ||
        String(card.cardType || "")
          .toLowerCase()
          .includes(query) ||
        String(card.rewardType || "")
          .toLowerCase()
          .includes(query) ||
        String(card.benefits || "")
          .toLowerCase()
          .includes(query);

      const matchesType =
        filterType === "ALL" ||
        String(card.cardType || "").toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "CASHBACK") {
        return (
          Number(b.cashbackPercentage || 0) - Number(a.cashbackPercentage || 0)
        );
      }

      if (sortBy === "LOW_FEE") {
        return Number(a.annualFee || 0) - Number(b.annualFee || 0);
      }

      if (sortBy === "NAME") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      return Number(a.id || 0) - Number(b.id || 0);
    });
  }, [cards, searchTerm, filterType, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setSortBy("FEATURED");
  };

  /* =========================================================
     LOADING STATE
     ========================================================= */

  if (loading) {
    return (
      <main className="cards-page">
        <section className="cards-loading-section">
          <div className="cards-message">
            <div className="premium-loader" aria-hidden="true">
              <span />
            </div>

            <span className="message-eyebrow">CARDWISE</span>

            <h3>Loading your card collection</h3>

            <p>Fetching the latest credit cards and application status.</p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     ERROR STATE
     ========================================================= */

  if (error) {
    return (
      <main className="cards-page">
        <section className="cards-loading-section">
          <div className="cards-message">
            <div className="message-icon error-icon" aria-hidden="true">
              !
            </div>

            <span className="message-eyebrow">TEMPORARY ISSUE</span>

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
      </main>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <main className="cards-page">
      {/* =====================================================
          TOAST
          ===================================================== */}

      {notification.show && (
        <div
          className={`cardwise-toast cardwise-toast-${notification.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast-icon" aria-hidden="true">
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

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="cards-hero">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />

        <div className="hero-orb hero-orb-two" aria-hidden="true" />

        <div className="hero-grid" aria-hidden="true" />

        <div className="cards-hero-inner">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              CARDWISE CREDIT MARKETPLACE
            </div>

            <h1>
              Choose a card that
              <span> works for you.</span>
            </h1>

            <p>
              Compare annual fees, cashback, rewards and benefits across the
              CardWise collection before you apply.
            </p>

            <div className="hero-actions">
              <a href="#available-cards" className="hero-primary">
                Explore Cards
                <span aria-hidden="true">↓</span>
              </a>

              <Link to="/compare" className="hero-secondary">
                Compare Cards
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hero-trust-row">
              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true">
                  ✓
                </span>

                <span>Transparent fees</span>
              </div>

              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true">
                  ✓
                </span>

                <span>Secure applications</span>
              </div>

              <div className="trust-item">
                <span className="trust-icon" aria-hidden="true">
                  ✓
                </span>

                <span>Easy comparison</span>
              </div>
            </div>
          </div>

          {/* =================================================
              HERO CARD SHOWCASE
              ================================================= */}

          <div className="hero-showcase">
            <div className="showcase-glow" aria-hidden="true" />

            <div className="showcase-card">
              <div className="showcase-card-top">
                <div className="showcase-logo">C</div>

                <span>CardWise</span>
              </div>

              <div className="showcase-chip" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>

              <div className="showcase-number">
                4532&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;7821
              </div>

              <div className="showcase-bottom">
                <div>
                  <small>CARD HOLDER</small>

                  <strong>CARDWISE MEMBER</strong>
                </div>

                <div>
                  <small>VALID THRU</small>

                  <strong>12/29</strong>
                </div>
              </div>
            </div>

            <div className="showcase-floating showcase-cashback">
              <span>Top cashback</span>

              <strong>5.5%</strong>
            </div>

            <div className="showcase-floating showcase-secure">
              <span className="secure-check" aria-hidden="true">
                ✓
              </span>

              <div>
                <strong>Secure</strong>

                <small>Protected account</small>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            HERO METRICS
            =================================================== */}

        <div className="hero-metrics">
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

            <span>Secure Platform</span>
          </div>

          <div>
            <strong>24/7</strong>

            <span>Online Access</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          CARD COLLECTION
          ===================================================== */}

      <section className="cards-section" id="available-cards">
        <div className="cards-container">
          <div className="section-intro">
            <div>
              <span className="section-eyebrow">FIND YOUR MATCH</span>

              <h2>Explore Credit Cards</h2>

              <p>
                Compare the details that matter before choosing your next card.
              </p>
            </div>

            <div className="result-pill">
              <span>{filteredCards.length}</span>

              {filteredCards.length === 1 ? " card" : " cards"}
            </div>
          </div>

          {/* =================================================
              TOOLBAR
              ================================================= */}

          <div className="card-toolbar">
            <div className="search-box">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search cards, banks or rewards..."
                aria-label="Search credit cards"
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="toolbar-controls">
              <label>
                <span>Card Type</span>

                <select
                  value={filterType}
                  onChange={(event) => setFilterType(event.target.value)}
                >
                  {cardTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "ALL" ? "All Cards" : type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sort By</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="FEATURED">Featured</option>

                  <option value="CASHBACK">Highest Cashback</option>

                  <option value="LOW_FEE">Lowest Annual Fee</option>

                  <option value="NAME">Name A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {/* =================================================
              EMPTY STATES
              ================================================= */}

          {cards.length === 0 ? (
            <div className="cards-message">
              <div className="message-icon" aria-hidden="true">
                ▣
              </div>

              <span className="message-eyebrow">CARDWISE COLLECTION</span>

              <h3>No Credit Cards Available</h3>

              <p>
                There are currently no credit cards available in the CardWise
                database.
              </p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="cards-message">
              <div className="message-icon" aria-hidden="true">
                ⌕
              </div>

              <span className="message-eyebrow">NO MATCHES</span>

              <h3>No cards match your search</h3>

              <p>Try another bank, card name, reward or card type.</p>

              <button
                type="button"
                className="primary-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* =================================================
               CREDIT CARD GRID
               ================================================= */

            <div className="credit-cards-grid">
              {filteredCards.map((card, index) => {
                const status = applicationStatusByCard[card.id]?.toUpperCase();

                return (
                  <article
                    className={`credit-card-item ${
                      index === 0 ? "featured-card" : ""
                    }`}
                    key={card.id}
                  >
                    {/* ======================================
                          CARD VISUAL
                          ====================================== */}

                    <div className="card-visual">
                      <div className="card-shine" aria-hidden="true" />

                      {index === 0 && (
                        <span className="featured-label">FEATURED</span>
                      )}

                      <div className="card-visual-top">
                        <div className="bank-logo">
                          {card.bank?.charAt(0)?.toUpperCase() || "C"}
                        </div>

                        <span className="card-brand">CARDWISE</span>
                      </div>

                      <div className="card-chip" aria-hidden="true">
                        <span />
                      </div>

                      <div className="card-number">
                        4532&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;7821
                      </div>

                      <div className="card-visual-bottom">
                        <div>
                          <small>CARD HOLDER</small>

                          <strong>CARDWISE MEMBER</strong>
                        </div>

                        <div>
                          <small>VALID THRU</small>

                          <strong>12/29</strong>
                        </div>
                      </div>

                      <span className="card-network">VISA</span>
                    </div>

                    {/* ======================================
                          CARD CONTENT
                          ====================================== */}

                    <div className="credit-card-content">
                      <div className="card-title-row">
                        <div>
                          <span className="bank-label">
                            {card.bank || "CardWise Partner"}
                          </span>

                          <h3>{card.name}</h3>
                        </div>

                        <span className="card-type">
                          {card.cardType || "Credit Card"}
                        </span>
                      </div>

                      {status && (
                        <div
                          className={`application-status ${getApplicationStatusClass(
                            card.id,
                          )}`}
                        >
                          <span
                            className="application-status-dot"
                            aria-hidden="true"
                          />

                          <span>{getApplicationStatusLabel(card.id)}</span>
                        </div>
                      )}

                      <div className="card-highlight-grid">
                        <div className="highlight-item cashback-highlight">
                          <span>Cashback</span>

                          <strong>{card.cashbackPercentage ?? 0}%</strong>
                        </div>

                        <div className="highlight-item">
                          <span>Reward Type</span>

                          <strong>{card.rewardType || "Rewards"}</strong>
                        </div>
                      </div>

                      <div className="card-details">
                        <div className="detail-item">
                          <span>Annual Fee</span>

                          <strong>{formatCurrency(card.annualFee)}</strong>
                        </div>

                        <div className="detail-item">
                          <span>Joining Fee</span>

                          <strong>{formatCurrency(card.joiningFee)}</strong>
                        </div>

                        <div className="detail-item">
                          <span>Card Type</span>

                          <strong>{card.cardType || "Standard"}</strong>
                        </div>
                      </div>

                      <div className="info-box">
                        <div className="info-heading">
                          <span className="info-icon" aria-hidden="true">
                            ✓
                          </span>

                          <h4>Eligibility</h4>
                        </div>

                        <p>
                          {card.eligibility ||
                            "Eligibility information is currently unavailable."}
                        </p>
                      </div>

                      <div className="info-box">
                        <div className="info-heading">
                          <span className="info-icon" aria-hidden="true">
                            ✦
                          </span>

                          <h4>Key Benefits</h4>
                        </div>

                        <p>
                          {card.benefits ||
                            "Benefits information is currently unavailable."}
                        </p>
                      </div>

                      {/* ====================================
                            CARD ACTIONS
                            ==================================== */}

                      <div className="card-actions">
                        <Link
                          to={`/cards/${card.id}`}
                          className="details-button"
                        >
                          View Details
                          <span aria-hidden="true">→</span>
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

                      <Link to="/compare" className="compare-card-button">
                        <span aria-hidden="true">⇄</span>
                        Compare this card
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}

      <section className="cards-contact-cta">
        <div className="cta-glow" aria-hidden="true" />

        <div className="cta-content">
          <span className="section-eyebrow">NEED SOME HELP?</span>

          <h2>Not sure which card fits you?</h2>

          <p>
            Compare your options side by side or contact the CardWise team for
            help understanding card benefits, eligibility and applications.
          </p>

          <div className="cta-actions">
            <Link to="/compare" className="cta-primary">
              Compare Cards →
            </Link>

            <Link to="/contact" className="cta-secondary">
              Contact CardWise
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Cards;
