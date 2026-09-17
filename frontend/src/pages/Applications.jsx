import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import "./Applications.css";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          setError("Please login to view your applications.");
          setApplications([]);
          return;
        }

        let user;

        try {
          user = JSON.parse(savedUser);
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("token");

          setError("Your login session is invalid. Please login again.");
          setApplications([]);
          return;
        }

        if (!user?.id) {
          setError("User information is missing. Please login again.");
          setApplications([]);
          return;
        }

        const response = await api.get(`/applications/user/${user.id}`);

        const responseData = response.data;

        const data = Array.isArray(responseData)
          ? responseData
          : responseData
            ? [responseData]
            : [];

        const sortedApplications = [...data].sort(
          (a, b) =>
            new Date(b?.appliedAt || 0).getTime() -
            new Date(a?.appliedAt || 0).getTime(),
        );

        setApplications(sortedApplications);
      } catch (err) {
        console.error("Applications error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
            state: {
              from: "/applications",
            },
          });

          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load your applications.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const summary = useMemo(() => {
    return applications.reduce(
      (counts, application) => {
        const status = String(application?.status || "PENDING").toUpperCase();

        counts.total += 1;

        if (status === "APPROVED") {
          counts.approved += 1;
        } else if (status === "REJECTED") {
          counts.rejected += 1;
        } else {
          counts.pending += 1;
        }

        return counts;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    );
  }, [applications]);

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "approved";

      case "REJECTED":
        return "rejected";

      default:
        return "pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "✓";

      case "REJECTED":
        return "×";

      default:
        return "⏳";
    }
  };

  const getStatusText = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "Application Approved";

      case "REJECTED":
        return "Application Rejected";

      default:
        return "Application Under Review";
    }
  };

  const getStatusDescription = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "Congratulations! Your credit card application has been approved.";

      case "REJECTED":
        return "Unfortunately, your application was not approved at this time.";

      default:
        return "Your application has been received and is currently being reviewed by our team.";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBankInitial = (bank) => {
    return (
      String(bank || "CardWise")
        .trim()
        .charAt(0)
        .toUpperCase() || "C"
    );
  };

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-loading">
          <div className="applications-loader" aria-hidden="true"></div>

          <h2>Loading Applications...</h2>

          <p>Fetching your CardWise application history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="applications-hero">
        <div className="applications-hero-content">
          <div className="applications-hero-copy">
            <span className="applications-eyebrow">CARDWISE ACCOUNT</span>

            <h1>My Applications</h1>

            <p>
              Track the status of your credit card applications and stay updated
              on every decision.
            </p>
          </div>

          <div className="applications-hero-icon" aria-hidden="true">
            📋
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="applications-section">
        <div className="applications-container">
          {/* ERROR */}

          {error && (
            <div className="applications-error" role="alert">
              <span aria-hidden="true">!</span>

              <div>
                <strong>Unable to load applications</strong>

                <p>{error}</p>

                <button
                  type="button"
                  className="applications-retry"
                  onClick={() => loadApplications()}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!error && (
            <>
              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="applications-summary">
                <div className="summary-card">
                  <div className="summary-icon total" aria-hidden="true">
                    📋
                  </div>

                  <div>
                    <span>Total Applications</span>
                    <strong>{summary.total}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon pending" aria-hidden="true">
                    ⏳
                  </div>

                  <div>
                    <span>Pending</span>
                    <strong>{summary.pending}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon approved" aria-hidden="true">
                    ✓
                  </div>

                  <div>
                    <span>Approved</span>
                    <strong>{summary.approved}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon rejected" aria-hidden="true">
                    ×
                  </div>

                  <div>
                    <span>Rejected</span>
                    <strong>{summary.rejected}</strong>
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
                  type="button"
                  className="refresh-applications"
                  onClick={() => loadApplications(true)}
                  disabled={refreshing}
                >
                  <span
                    className={refreshing ? "is-refreshing" : ""}
                    aria-hidden="true"
                  >
                    ↻
                  </span>

                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {applications.length === 0 ? (
                <div className="applications-empty">
                  <div className="empty-icon" aria-hidden="true">
                    💳
                  </div>

                  <span className="empty-eyebrow">CARDWISE APPLICATIONS</span>

                  <h2>No Applications Yet</h2>

                  <p>
                    You haven't applied for any credit cards yet. Explore
                    available cards and find the right one for you.
                  </p>

                  <Link to="/cards">
                    Explore Credit Cards
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                /* =================================================
                    APPLICATION LIST
                ================================================= */

                <div className="applications-list">
                  {applications.map((application) => {
                    const card = application?.creditCard || {};

                    const status = String(
                      application?.status || "PENDING",
                    ).toUpperCase();

                    const statusClass = getStatusClass(status);

                    const bankInitial = getBankInitial(card.bank);

                    return (
                      <article
                        className={`application-card ${statusClass}`}
                        key={
                          application.id ||
                          `${card.id}-${application.appliedAt}`
                        }
                      >
                        {/* =================================================
                            TOP
                        ================================================= */}

                        <div className="application-card-top">
                          <div className="application-card-title">
                            <div
                              className="application-card-icon"
                              aria-hidden="true"
                            >
                              {bankInitial}
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
                            <span aria-hidden="true">
                              {getStatusIcon(status)}
                            </span>

                            {status}
                          </div>
                        </div>

                        {/* =================================================
                            CARD VISUAL
                        ================================================= */}

                        <div
                          className={`application-credit-card ${statusClass}`}
                        >
                          <div className="application-card-brand">
                            <div
                              className="application-bank-circle"
                              aria-hidden="true"
                            >
                              {bankInitial}
                            </div>

                            <span>{card.bank || "CardWise"}</span>
                          </div>

                          <div className="application-chip" aria-hidden="true">
                            <span></span>
                          </div>

                          <div className="application-card-number">
                            •••• &nbsp; •••• &nbsp; •••• &nbsp;
                            {String(application.id || 0).padStart(4, "0")}
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

                          <div
                            className="application-card-logo"
                            aria-hidden="true"
                          >
                            CW
                          </div>
                        </div>

                        {/* =================================================
                            STATUS MESSAGE
                        ================================================= */}

                        <div
                          className={`application-status-message ${statusClass}`}
                        >
                          <div aria-hidden="true">{getStatusIcon(status)}</div>

                          <div>
                            <strong>{getStatusText(status)}</strong>

                            <p>{getStatusDescription(status)}</p>
                          </div>
                        </div>

                        {/* =================================================
                            DETAILS
                        ================================================= */}

                        <div className="application-details">
                          <div>
                            <span>APPLICATION ID</span>

                            <strong>#{application.id || "N/A"}</strong>
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

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="applications-security-note">
            <span aria-hidden="true">🔒</span>

            <div>
              <strong>Your application information is secure</strong>

              <p>
                CardWise uses secure authentication to protect your account and
                application information.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Applications;
