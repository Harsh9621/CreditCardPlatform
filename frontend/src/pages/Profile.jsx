import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Profile.css";

import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();

  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <main className="profile-loading-page">
        <div className="profile-loading">
          <div className="profile-loader" aria-hidden="true" />

          <h2>Loading your profile...</h2>

          <p>Please wait while we retrieve your account information.</p>
        </div>
      </main>
    );
  }

  const role = String(user.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const displayName = user.name?.trim() || "CardWise User";
  const displayEmail = user.email?.trim() || "No email available";
  const displayPhone = user.phone?.trim() || "Not available";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="profile-hero">
        <div className="profile-hero-background" aria-hidden="true">
          <div className="profile-hero-grid" />

          <div className="profile-hero-glow profile-glow-one" />

          <div className="profile-hero-glow profile-glow-two" />
        </div>

        <div className="profile-container profile-hero-content">
          <span className="profile-badge">CARDWISE ACCOUNT</span>

          <h1>{isAdmin ? "Admin Profile" : "My Profile"}</h1>

          <p>
            Manage your CardWise account information and access your account
            services from one secure place.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROFILE CONTENT
          ===================================================== */}

      <section className="profile-section">
        <div className="profile-container">
          <div className="profile-layout">
            {/* =================================================
                PROFILE CARD
                ================================================= */}

            <section className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar" aria-hidden="true">
                  {avatarLetter}
                </div>

                <div className="profile-card-identity">
                  <span className="profile-card-label">
                    {isAdmin ? "ADMINISTRATOR" : "CUSTOMER ACCOUNT"}
                  </span>

                  <h2>{displayName}</h2>

                  <p>{displayEmail}</p>
                </div>
              </div>

              <div className="profile-account-status">
                <span className="profile-status-dot" aria-hidden="true" />

                <span>Account Active</span>
              </div>

              <div className="profile-divider" />

              <div className="profile-details">
                <div className="profile-detail">
                  <span>FULL NAME</span>

                  <strong>{displayName}</strong>
                </div>

                <div className="profile-detail">
                  <span>EMAIL ADDRESS</span>

                  <strong>{displayEmail}</strong>
                </div>

                <div className="profile-detail">
                  <span>MOBILE NUMBER</span>

                  <strong>{displayPhone}</strong>
                </div>

                <div className="profile-detail">
                  <span>ACCOUNT TYPE</span>

                  <strong>{isAdmin ? "Administrator" : "CardWise User"}</strong>
                </div>

                <div className="profile-detail">
                  <span>ACCOUNT STATUS</span>

                  <strong className="profile-status">
                    <span className="profile-status-check" aria-hidden="true">
                      ✓
                    </span>
                    Active
                  </strong>
                </div>
              </div>
            </section>

            {/* =================================================
                ACCOUNT OVERVIEW
                ================================================= */}

            <aside className="profile-overview-card">
              <span className="profile-overview-label">ACCOUNT OVERVIEW</span>

              <div className="profile-overview-icon">
                <span aria-hidden="true">◉</span>
              </div>

              <h2>
                {isAdmin ? "Administrator Access" : "Your CardWise Account"}
              </h2>

              <p>
                {isAdmin
                  ? "Access administration tools and manage CardWise applications and customer services."
                  : "Keep your account information organized and access your CardWise services quickly."}
              </p>

              <div className="profile-overview-line" />

              <div className="profile-overview-status">
                <span className="profile-status-dot" aria-hidden="true" />

                <div>
                  <strong>Account Active</strong>

                  <span>Your CardWise account is currently active.</span>
                </div>
              </div>
            </aside>
          </div>

          {/* =================================================
              QUICK ACTIONS
              ================================================= */}

          <section className="profile-actions">
            <div className="profile-section-heading">
              <div>
                <span className="profile-section-label">QUICK ACCESS</span>

                <h2>Manage Your Account</h2>

                <p>Access the CardWise services you use most.</p>
              </div>
            </div>

            <div className="profile-action-grid">
              {!isAdmin && (
                <>
                  <Link to="/cards" className="profile-action-card">
                    <div className="profile-action-icon">
                      <span aria-hidden="true">▣</span>
                    </div>

                    <div className="profile-action-content">
                      <h3>Explore Cards</h3>

                      <p>
                        Browse available credit cards, compare benefits, and
                        apply for a card.
                      </p>

                      <span className="profile-action-link">
                        View Cards
                        <b aria-hidden="true">→</b>
                      </span>
                    </div>
                  </Link>

                  <Link to="/applications" className="profile-action-card">
                    <div className="profile-action-icon">
                      <span aria-hidden="true">☷</span>
                    </div>

                    <div className="profile-action-content">
                      <h3>My Applications</h3>

                      <p>
                        Track your credit card applications and check their
                        latest status.
                      </p>

                      <span className="profile-action-link">
                        View Applications
                        <b aria-hidden="true">→</b>
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/applications" className="profile-action-card">
                  <div className="profile-action-icon">
                    <span aria-hidden="true">☷</span>
                  </div>

                  <div className="profile-action-content">
                    <h3>Review Applications</h3>

                    <p>
                      Review and manage submitted credit card applications from
                      the admin portal.
                    </p>

                    <span className="profile-action-link">
                      Manage Applications
                      <b aria-hidden="true">→</b>
                    </span>
                  </div>
                </Link>
              )}

              <Link to="/contact" className="profile-action-card">
                <div className="profile-action-icon">
                  <span aria-hidden="true">✉</span>
                </div>

                <div className="profile-action-content">
                  <h3>Contact CardWise</h3>

                  <p>
                    Contact the CardWise administration team if you need
                    assistance.
                  </p>

                  <span className="profile-action-link">
                    Contact Support
                    <b aria-hidden="true">→</b>
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Profile;
