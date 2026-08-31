import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const isLoggedIn = isAuthenticated && !!user;

  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  // =====================================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // =====================================================
  // CLOSE PROFILE WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();

    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // USER INITIAL
  // =====================================================

  const getInitial = () => {
    const name = user?.name || user?.email || "U";

    return name.charAt(0).toUpperCase();
  };

  // =====================================================
  // DISPLAY NAME
  // =====================================================

  const getDisplayName = () => {
    return user?.name || "User";
  };

  return (
    <header className={`navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <div className="navbar-container">

        {/* =================================================
            BRAND
        ================================================= */}

        <Link
          to={isAdmin ? "/admin" : "/"}
          className="navbar-logo"
        >
          <span className="logo-icon">C</span>

          <span className="logo-text">
            Card<span>Wise</span>
          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        {isLoggedIn && (
          <nav className="navbar-links">

            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={
                    location.pathname === "/admin"
                      ? "active"
                      : ""
                  }
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/cards"
                  className={
                    isActive("/admin/cards")
                      ? "active"
                      : ""
                  }
                >
                  Cards
                </Link>

                <Link
                  to="/admin/applications"
                  className={
                    isActive("/admin/applications")
                      ? "active"
                      : ""
                  }
                >
                  Applications
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={
                    isActive("/")
                      ? "active"
                      : ""
                  }
                >
                  Home
                </Link>

                <Link
                  to="/cards"
                  className={
                    isActive("/cards")
                      ? "active"
                      : ""
                  }
                >
                  Cards
                </Link>

                <Link
                  to="/applications"
                  className={
                    isActive("/applications")
                      ? "active"
                      : ""
                  }
                >
                  Applications
                </Link>

                <Link
                  to="/contact"
                  className={
                    isActive("/contact")
                      ? "active"
                      : ""
                  }
                >
                  Contact
                </Link>
              </>
            )}

          </nav>
        )}

        {/* =================================================
            DESKTOP RIGHT ACTIONS
        ================================================= */}

        <div className="navbar-actions">

          {/* NOT LOGGED IN */}

          {!isLoggedIn && (
            <div className="navbar-auth-actions">

              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="apply-btn"
              >
                Get Started
              </Link>

            </div>
          )}

          {/* NORMAL USER */}

          {isLoggedIn && !isAdmin && (
            <div className="navbar-user-area">

              <Link
                to="/profile"
                className="navbar-user"
              >
                <span className="navbar-user-avatar">
                  {getInitial()}
                </span>

                <span className="navbar-user-name">
                  {getDisplayName()}
                </span>
              </Link>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

          {/* ADMIN */}

          {isLoggedIn && isAdmin && (
            <div
              className="profile-dropdown"
              ref={profileRef}
            >

              <button
                type="button"
                className="navbar-profile-icon"
                onClick={() =>
                  setProfileOpen((previous) => !previous)
                }
                aria-label="Open admin profile menu"
                aria-expanded={profileOpen}
              >
                {getInitial()}
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu">

                  <div className="profile-dropdown-header">

                    <div className="profile-dropdown-avatar">
                      {getInitial()}
                    </div>

                    <div>
                      <strong>
                        {getDisplayName()}
                      </strong>

                      <span>
                        {user?.email || "Admin account"}
                      </span>

                      <small>
                        ADMIN
                      </small>
                    </div>

                  </div>

                  <div className="profile-dropdown-divider" />

                  <Link
                    to="/admin/profile"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span>👤</span>
                    Profile
                  </Link>

                  <Link
                    to="/admin"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span>📊</span>
                    Dashboard
                  </Link>

                  <Link
                    to="/admin/applications"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span>📄</span>
                    Applications
                  </Link>

                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            MOBILE CONTROLS
        ================================================= */}

        <div className="mobile-navbar-actions">

          {!isLoggedIn && (
            <Link
              to="/login"
              className="mobile-login-shortcut"
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <span className="mobile-avatar">
              {getInitial()}
            </span>
          )}

          <button
            type="button"
            className={`menu-toggle ${
              menuOpen ? "active" : ""
            }`}
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

        </div>

      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <div
        className={`mobile-menu ${
          menuOpen ? "open" : ""
        }`}
      >

        <div className="mobile-menu-inner">

          {isLoggedIn ? (
            <>

              <nav className="mobile-menu-links">

                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      className={
                        location.pathname === "/admin"
                          ? "active"
                          : ""
                      }
                    >
                      <span>📊</span>
                      Dashboard
                    </Link>

                    <Link
                      to="/admin/cards"
                      className={
                        isActive("/admin/cards")
                          ? "active"
                          : ""
                      }
                    >
                      <span>💳</span>
                      Cards
                    </Link>

                    <Link
                      to="/admin/applications"
                      className={
                        isActive("/admin/applications")
                          ? "active"
                          : ""
                      }
                    >
                      <span>📄</span>
                      Applications
                    </Link>

                    <Link
                      to="/admin/profile"
                      className={
                        isActive("/admin/profile")
                          ? "active"
                          : ""
                      }
                    >
                      <span>👤</span>
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className={
                        isActive("/")
                          ? "active"
                          : ""
                      }
                    >
                      <span>⌂</span>
                      Home
                    </Link>

                    <Link
                      to="/cards"
                      className={
                        isActive("/cards")
                          ? "active"
                          : ""
                      }
                    >
                      <span>💳</span>
                      Credit Cards
                    </Link>

                    <Link
                      to="/applications"
                      className={
                        isActive("/applications")
                          ? "active"
                          : ""
                      }
                    >
                      <span>📄</span>
                      Applications
                    </Link>

                    <Link
                      to="/contact"
                      className={
                        isActive("/contact")
                          ? "active"
                          : ""
                      }
                    >
                      <span>✉</span>
                      Contact
                    </Link>

                    <Link
                      to="/profile"
                      className={
                        isActive("/profile")
                          ? "active"
                          : ""
                      }
                    >
                      <span>👤</span>
                      Profile
                    </Link>
                  </>
                )}

              </nav>

              <div className="mobile-menu-footer">

                <Link
                  to={
                    isAdmin
                      ? "/admin/profile"
                      : "/profile"
                  }
                  className="mobile-user-card"
                >

                  <span className="mobile-user-avatar">
                    {getInitial()}
                  </span>

                  <div className="mobile-user-details">
                    <strong>
                      {getDisplayName()}
                    </strong>

                    <small>
                      {user?.email || "Account"}
                    </small>
                  </div>

                </Link>

                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            </>
          ) : (
            <div className="mobile-auth-actions">

              <Link
                to="/login"
                className="mobile-login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="mobile-register-btn"
              >
                Create Account
              </Link>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;