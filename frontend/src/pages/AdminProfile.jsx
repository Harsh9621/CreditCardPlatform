import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // =====================================================
  // LOAD ADMIN
  // =====================================================

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");

      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const parsedUser = JSON.parse(savedUser);

      const role = String(parsedUser?.role || "").toUpperCase();

      if (role !== "ADMIN") {
        navigate("/", {
          replace: true,
        });

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Admin profile error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <div className="admin-profile-loading">
        <div className="admin-profile-loader"></div>

        <p>Loading administrator profile...</p>
      </div>
    );
  }

  const initial = (user.name || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-profile-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="admin-profile-hero">
        <div className="admin-profile-hero-content">
          <span className="admin-profile-badge">CARDWISE ADMINISTRATION</span>

          <h1>Administrator Profile</h1>

          <p>View your CardWise administrator account information.</p>
        </div>
      </section>

      {/* =================================================
          PROFILE SECTION
      ================================================= */}

      <section className="admin-profile-section">
        <div className="admin-profile-container">
          <div className="admin-profile-card">
            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="admin-profile-header">
              <div className="admin-profile-avatar">{initial}</div>

              <div className="admin-profile-title">
                <span>ADMINISTRATOR</span>

                <h2>{user.name || "Administrator"}</h2>

                <p>{user.email || "No email available"}</p>
              </div>
            </div>

            {/* =================================================
                ACCOUNT DETAILS
            ================================================= */}

            <div className="admin-profile-details">
              <div className="admin-profile-detail">
                <span>FULL NAME</span>

                <strong>{user.name || "Administrator"}</strong>
              </div>

              <div className="admin-profile-detail">
                <span>EMAIL ADDRESS</span>

                <strong>{user.email || "Not available"}</strong>
              </div>

              <div className="admin-profile-detail">
                <span>PHONE NUMBER</span>

                <strong>
                  {user.phone ||
                    user.mobile ||
                    user.contactNumber ||
                    "Not available"}
                </strong>
              </div>

              <div className="admin-profile-detail">
                <span>ADDRESS</span>

                <strong>
                  {user.address || user.location || "Not available"}
                </strong>
              </div>

              <div className="admin-profile-detail">
                <span>ACCOUNT ROLE</span>

                <strong className="admin-role">ADMIN</strong>
              </div>

              <div className="admin-profile-detail">
                <span>ACCOUNT STATUS</span>

                <strong className="admin-status">
                  <i></i>
                  ACTIVE
                </strong>
              </div>

              {user.id && (
                <div className="admin-profile-detail">
                  <span>USER ID</span>

                  <strong>#{user.id}</strong>
                </div>
              )}
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="admin-profile-actions">
              <Link to="/admin" className="admin-profile-dashboard-btn">
                ← Back to Dashboard
              </Link>

              <button
                type="button"
                className="admin-profile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminProfile;
