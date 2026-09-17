import { useEffect, useMemo, useState } from "react";
import "./AdminUsers.css";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationActionLoading, setApplicationActionLoading] =
    useState(false);

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      setError("");

      if (users.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/admin/users");

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Unable to load users:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load users. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // LOAD USER APPLICATIONS
  // =====================================================

  const loadApplications = async (userId) => {
    if (!userId) {
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError("");

      const response = await api.get(`/admin/applications/user/${userId}`);

      setApplications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Unable to load applications:", err);

      setApplications([]);
      setApplicationsError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load credit-card applications.",
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  // =====================================================
  // OPEN USER PROFILE
  // =====================================================

  const openUserProfile = (user) => {
    setSelectedUser(user);
    setSelectedApplication(null);
    setApplications([]);
    setApplicationsError("");

    loadApplications(user.id);
  };

  // =====================================================
  // CLOSE USER PROFILE
  // =====================================================

  const closeUserProfile = () => {
    setSelectedUser(null);
    setSelectedApplication(null);
    setApplications([]);
    setApplicationsError("");
  };

  // =====================================================
  // CHANGE USER STATUS
  // =====================================================

  const changeUserStatus = async (user) => {
    const isActive = Boolean(user.active);
    const action = isActive ? "block" : "unblock";

    const confirmed = window.confirm(
      isActive
        ? `Block ${user.name || "this user"}?`
        : `Unblock ${user.name || "this user"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.put(`/admin/users/${user.id}/${action}`);

      await loadUsers();

      setSelectedUser((current) => {
        if (!current || current.id !== user.id) {
          return current;
        }

        return {
          ...current,
          active: !isActive,
        };
      });
    } catch (err) {
      console.error("Unable to update user:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to update user status.",
      );
    }
  };

  // =====================================================
  // APPLICATION HELPERS
  // =====================================================

  const getCardName = (application) => {
    const card = application?.creditCard;

    if (!card) {
      return "Credit Card";
    }

    return (
      card.name ||
      card.cardName ||
      card.cardTitle ||
      card.title ||
      "Credit Card"
    );
  };

  const getCardBank = (application) => {
    return application?.creditCard?.bank || "Not provided";
  };

  const getCardType = (application) => {
    return (
      application?.creditCard?.cardType ||
      application?.creditCard?.type ||
      "Not provided"
    );
  };

  const formatApplicationDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getApplicationStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "APPROVED") {
      return "approved";
    }

    if (normalized === "REJECTED") {
      return "rejected";
    }

    return "pending";
  };

  // =====================================================
  // VIEW APPLICATION
  // =====================================================

  const viewApplication = async (application) => {
    try {
      setApplicationActionLoading(true);

      const response = await api.get(`/admin/applications/${application.id}`);

      setSelectedApplication(response.data);
    } catch (err) {
      console.error("Unable to load application:", err);

      setSelectedApplication(application);
    } finally {
      setApplicationActionLoading(false);
    }
  };

  // =====================================================
  // APPROVE APPLICATION
  // =====================================================

  const approveApplication = async (application) => {
    const confirmed = window.confirm(`Approve application #${application.id}?`);

    if (!confirmed) {
      return;
    }

    try {
      setApplicationActionLoading(true);
      setApplicationsError("");

      const response = await api.put(
        `/admin/applications/${application.id}/approve`,
      );

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? response.data : item,
        ),
      );

      setSelectedApplication((current) =>
        current && current.id === application.id ? response.data : current,
      );
    } catch (err) {
      console.error("Unable to approve application:", err);

      setApplicationsError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to approve application.",
      );
    } finally {
      setApplicationActionLoading(false);
    }
  };

  // =====================================================
  // REJECT APPLICATION
  // =====================================================

  const rejectApplication = async (application) => {
    const confirmed = window.confirm(`Reject application #${application.id}?`);

    if (!confirmed) {
      return;
    }

    try {
      setApplicationActionLoading(true);
      setApplicationsError("");

      const response = await api.put(
        `/admin/applications/${application.id}/reject`,
      );

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? response.data : item,
        ),
      );

      setSelectedApplication((current) =>
        current && current.id === application.id ? response.data : current,
      );
    } catch (err) {
      console.error("Unable to reject application:", err);

      setApplicationsError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to reject application.",
      );
    } finally {
      setApplicationActionLoading(false);
    }
  };

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.id || "").includes(query) ||
        String(user.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(query) ||
        String(user.city || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && Boolean(user.active)) ||
        (statusFilter === "BLOCKED" && !Boolean(user.active));

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="admin-users-spinner"></div>

        <h2>Loading Users</h2>

        <p>Fetching customer information...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-users-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="admin-users-hero">
        <div className="admin-users-hero-content">
          <span>CARDWISE ADMINISTRATION</span>

          <h1>
            User <strong>Management</strong>
          </h1>

          <p>
            View customer information, contact details, account status and
            manage platform access.
          </p>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-users-content">
        <div className="admin-users-container">
          {error && <div className="admin-users-error">{error}</div>}

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="admin-users-heading">
            <div>
              <span>CUSTOMER ACCOUNTS</span>

              <h2>Registered Users</h2>

              <p>
                Showing {filteredUsers.length} of {users.length} account
                {users.length !== 1 ? "s" : ""}.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              className="admin-users-refresh"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="admin-users-toolbar">
            <div className="admin-users-search">
              <span>⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, phone, city or ID..."
              />
            </div>

            <div className="admin-users-filter">
              <button
                type="button"
                className={statusFilter === "ALL" ? "selected" : ""}
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </button>

              <button
                type="button"
                className={statusFilter === "ACTIVE" ? "selected" : ""}
                onClick={() => setStatusFilter("ACTIVE")}
              >
                Active
              </button>

              <button
                type="button"
                className={statusFilter === "BLOCKED" ? "selected" : ""}
                onClick={() => setStatusFilter("BLOCKED")}
              >
                Blocked
              </button>
            </div>
          </div>

          {/* =================================================
              USERS
          ================================================= */}

          {filteredUsers.length === 0 ? (
            <div className="admin-users-empty">
              <div>👥</div>

              <h2>No Users Found</h2>

              <p>Try changing your search or filter.</p>
            </div>
          ) : (
            <div className="admin-users-list">
              {filteredUsers.map((user) => {
                const isActive = Boolean(user.active);

                return (
                  <article key={user.id} className="admin-user-card">
                    <div className="admin-user-header">
                      <div className="admin-user-avatar">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>

                      <div className="admin-user-heading-info">
                        <h3>{user.name || "Unknown User"}</h3>

                        <span>Customer ID #{user.id}</span>
                      </div>

                      <div
                        className={`admin-user-status ${
                          isActive ? "active" : "blocked"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "BLOCKED"}
                      </div>
                    </div>

                    <div className="admin-user-details">
                      <div>
                        <span>Email</span>

                        <strong>{user.email || "Not provided"}</strong>
                      </div>

                      <div>
                        <span>Phone</span>

                        <strong>{user.phone || "Not provided"}</strong>
                      </div>

                      <div>
                        <span>City</span>

                        <strong>{user.city || "Not provided"}</strong>
                      </div>

                      <div>
                        <span>Role</span>

                        <strong>{user.role || "USER"}</strong>
                      </div>
                    </div>

                    <div className="admin-user-actions">
                      <button
                        type="button"
                        className="view-user-btn"
                        onClick={() => openUserProfile(user)}
                      >
                        View Profile
                      </button>

                      <a
                        href={user.phone ? `tel:${user.phone}` : undefined}
                        className={
                          user.phone
                            ? "call-user-btn"
                            : "call-user-btn disabled"
                        }
                      >
                        ☎ Call User
                      </a>

                      <a
                        href={user.email ? `mailto:${user.email}` : undefined}
                        className="email-user-btn"
                      >
                        ✉ Email
                      </a>

                      <button
                        type="button"
                        className={
                          isActive ? "block-user-btn" : "unblock-user-btn"
                        }
                        onClick={() => changeUserStatus(user)}
                      >
                        {isActive ? "⊘ Block User" : "✓ Unblock User"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          USER PROFILE MODAL
      ===================================================== */}

      {selectedUser && (
        <div
          className="admin-user-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUserProfile();
            }
          }}
        >
          <section className="admin-user-modal" role="dialog" aria-modal="true">
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="admin-user-modal-header">
              <div className="admin-user-modal-identity">
                <div className="admin-user-modal-avatar">
                  {(selectedUser.name || "U").charAt(0).toUpperCase()}
                </div>

                <div>
                  <span>CUSTOMER PROFILE</span>

                  <h2>{selectedUser.name || "Unknown User"}</h2>

                  <p>User ID #{selectedUser.id}</p>
                </div>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={closeUserProfile}
              >
                ×
              </button>
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="admin-user-modal-status-row">
              <span
                className={`admin-user-status ${
                  selectedUser.active ? "active" : "blocked"
                }`}
              >
                {selectedUser.active ? "ACTIVE ACCOUNT" : "BLOCKED ACCOUNT"}
              </span>

              <span className="admin-user-role">
                {selectedUser.role || "USER"}
              </span>
            </div>

            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="admin-profile-section">
              <div className="admin-profile-section-title">
                Contact Information
              </div>

              <div className="admin-profile-grid">
                <div>
                  <span>Full Name</span>

                  <strong>{selectedUser.name || "Not provided"}</strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>{selectedUser.email || "Not provided"}</strong>
                </div>

                <div>
                  <span>Phone</span>

                  <strong>{selectedUser.phone || "Not provided"}</strong>
                </div>

                <div>
                  <span>User ID</span>

                  <strong>#{selectedUser.id}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="admin-profile-section">
              <div className="admin-profile-section-title">
                Address Information
              </div>

              <div className="admin-profile-grid">
                <div className="admin-profile-grid-wide">
                  <span>Address</span>

                  <strong>{selectedUser.address || "Not provided"}</strong>
                </div>

                <div>
                  <span>City</span>

                  <strong>{selectedUser.city || "Not provided"}</strong>
                </div>

                <div>
                  <span>State</span>

                  <strong>{selectedUser.state || "Not provided"}</strong>
                </div>

                <div>
                  <span>Pincode</span>

                  <strong>{selectedUser.pincode || "Not provided"}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <div className="admin-profile-section">
              <div className="admin-profile-section-title">
                Account Information
              </div>

              <div className="admin-profile-grid">
                <div>
                  <span>Role</span>

                  <strong>{selectedUser.role || "USER"}</strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>{selectedUser.active ? "Active" : "Blocked"}</strong>
                </div>

                <div>
                  <span>Password</span>

                  <strong>Protected</strong>
                </div>
              </div>

              <p className="admin-profile-security-note">
                Password information is never returned by the CardWise admin
                API.
              </p>
            </div>

            {/* =================================================
                CREDIT CARD APPLICATIONS
            ================================================= */}

            <div className="admin-profile-section admin-user-applications-section">
              <div className="admin-applications-heading">
                <div>
                  <div className="admin-profile-section-title">
                    Credit Card Applications
                  </div>

                  <p className="admin-applications-subtitle">
                    Applications submitted by this customer.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-applications-refresh"
                  onClick={() => loadApplications(selectedUser.id)}
                  disabled={applicationsLoading}
                >
                  {applicationsLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              {applicationsError && (
                <div className="admin-applications-error">
                  {applicationsError}
                </div>
              )}

              {applicationsLoading ? (
                <div className="admin-applications-loading">
                  <div className="admin-users-spinner"></div>

                  <p>Loading credit-card applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="admin-applications-empty">
                  <div className="admin-applications-empty-icon">💳</div>

                  <h3>No Applications Found</h3>

                  <p>
                    This customer has not submitted any credit-card applications
                    yet.
                  </p>
                </div>
              ) : (
                <div className="admin-applications-list">
                  {applications.map((application) => {
                    const statusClass = getApplicationStatusClass(
                      application.status,
                    );

                    return (
                      <article
                        key={application.id}
                        className="admin-application-card"
                      >
                        <div className="admin-application-card-top">
                          <div>
                            <span>APPLICATION</span>

                            <h3>#{application.id}</h3>
                          </div>

                          <span
                            className={`admin-application-status ${statusClass}`}
                          >
                            {application.status || "PENDING"}
                          </span>
                        </div>

                        <div className="admin-application-details">
                          <div>
                            <span>Card</span>

                            <strong>{getCardName(application)}</strong>
                          </div>

                          <div>
                            <span>Bank</span>

                            <strong>{getCardBank(application)}</strong>
                          </div>

                          <div>
                            <span>Card Type</span>

                            <strong>{getCardType(application)}</strong>
                          </div>

                          <div>
                            <span>Applied On</span>

                            <strong>
                              {formatApplicationDate(application.appliedAt)}
                            </strong>
                          </div>
                        </div>

                        <div className="admin-application-actions">
                          <button
                            type="button"
                            className="admin-view-application-btn"
                            onClick={() => viewApplication(application)}
                          >
                            {applicationActionLoading &&
                            selectedApplication?.id === application.id
                              ? "Loading..."
                              : "View Application"}
                          </button>

                          {String(application.status || "").toUpperCase() ===
                            "PENDING" && (
                            <>
                              <button
                                type="button"
                                className="admin-approve-application-btn"
                                onClick={() => approveApplication(application)}
                                disabled={applicationActionLoading}
                              >
                                ✓ Approve
                              </button>

                              <button
                                type="button"
                                className="admin-reject-application-btn"
                                onClick={() => rejectApplication(application)}
                                disabled={applicationActionLoading}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================================
                MODAL ACTIONS
            ================================================= */}

            <div className="admin-user-modal-actions">
              {selectedUser.phone && (
                <a href={`tel:${selectedUser.phone}`} className="call-user-btn">
                  ☎ Call User
                </a>
              )}

              {selectedUser.email && (
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="email-user-btn"
                >
                  ✉ Send Email
                </a>
              )}

              <button
                type="button"
                className={
                  selectedUser.active ? "block-user-btn" : "unblock-user-btn"
                }
                onClick={() => changeUserStatus(selectedUser)}
              >
                {selectedUser.active ? "⊘ Block User" : "✓ Unblock User"}
              </button>
            </div>

            {/* =================================================
                APPLICATION DETAILS
            ================================================= */}

            {selectedApplication && (
              <div className="admin-application-detail-panel">
                <div className="admin-application-detail-header">
                  <div>
                    <span>APPLICATION DETAILS</span>

                    <h3>Application #{selectedApplication.id}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="admin-application-detail-close"
                  >
                    ×
                  </button>
                </div>

                <div className="admin-application-detail-grid">
                  <div>
                    <span>Application ID</span>

                    <strong>#{selectedApplication.id}</strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong
                      className={`admin-application-detail-status ${getApplicationStatusClass(
                        selectedApplication.status,
                      )}`}
                    >
                      {selectedApplication.status || "PENDING"}
                    </strong>
                  </div>

                  <div>
                    <span>Customer</span>

                    <strong>{selectedUser.name || "Unknown User"}</strong>
                  </div>

                  <div>
                    <span>Customer ID</span>

                    <strong>#{selectedUser.id}</strong>
                  </div>

                  <div>
                    <span>Credit Card</span>

                    <strong>{getCardName(selectedApplication)}</strong>
                  </div>

                  <div>
                    <span>Bank</span>

                    <strong>{getCardBank(selectedApplication)}</strong>
                  </div>

                  <div>
                    <span>Card Type</span>

                    <strong>{getCardType(selectedApplication)}</strong>
                  </div>

                  <div>
                    <span>Applied At</span>

                    <strong>
                      {formatApplicationDate(selectedApplication.appliedAt)}
                    </strong>
                  </div>
                </div>

                {String(selectedApplication.status || "").toUpperCase() ===
                  "PENDING" && (
                  <div className="admin-application-detail-actions">
                    <button
                      type="button"
                      className="admin-approve-application-btn"
                      onClick={() => approveApplication(selectedApplication)}
                      disabled={applicationActionLoading}
                    >
                      ✓ Approve Application
                    </button>

                    <button
                      type="button"
                      className="admin-reject-application-btn"
                      onClick={() => rejectApplication(selectedApplication)}
                      disabled={applicationActionLoading}
                    >
                      ✕ Reject Application
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
