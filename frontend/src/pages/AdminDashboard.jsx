import { Link, useNavigate } from "react-router-dom";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";

  // =====================================================
  // ACCESS PROTECTION
  // =====================================================

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-box">
          <div className="admin-access-icon">🔒</div>

          <h1>Access Denied</h1>

          <p>
            You do not have permission to access the administrator dashboard.
          </p>

          <button type="button" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const initial = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-dashboard-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-content">
          <span className="admin-dashboard-badge">CARDWISE ADMINISTRATION</span>

          <h1>
            Admin <span>Dashboard</span>
          </h1>

          <p>
            Manage credit cards, review customer applications, manage customer
            contact information, and control your CardWise platform from one
            secure administration center.
          </p>

          <div className="admin-dashboard-user">
            <div className="admin-dashboard-avatar">{initial}</div>

            <div>
              <strong>{user?.name || "Administrator"}</strong>

              <span>{user?.email || "Admin Account"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          {/* =================================================
              HEADING
          ================================================= */}

          <div className="admin-dashboard-heading">
            <span>CONTROL CENTER</span>

            <h2>Manage CardWise</h2>

            <p>Select an area below to manage your credit card platform.</p>
          </div>

          {/* =================================================
              GRID
          ================================================= */}

          <div className="admin-dashboard-grid">
            {/* =================================================
                APPLICATIONS
            ================================================= */}

            <Link to="/admin/applications" className="admin-dashboard-card">
              <div className="admin-dashboard-card-top">
                <div className="admin-dashboard-icon applications">📋</div>

                <span className="admin-dashboard-arrow">→</span>
              </div>

              <span className="admin-card-label">APPLICATION MANAGEMENT</span>

              <h3>Review Applications</h3>

              <p>
                Review customer credit card applications, check applicant
                information, and approve or reject pending requests.
              </p>

              <div className="admin-dashboard-card-footer">
                <span>Manage Applications</span>

                <strong>→</strong>
              </div>
            </Link>

            {/* =================================================
                CREDIT CARDS
            ================================================= */}

            <Link to="/admin/cards" className="admin-dashboard-card">
              <div className="admin-dashboard-card-top">
                <div className="admin-dashboard-icon cards">💳</div>

                <span className="admin-dashboard-arrow">→</span>
              </div>

              <span className="admin-card-label">CREDIT CARD MANAGEMENT</span>

              <h3>Manage Credit Cards</h3>

              <p>
                Add new credit cards, edit existing card information, and remove
                cards from the CardWise platform.
              </p>

              <div className="admin-dashboard-card-footer">
                <span>Manage Cards</span>

                <strong>→</strong>
              </div>
            </Link>

            {/* =================================================
                CONTACT CENTER
            ================================================= */}

            <Link to="/admin/contact" className="admin-dashboard-card">
              <div className="admin-dashboard-card-top">
                <div className="admin-dashboard-icon contact">💬</div>

                <span className="admin-dashboard-arrow">→</span>
              </div>

              <span className="admin-card-label">
                CUSTOMER CONTACT MANAGEMENT
              </span>

              <h3>Contact Center</h3>

              <p>
                View and manage customer contact information including names,
                email addresses, phone numbers, and saved addresses.
              </p>

              <div className="admin-dashboard-card-footer">
                <span>Manage Contact Details</span>

                <strong>→</strong>
              </div>
            </Link>

            {/* =================================================
                PROFILE
            ================================================= */}

            <Link to="/admin/profile" className="admin-dashboard-card">
              <div className="admin-dashboard-card-top">
                <div className="admin-dashboard-icon profile">👤</div>

                <span className="admin-dashboard-arrow">→</span>
              </div>

              <span className="admin-card-label">ADMIN ACCOUNT</span>

              <h3>Admin Profile</h3>

              <p>
                View your administrator account, contact information, account
                role, and account status.
              </p>

              <div className="admin-dashboard-card-footer">
                <span>View Full Profile</span>

                <strong>→</strong>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
