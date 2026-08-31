import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("Profile user error:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-content">
          <span className="profile-badge">CARDWISE ACCOUNT</span>

          <h1>{isAdmin ? "Admin Profile" : "My Profile"}</h1>

          <p>
            Manage your CardWise account information and access your account
            services.
          </p>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-container">
          {/* PROFILE CARD */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-avatar">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{user.name || "User"}</h2>
                <p>{user.email || "No email available"}</p>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-details">
              <div className="profile-detail">
                <span>FULL NAME</span>
                <strong>{user.name || "Not available"}</strong>
              </div>

              <div className="profile-detail">
                <span>EMAIL ADDRESS</span>
                <strong>{user.email || "Not available"}</strong>
              </div>

              <div className="profile-detail">
                <span>ACCOUNT TYPE</span>
                <strong>{isAdmin ? "Administrator" : "CardWise User"}</strong>
              </div>

              <div className="profile-detail">
                <span>ACCOUNT STATUS</span>
                <strong className="profile-status">✓ Active</strong>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="profile-actions">
            <h2>Quick Actions</h2>

            <div className="profile-action-grid">
              {!isAdmin && (
                <>
                  <Link to="/cards" className="profile-action-card">
                    <div className="profile-action-icon">💳</div>

                    <div>
                      <h3>Explore Cards</h3>
                      <p>Compare available credit cards and apply for one.</p>
                    </div>

                    <span>→</span>
                  </Link>

                  <Link to="/applications" className="profile-action-card">
                    <div className="profile-action-icon">📋</div>

                    <div>
                      <h3>My Applications</h3>
                      <p>
                        Track your credit card applications and their status.
                      </p>
                    </div>

                    <span>→</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/applications" className="profile-action-card">
                  <div className="profile-action-icon">📝</div>

                  <div>
                    <h3>Review Applications</h3>
                    <p>Review and manage submitted credit card applications.</p>
                  </div>

                  <span>→</span>
                </Link>
              )}

              <Link to="/contact" className="profile-action-card">
                <div className="profile-action-icon">💬</div>

                <div>
                  <h3>Contact CardWise</h3>
                  <p>
                    Contact the CardWise administration team for assistance.
                  </p>
                </div>

                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
