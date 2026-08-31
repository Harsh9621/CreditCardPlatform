import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./AdminApplications.css";

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/applications");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      setApplications(data);
    } catch (err) {
      console.error("Applications error:", err);

      const status = err.response?.status;

      if (status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (status === 403) {
        setError(
          "Access denied. Only an administrator can manage applications."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load applications. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadApplications();
  }, []);

  // =====================================================
  // SORT APPLICATIONS
  // =====================================================

  const sortedApplications = useMemo(() => {
    const priority = {
      PENDING: 1,
      APPROVED: 2,
      REJECTED: 3,
    };

    return [...applications].sort((a, b) => {
      const statusA = priority[a.status?.toUpperCase()] || 99;
      const statusB = priority[b.status?.toUpperCase()] || 99;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      const dateA = a.appliedAt
        ? new Date(a.appliedAt).getTime()
        : 0;

      const dateB = b.appliedAt
        ? new Date(b.appliedAt).getTime()
        : 0;

      return dateB - dateA;
    });
  }, [applications]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredApplications = useMemo(() => {
    if (filter === "ALL") {
      return sortedApplications;
    }

    return sortedApplications.filter(
      (application) =>
        application.status?.toUpperCase() === filter
    );
  }, [sortedApplications, filter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const pendingCount = applications.filter(
    (application) =>
      application.status?.toUpperCase() === "PENDING"
  ).length;

  const approvedCount = applications.filter(
    (application) =>
      application.status?.toUpperCase() === "APPROVED"
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      application.status?.toUpperCase() === "REJECTED"
  ).length;

  // =====================================================
  // APPROVE APPLICATION
  // =====================================================

  const approveApplication = async (id) => {
    try {
      setActionId(id);
      setMessage("");
      setError("");

      await api.put(`/admin/applications/${id}/approve`);

      setMessage(
        `Application #${id} has been approved successfully.`
      );

      await loadApplications();
    } catch (err) {
      console.error("Approve error:", err);

      const status = err.response?.status;

      if (status === 403) {
        setError(
          "Access denied. Only an administrator can approve applications."
        );
      } else if (status === 409) {
        setError(
          err.response?.data?.message ||
            "This application cannot be approved."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to approve application."
        );
      }
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // REJECT APPLICATION
  // =====================================================

  const rejectApplication = async (id) => {
    try {
      setActionId(id);
      setMessage("");
      setError("");

      await api.put(`/admin/applications/${id}/reject`);

      setMessage(
        `Application #${id} has been rejected successfully.`
      );

      await loadApplications();
    } catch (err) {
      console.error("Reject error:", err);

      const status = err.response?.status;

      if (status === 403) {
        setError(
          "Access denied. Only an administrator can reject applications."
        );
      } else if (status === 409) {
        setError(
          err.response?.data?.message ||
            "This application cannot be rejected."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to reject application."
        );
      }
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const statusClass = (status) => {
    const value = status?.toUpperCase();

    if (value === "APPROVED") {
      return "approved";
    }

    if (value === "REJECTED") {
      return "rejected";
    }

    return "pending";
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

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
      <div className="admin-applications-page">
        <div className="admin-applications-loading">
          <div className="admin-applications-loader"></div>

          <h2>Loading Applications</h2>

          <p>
            Fetching the latest CardWise applications...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-applications-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="admin-applications-hero">
        <div className="admin-applications-hero-content">

          <div className="admin-hero-badge">
            <span>●</span>
            CARDWISE ADMINISTRATION
          </div>

          <h1>
            Application
            <span> Management</span>
          </h1>

          <p>
            Review, approve and manage customer credit card
            applications from one secure dashboard.
          </p>

        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="admin-applications-section">
        <div className="admin-applications-container">

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="admin-alert admin-alert-success">

              <div className="admin-alert-icon">
                ✓
              </div>

              <div>
                <strong>Action Completed</strong>
                <p>{message}</p>
              </div>

              <button
                onClick={() => setMessage("")}
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="admin-alert admin-alert-error">

              <div className="admin-alert-icon">
                !
              </div>

              <div>
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>

              <button
                onClick={() => setError("")}
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="admin-stats-grid">

            <div
              className={`admin-stat-card ${
                filter === "ALL" ? "active" : ""
              }`}
              onClick={() => setFilter("ALL")}
            >
              <div className="admin-stat-icon all">
                📋
              </div>

              <div>
                <span>Total Applications</span>
                <strong>
                  {applications.length}
                </strong>
              </div>
            </div>

            <div
              className={`admin-stat-card pending-stat ${
                filter === "PENDING" ? "active" : ""
              }`}
              onClick={() => setFilter("PENDING")}
            >
              <div className="admin-stat-icon pending">
                ⏳
              </div>

              <div>
                <span>Pending Review</span>
                <strong>
                  {pendingCount}
                </strong>
              </div>
            </div>

            <div
              className={`admin-stat-card ${
                filter === "APPROVED" ? "active" : ""
              }`}
              onClick={() => setFilter("APPROVED")}
            >
              <div className="admin-stat-icon approved">
                ✓
              </div>

              <div>
                <span>Approved</span>
                <strong>
                  {approvedCount}
                </strong>
              </div>
            </div>

            <div
              className={`admin-stat-card ${
                filter === "REJECTED" ? "active" : ""
              }`}
              onClick={() => setFilter("REJECTED")}
            >
              <div className="admin-stat-icon rejected">
                ×
              </div>

              <div>
                <span>Rejected</span>
                <strong>
                  {rejectedCount}
                </strong>
              </div>
            </div>

          </div>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-applications-header">

            <div>

              <span className="admin-section-label">
                APPLICATION QUEUE
              </span>

              <h2>
                {filter === "ALL"
                  ? "Latest Applications"
                  : `${filter.charAt(0)}${filter
                      .slice(1)
                      .toLowerCase()} Applications`}
              </h2>

              <p>
                {filter === "ALL"
                  ? "Pending applications are shown first, followed by the latest processed applications."
                  : `Showing ${filter.toLowerCase()} applications.`}
              </p>

            </div>

            <button
              className="admin-refresh-button"
              onClick={loadApplications}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredApplications.length === 0 ? (

            <div className="admin-applications-empty">

              <div className="admin-empty-icon">
                📋
              </div>

              <h2>
                {filter === "ALL"
                  ? "No Applications Yet"
                  : `No ${filter.toLowerCase()} applications`}
              </h2>

              <p>
                {filter === "ALL"
                  ? "Customer applications will appear here when users apply for credit cards."
                  : "There are currently no applications with this status."}
              </p>

              {filter !== "ALL" && (
                <button
                  className="admin-view-all-button"
                  onClick={() => setFilter("ALL")}
                >
                  View All Applications
                </button>
              )}

            </div>

          ) : (

            /* =================================================
               APPLICATION LIST
            ================================================= */

            <div className="admin-applications-list">

              {filteredApplications.map(
                (application, index) => {

                  const card =
                    application.creditCard || {};

                  const user =
                    application.user || {};

                  const status =
                    application.status?.toUpperCase() ||
                    "PENDING";

                  const isPending =
                    status === "PENDING";

                  const isProcessing =
                    actionId === application.id;

                  return (
                    <article
                      className={`admin-application-card ${
                        isPending
                          ? "priority-application"
                          : ""
                      }`}
                      key={application.id}
                    >

                      {/* PRIORITY BADGE */}

                      {isPending &&
                        index === 0 && (
                          <div className="priority-badge">
                            <span>⚡</span>
                            NEEDS YOUR ATTENTION
                          </div>
                        )}

                      {/* =================================================
                          MAIN INFORMATION
                      ================================================= */}

                      <div className="admin-application-main">

                        {/* USER */}

                        <div className="admin-application-user">

                          <div className="admin-user-icon">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div className="admin-user-details">

                            <h3>
                              {user.name ||
                                "Unknown User"}
                            </h3>

                            <p>
                              {user.email ||
                                "No email available"}
                            </p>

                          </div>

                        </div>

                        {/* CARD */}

                        <div className="admin-application-card-info">

                          <span>
                            CREDIT CARD
                          </span>

                          <strong>
                            {card.name ||
                              "Unknown Card"}
                          </strong>

                          <p>
                            {card.bank ||
                              "Unknown Bank"}
                          </p>

                        </div>

                        {/* STATUS */}

                        <div className="admin-application-status">

                          <span>STATUS</span>

                          <strong
                            className={`admin-status ${statusClass(
                              status
                            )}`}
                          >
                            <i></i>
                            {status}
                          </strong>

                        </div>

                      </div>

                      {/* =================================================
                          DETAILS
                      ================================================= */}

                      <div className="admin-application-details">

                        <div>
                          <span>
                            APPLICATION ID
                          </span>

                          <strong>
                            #{application.id}
                          </strong>
                        </div>

                        <div>
                          <span>
                            APPLIED ON
                          </span>

                          <strong>
                            {formatDate(
                              application.appliedAt
                            )}
                          </strong>

                          <small>
                            {formatTime(
                              application.appliedAt
                            )}
                          </small>
                        </div>

                        <div>
                          <span>
                            CARD TYPE
                          </span>

                          <strong>
                            {card.cardType || "N/A"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            CASHBACK
                          </span>

                          <strong>
                            {card.cashbackPercentage ??
                              0}
                            %
                          </strong>
                        </div>

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      {isPending ? (

                        <div className="admin-application-actions">

                          <button
                            className="approve-button"
                            onClick={() =>
                              approveApplication(
                                application.id
                              )
                            }
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <span className="button-spinner"></span>
                                Processing...
                              </>
                            ) : (
                              <>✓ Approve Application</>
                            )}
                          </button>

                          <button
                            className="reject-button"
                            onClick={() =>
                              rejectApplication(
                                application.id
                              )
                            }
                            disabled={isProcessing}
                          >
                            {isProcessing
                              ? "Processing..."
                              : <>✕ Reject</>}
                          </button>

                        </div>

                      ) : (

                        <div
                          className={`processed-label ${statusClass(
                            status
                          )}`}
                        >
                          {status === "APPROVED"
                            ? "✓ Application approved"
                            : "✕ Application rejected"}
                        </div>

                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </div>
      </section>
    </div>
  );
}

export default AdminApplications;