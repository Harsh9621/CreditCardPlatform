import { useEffect, useState } from "react";
import api from "../services/api";
import "./Applications.css";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setError("Please login to view your applications.");
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user?.id) {
        setError("User information is missing. Please login again.");
        return;
      }

      const response = await api.get(`/applications/user/${user.id}`);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      // Latest applications first
      data.sort(
        (a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0),
      );

      setApplications(data);
    } catch (err) {
      console.error("Applications error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load your applications.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "approved";

      case "REJECTED":
        return "rejected";

      default:
        return "pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "✓";

      case "REJECTED":
        return "×";

      default:
        return "⏳";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "Application Approved";

      case "REJECTED":
        return "Application Rejected";

      default:
        return "Application Under Review";
    }
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-loading">
          <div className="applications-loader"></div>

          <h2>Loading Applications...</h2>

          <p>Fetching your CardWise application history.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="applications-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="applications-hero">
        <div className="applications-hero-content">
          <div>
            <span className="applications-eyebrow">CARDWISE ACCOUNT</span>

            <h1>My Applications</h1>

            <p>
              Track the status of your credit card applications and stay updated
              on every decision.
            </p>
          </div>

          <div className="applications-hero-icon">📋</div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="applications-section">
        <div className="applications-container">
          {/* ERROR */}

          {error && (
            <div className="applications-error">
              <span>!</span>

              <div>
                <strong>Unable to load applications</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          {!error && (
            <>
              <div className="applications-summary">
                <div className="summary-card">
                  <div className="summary-icon total">📋</div>

                  <div>
                    <span>Total Applications</span>
                    <strong>{applications.length}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon pending">⏳</div>

                  <div>
                    <span>Pending</span>

                    <strong>
                      {
                        applications.filter(
                          (app) => app.status?.toUpperCase() === "PENDING",
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon approved">✓</div>

                  <div>
                    <span>Approved</span>

                    <strong>
                      {
                        applications.filter(
                          (app) => app.status?.toUpperCase() === "APPROVED",
                        ).length
                      }
                    </strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon rejected">×</div>

                  <div>
                    <span>Rejected</span>

                    <strong>
                      {
                        applications.filter(
                          (app) => app.status?.toUpperCase() === "REJECTED",
                        ).length
                      }
                    </strong>
                  </div>
                </div>
              </div>

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="applications-heading">
                <div>
                  <span>APPLICATION HISTORY</span>

                  <h2>Your Credit Card Applications</h2>

                  <p>Your most recent application appears first.</p>
                </div>

                <button
                  className="refresh-applications"
                  onClick={loadApplications}
                >
                  ↻ Refresh
                </button>
              </div>

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {applications.length === 0 ? (
                <div className="applications-empty">
                  <div className="empty-icon">💳</div>

                  <h2>No Applications Yet</h2>

                  <p>
                    You haven't applied for any credit cards yet. Explore
                    available cards and find the right one for you.
                  </p>

                  <a href="/cards">Explore Credit Cards →</a>
                </div>
              ) : (
                /* =================================================
                    APPLICATION CARDS
                ================================================= */

                <div className="applications-list">
                  {applications.map((application) => {
                    const card = application.creditCard || {};

                    const status =
                      application.status?.toUpperCase() || "PENDING";

                    const statusClass = getStatusClass(status);

                    return (
                      <article
                        className={`application-card ${statusClass}`}
                        key={application.id}
                      >
                        {/* TOP */}

                        <div className="application-card-top">
                          <div className="application-card-title">
                            <div className="application-card-icon">
                              {card.bank?.charAt(0) || "C"}
                            </div>

                            <div>
                              <span>CREDIT CARD</span>

                              <h3>{card.name || "Credit Card"}</h3>

                              <p>
                                {card.bank || "Bank information unavailable"}
                              </p>
                            </div>
                          </div>

                          <div className={`application-status ${statusClass}`}>
                            <span>{getStatusIcon(status)}</span>

                            {status}
                          </div>
                        </div>

                        {/* CARD VISUAL */}

                        <div
                          className={`application-credit-card ${statusClass}`}
                        >
                          <div className="application-card-brand">
                            <div className="application-bank-circle">
                              {card.bank?.charAt(0) || "C"}
                            </div>

                            <span>{card.bank || "CardWise"}</span>
                          </div>

                          <div className="application-chip">
                            <span></span>
                          </div>

                          <div className="application-card-number">
                            •••• &nbsp; •••• &nbsp; •••• &nbsp;{" "}
                            {String(application.id).padStart(4, "0")}
                          </div>

                          <div className="application-card-bottom">
                            <div>
                              <small>CARD TYPE</small>

                              <strong>{card.cardType || "CREDIT"}</strong>
                            </div>

                            <div>
                              <small>REWARD</small>

                              <strong>{card.rewardType || "REWARDS"}</strong>
                            </div>
                          </div>

                          <div className="application-card-logo">CW</div>
                        </div>

                        {/* STATUS MESSAGE */}

                        <div
                          className={`application-status-message ${statusClass}`}
                        >
                          <div>{getStatusIcon(status)}</div>

                          <div>
                            <strong>{getStatusText(status)}</strong>

                            <p>
                              {status === "APPROVED"
                                ? "Congratulations! Your credit card application has been approved."
                                : status === "REJECTED"
                                  ? "Unfortunately, your application was not approved at this time."
                                  : "Your application has been received and is currently being reviewed by our team."}
                            </p>
                          </div>
                        </div>

                        {/* DETAILS */}

                        <div className="application-details">
                          <div>
                            <span>APPLICATION ID</span>

                            <strong>#{application.id}</strong>
                          </div>

                          <div>
                            <span>APPLIED ON</span>

                            <strong>{formatDate(application.appliedAt)}</strong>

                            <small>{formatTime(application.appliedAt)}</small>
                          </div>

                          <div>
                            <span>CARD TYPE</span>

                            <strong>{card.cardType || "N/A"}</strong>
                          </div>

                          <div>
                            <span>CASHBACK</span>

                            <strong>{card.cashbackPercentage ?? 0}%</strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Applications;
