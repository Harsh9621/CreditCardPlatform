import { useEffect, useState } from "react";
import "./AdminUsers.css";

const API_URL = "http://localhost:8080";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {

        const message =
          await response.text();

        throw new Error(
          message || "Unable to load users"
        );
      }

      const data = await response.json();

      setUsers(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load users."
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON START
  // =====================================================

  useEffect(() => {

    loadUsers();

  }, []);

  // =====================================================
  // BLOCK / UNBLOCK
  // =====================================================

  const changeUserStatus = async (
    userId,
    blocked
  ) => {

    const endpoint = blocked
      ? `${API_URL}/api/admin/users/${userId}/unblock`
      : `${API_URL}/api/admin/users/${userId}/block`;

    try {

      const response = await fetch(
        endpoint,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {

        const message =
          await response.text();

        throw new Error(
          message || "Unable to update user."
        );
      }

      await loadUsers();

    } catch (err) {

      alert(
        err.message ||
        "Unable to update user."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="admin-users-loading">
        <div className="admin-users-spinner"></div>

        <h2>Loading Users</h2>

        <p>
          Fetching customer information...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-users-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="admin-users-hero">

        <div className="admin-users-hero-content">

          <span>
            CARDWISE ADMINISTRATION
          </span>

          <h1>
            User <strong>Management</strong>
          </h1>

          <p>
            View customer information, contact details,
            account status and manage platform access.
          </p>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-users-content">

        <div className="admin-users-container">

          {error && (
            <div className="admin-users-error">
              {error}
            </div>
          )}

          <div className="admin-users-heading">

            <div>

              <span>
                CUSTOMER ACCOUNTS
              </span>

              <h2>
                Registered Users
              </h2>

              <p>
                {users.length} customer
                {users.length !== 1 ? "s" : ""}
                registered on CardWise.
              </p>

            </div>

            <button
              onClick={loadUsers}
              className="admin-users-refresh"
            >
              ↻ Refresh
            </button>

          </div>

          {/* =================================================
              USERS
          ================================================= */}

          {users.length === 0 ? (

            <div className="admin-users-empty">

              <div>
                👥
              </div>

              <h2>
                No Users Found
              </h2>

              <p>
                There are currently no registered customers.
              </p>

            </div>

          ) : (

            <div className="admin-users-list">

              {users.map((user) => (

                <article
                  key={user.id}
                  className="admin-user-card"
                >

                  {/* USER HEADER */}

                  <div className="admin-user-header">

                    <div className="admin-user-avatar">
                      {(user.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <h3>
                        {user.name || "Unknown User"}
                      </h3>

                      <span>
                        Customer ID #{user.id}
                      </span>

                    </div>

                    <div
                      className={`admin-user-status ${
                        user.blocked
                          ? "blocked"
                          : "active"
                      }`}
                    >
                      {user.blocked
                        ? "BLOCKED"
                        : "ACTIVE"}
                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="admin-user-details">

                    <div>
                      <span>Email</span>
                      <strong>
                        {user.email || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>
                        {user.phone || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Role</span>
                      <strong>
                        {user.role || "USER"}
                      </strong>
                    </div>

                    <div>
                      <span>Account</span>
                      <strong>
                        {user.blocked
                          ? "Restricted"
                          : "Normal"}
                      </strong>
                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-user-actions">

                    <a
                      href={
                        user.phone
                          ? `tel:${user.phone}`
                          : undefined
                      }
                      className={
                        user.phone
                          ? "call-user-btn"
                          : "call-user-btn disabled"
                      }
                    >
                      ☎ Call User
                    </a>

                    <a
                      href={
                        user.email
                          ? `mailto:${user.email}`
                          : undefined
                      }
                      className="email-user-btn"
                    >
                      ✉ Email
                    </a>

                    <button
                      type="button"
                      className={
                        user.blocked
                          ? "unblock-user-btn"
                          : "block-user-btn"
                      }
                      onClick={() =>
                        changeUserStatus(
                          user.id,
                          user.blocked
                        )
                      }
                    >
                      {user.blocked
                        ? "✓ Unblock User"
                        : "⊘ Block User"}
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminUsers;