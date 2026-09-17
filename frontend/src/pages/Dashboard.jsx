import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./Dashboard.css";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated || !token || !user?.id) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("CardWise: loading applications for user:", user.id);

      const response = await api.get(`/applications/user/${user.id}`);

      const data = Array.isArray(response.data) ? response.data : [];

      console.log("CardWise: applications loaded:", data);

      setApplications(data);
    } catch (err) {
      console.error("CardWise dashboard request failed:", err);

      setApplications([]);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view these applications.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "We couldn't load your applications right now.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, isAuthenticated]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    applications.forEach((application) => {
      const status = String(application?.status || "").toUpperCase();

      if (status === "PENDING") {
        pending += 1;
      } else if (status === "APPROVED") {
        approved += 1;
      } else if (status === "REJECTED") {
        rejected += 1;
      }
    });

    return {
      total: applications.length,
      pending,
      approved,
      rejected,
    };
  }, [applications]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getApplicationId = (application) =>
    application?.id || application?.applicationId || null;

  const getCardName = (application) =>
    application?.card?.name ||
    application?.creditCard?.name ||
    application?.cardName ||
    "Credit Card Application";

  const getStatus = (application) =>
    String(application?.status || "PENDING").toUpperCase();

  const getStatusClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "APPROVED":
        return "approved";

      case "REJECTED":
        return "rejected";

      case "PENDING":
        return "pending";

      default:
        return "default";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="dashboard-loading-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" aria-hidden="true" />

          <h2>Loading your dashboard...</h2>

          <p>Please wait while we retrieve your latest account information.</p>
        </div>
      </main>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="dashboard-page">
      {/* =================================================
          HERO
      ================================================== */}

      <section className="dashboard-hero">
        <div className="dashboard-hero-background" aria-hidden="true">
          <div className="dashboard-hero-grid" />
          <div className="dashboard-hero-glow dashboard-glow-one" />
          <div className="dashboard-hero-glow dashboard-glow-two" />
        </div>

        <div className="dashboard-container dashboard-hero-content">
          <div className="dashboard-hero-copy">
            <span className="dashboard-label">CARDWISE CUSTOMER PORTAL</span>

            <h1>
              Welcome back,
              <strong>{user?.name || "Customer"}</strong>
            </h1>

            <p>
              Manage your credit cards, applications, and account information
              from one secure place.
            </p>

            <div className="dashboard-hero-meta">
              <span className="dashboard-hero-status">
                <span className="dashboard-status-pulse" aria-hidden="true" />
                Account Active
              </span>

              <span className="dashboard-hero-divider" />

              <span>{user?.email || "CardWise Customer"}</span>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/cards" className="dashboard-hero-btn">
              Explore Cards
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/profile" className="dashboard-hero-link">
              View Profile
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="dashboard-container">
          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="dashboard-error" role="alert" aria-live="polite">
              <div className="dashboard-error-icon" aria-hidden="true">
                !
              </div>

              <div className="dashboard-error-content">
                <strong>Unable to load applications</strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                className="dashboard-retry-btn"
                onClick={loadDashboard}
                disabled={loading}
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================== */}

          <section
            className="dashboard-stats"
            aria-label="Application statistics"
          >
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <span aria-hidden="true">▣</span>
              </div>

              <div className="dashboard-stat-content">
                <span>Total Applications</span>

                <strong>{statistics.total}</strong>

                <small>All submitted applications</small>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon pending-icon">
                <span aria-hidden="true">◷</span>
              </div>

              <div className="dashboard-stat-content">
                <span>Pending Applications</span>

                <strong>{statistics.pending}</strong>

                <small>Awaiting review</small>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon approved-icon">
                <span aria-hidden="true">✓</span>
              </div>

              <div className="dashboard-stat-content">
                <span>Approved Applications</span>

                <strong>{statistics.approved}</strong>

                <small>Successfully approved</small>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon rejected-icon">
                <span aria-hidden="true">×</span>
              </div>

              <div className="dashboard-stat-content">
                <span>Rejected Applications</span>

                <strong>{statistics.rejected}</strong>

                <small>Applications not approved</small>
              </div>
            </div>
          </section>

          {/* =================================================
              WELCOME / CARDWISE FEATURE
          ================================================== */}

          <section className="dashboard-welcome-card">
            <div className="dashboard-welcome-content">
              <span className="dashboard-section-label">CARDWISE</span>

              <h2>Find the right credit card for you</h2>

              <p>
                Explore available credit cards, compare benefits, and choose an
                option that fits your financial needs.
              </p>

              <div className="dashboard-actions">
                <Link to="/cards" className="dashboard-primary-btn">
                  Explore Cards
                  <span aria-hidden="true">→</span>
                </Link>

                <Link to="/compare" className="dashboard-secondary-btn">
                  Compare Cards
                </Link>
              </div>
            </div>

            <div className="dashboard-card-visual" aria-hidden="true">
              <div className="dashboard-credit-card">
                <div className="dashboard-card-glow" />

                <div className="dashboard-card-top">
                  <span className="dashboard-card-brand">CARDWISE</span>

                  <span className="dashboard-card-network">VISA</span>
                </div>

                <div className="dashboard-chip">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dashboard-card-number">
                  •••• &nbsp; •••• &nbsp; •••• &nbsp; 2026
                </div>

                <div className="dashboard-card-bottom">
                  <div>
                    <small>CARD MEMBER</small>

                    <strong>CARDWISE CUSTOMER</strong>
                  </div>

                  <div>
                    <small>VALID THRU</small>

                    <strong>12/30</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK ACCESS
          ================================================== */}

          <section className="dashboard-quick-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-label">QUICK ACCESS</span>

                <h2>Manage Your Account</h2>

                <p>Everything you need is just one click away.</p>
              </div>
            </div>

            <div className="dashboard-quick-grid">
              <Link to="/cards" className="dashboard-quick-card">
                <div className="quick-icon">
                  <span aria-hidden="true">▣</span>
                </div>

                <div className="quick-card-content">
                  <h3>Credit Cards</h3>

                  <p>Browse and compare available CardWise credit cards.</p>

                  <span className="quick-card-link">
                    View Cards
                    <b aria-hidden="true">→</b>
                  </span>
                </div>
              </Link>

              <Link to="/applications" className="dashboard-quick-card">
                <div className="quick-icon">
                  <span aria-hidden="true">☷</span>
                </div>

                <div className="quick-card-content">
                  <h3>Applications</h3>

                  <p>Track the status of your credit card applications.</p>

                  <span className="quick-card-link">
                    View Applications
                    <b aria-hidden="true">→</b>
                  </span>
                </div>
              </Link>

              <Link to="/profile" className="dashboard-quick-card">
                <div className="quick-icon">
                  <span aria-hidden="true">◉</span>
                </div>

                <div className="quick-card-content">
                  <h3>My Profile</h3>

                  <p>View and update your personal account information.</p>

                  <span className="quick-card-link">
                    View Profile
                    <b aria-hidden="true">→</b>
                  </span>
                </div>
              </Link>

              <Link to="/contact" className="dashboard-quick-card">
                <div className="quick-icon">
                  <span aria-hidden="true">✉</span>
                </div>

                <div className="quick-card-content">
                  <h3>Contact Support</h3>

                  <p>Need help? Contact the CardWise support team.</p>

                  <span className="quick-card-link">
                    Contact Us
                    <b aria-hidden="true">→</b>
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* =================================================
              RECENT APPLICATIONS
          ================================================== */}

          <section className="dashboard-applications">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-label">RECENT ACTIVITY</span>

                <h2>Recent Applications</h2>

                <p>Keep track of your latest credit card applications.</p>
              </div>

              {applications.length > 0 && (
                <Link to="/applications" className="dashboard-view-all">
                  View All
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>

            {applications.length > 0 ? (
              <div className="dashboard-application-list">
                {applications.slice(0, 5).map((application, index) => {
                  const applicationId = getApplicationId(application);

                  const cardName = getCardName(application);

                  const status = getStatus(application);

                  const statusClass = getStatusClass(status);

                  return (
                    <div
                      className="dashboard-application-row"
                      key={applicationId || `application-${index}`}
                    >
                      <div className="dashboard-application-info">
                        <div className="application-icon">
                          <span aria-hidden="true">▣</span>
                        </div>

                        <div>
                          <strong>Application #{applicationId || "N/A"}</strong>

                          <span>{cardName}</span>
                        </div>
                      </div>

                      <span
                        className={`dashboard-application-status ${statusClass}`}
                      >
                        <span className="status-dot" aria-hidden="true" />

                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon" aria-hidden="true">
                  ▣
                </div>

                <h3>No applications yet</h3>

                <p>
                  You haven't submitted a credit card application yet. Explore
                  our cards and find one that's right for you.
                </p>

                <Link to="/cards" className="dashboard-empty-btn">
                  Explore Credit Cards
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
