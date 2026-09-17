import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const isLoggedIn = Boolean(isAuthenticated && user);
  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const getInitial = () => {
    const value = user?.name || user?.email || "U";
    return value.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.name || "User";
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header
      className={`navbar ${isAdmin ? "admin-navbar" : ""}`}
      data-open={menuOpen ? "true" : "false"}
    >
      <div className="navbar-container">
        {/* =====================================================
            BRAND
            ===================================================== */}

        <Link
          to={isAdmin ? "/admin" : "/"}
          className="navbar-logo"
          aria-label="CardWise home"
          onClick={closeMenus}
        >
          <span className="logo-icon" aria-hidden="true">
            C
          </span>

          <span className="logo-text">
            Card<span>Wise</span>
          </span>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
            ===================================================== */}

        <nav className="navbar-links" aria-label="Primary navigation">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={location.pathname === "/admin" ? "active" : ""}
                aria-current={
                  location.pathname === "/admin" ? "page" : undefined
                }
              >
                Dashboard
              </Link>

              <Link
                to="/admin/cards"
                className={isActive("/admin/cards") ? "active" : ""}
                aria-current={isActive("/admin/cards") ? "page" : undefined}
              >
                Cards
              </Link>

              <Link
                to="/admin/applications"
                className={isActive("/admin/applications") ? "active" : ""}
                aria-current={
                  isActive("/admin/applications") ? "page" : undefined
                }
              >
                Applications
              </Link>

              <Link
                to="/admin/contact"
                className={isActive("/admin/contact") ? "active" : ""}
                aria-current={isActive("/admin/contact") ? "page" : undefined}
              >
                Contact
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={isActive("/") ? "active" : ""}
                aria-current={isActive("/") ? "page" : undefined}
              >
                Home
              </Link>

              <Link
                to="/cards"
                className={isActive("/cards") ? "active" : ""}
                aria-current={isActive("/cards") ? "page" : undefined}
              >
                Cards
              </Link>

              <Link
                to="/compare"
                className={isActive("/compare") ? "active" : ""}
                aria-current={isActive("/compare") ? "page" : undefined}
              >
                Compare
              </Link>

              {isLoggedIn && (
                <Link
                  to="/applications"
                  className={isActive("/applications") ? "active" : ""}
                  aria-current={isActive("/applications") ? "page" : undefined}
                >
                  Applications
                </Link>
              )}

              <Link
                to="/contact"
                className={isActive("/contact") ? "active" : ""}
                aria-current={isActive("/contact") ? "page" : undefined}
              >
                Contact
              </Link>
            </>
          )}
        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
            ===================================================== */}

        <div className="navbar-actions">
          <ThemeToggle />

          {!isLoggedIn && (
            <div className="navbar-auth-actions">
              <Link to="/login" className="login-btn">
                Login
              </Link>

              <Link to="/register" className="apply-btn">
                Get Started
              </Link>
            </div>
          )}

          {isLoggedIn && !isAdmin && (
            <div className="navbar-user-area">
              <Link
                to="/profile"
                className="navbar-user"
                aria-label="Open your profile"
              >
                <span className="navbar-user-avatar" aria-hidden="true">
                  {getInitial()}
                </span>

                <span className="navbar-user-name">{getDisplayName()}</span>
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

          {isLoggedIn && isAdmin && (
            <div className="profile-dropdown" ref={profileRef}>
              <button
                type="button"
                className="navbar-profile-icon"
                onClick={() => setProfileOpen((previous) => !previous)}
                aria-label="Open admin profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {getInitial()}
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu" role="menu">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar" aria-hidden="true">
                      {getInitial()}
                    </div>

                    <div className="profile-dropdown-user-info">
                      <strong>{getDisplayName()}</strong>

                      <span>{user?.email || "Admin account"}</span>

                      <small>ADMIN</small>
                    </div>
                  </div>

                  <div
                    className="profile-dropdown-divider"
                    aria-hidden="true"
                  />

                  <Link
                    to="/admin/profile"
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    <span aria-hidden="true">👤</span>
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/admin"
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    <span aria-hidden="true">📊</span>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/applications"
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    <span aria-hidden="true">📄</span>
                    <span>Applications</span>
                  </Link>

                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span aria-hidden="true">↪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            MOBILE ACTIONS
            ===================================================== */}

        <div className="mobile-navbar-actions">
          <ThemeToggle />

          {!isLoggedIn && (
            <Link to="/login" className="mobile-login-shortcut">
              Login
            </Link>
          )}

          {isLoggedIn && (
            <Link
              to={isAdmin ? "/admin/profile" : "/profile"}
              className="mobile-avatar"
              aria-label="Open your profile"
            >
              {getInitial()}
            </Link>
          )}

          <button
            type="button"
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="cardwise-mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* =======================================================
          MOBILE MENU
          ======================================================= */}

      <div
        id="cardwise-mobile-menu"
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-inner">
          {isAdmin ? (
            <>
              <nav
                className="mobile-menu-links"
                aria-label="Admin mobile navigation"
              >
                <Link
                  to="/admin"
                  className={location.pathname === "/admin" ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">📊</span>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/admin/cards"
                  className={isActive("/admin/cards") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">💳</span>
                  <span>Cards</span>
                </Link>

                <Link
                  to="/admin/applications"
                  className={isActive("/admin/applications") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">📄</span>
                  <span>Applications</span>
                </Link>

                <Link
                  to="/admin/contact"
                  className={isActive("/admin/contact") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">✉</span>
                  <span>Contact</span>
                </Link>

                <Link
                  to="/admin/profile"
                  className={isActive("/admin/profile") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">👤</span>
                  <span>Profile</span>
                </Link>
              </nav>

              <div className="mobile-menu-footer">
                <Link
                  to="/admin/profile"
                  className="mobile-user-card"
                  onClick={closeMenus}
                >
                  <span className="mobile-user-avatar" aria-hidden="true">
                    {getInitial()}
                  </span>

                  <span className="mobile-user-details">
                    <strong>{getDisplayName()}</strong>
                    <small>{user?.email || "Account"}</small>
                  </span>
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
            <>
              <nav className="mobile-menu-links" aria-label="Mobile navigation">
                <Link
                  to="/"
                  className={isActive("/") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">⌂</span>
                  <span>Home</span>
                </Link>

                <Link
                  to="/cards"
                  className={isActive("/cards") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">💳</span>
                  <span>Credit Cards</span>
                </Link>

                <Link
                  to="/compare"
                  className={isActive("/compare") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">⚖</span>
                  <span>Compare</span>
                </Link>

                {isLoggedIn && (
                  <Link
                    to="/applications"
                    className={isActive("/applications") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    <span aria-hidden="true">📄</span>
                    <span>Applications</span>
                  </Link>
                )}

                <Link
                  to="/contact"
                  className={isActive("/contact") ? "active" : ""}
                  onClick={closeMenus}
                >
                  <span aria-hidden="true">✉</span>
                  <span>Contact</span>
                </Link>

                {isLoggedIn && (
                  <Link
                    to="/profile"
                    className={isActive("/profile") ? "active" : ""}
                    onClick={closeMenus}
                  >
                    <span aria-hidden="true">👤</span>
                    <span>Profile</span>
                  </Link>
                )}
              </nav>

              {!isLoggedIn && (
                <div className="mobile-auth-actions">
                  <Link
                    to="/login"
                    className="mobile-login-btn"
                    onClick={closeMenus}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="mobile-register-btn"
                    onClick={closeMenus}
                  >
                    Create Account
                  </Link>
                </div>
              )}

              {isLoggedIn && (
                <div className="mobile-menu-footer">
                  <Link
                    to="/profile"
                    className="mobile-user-card"
                    onClick={closeMenus}
                  >
                    <span className="mobile-user-avatar" aria-hidden="true">
                      {getInitial()}
                    </span>

                    <span className="mobile-user-details">
                      <strong>{getDisplayName()}</strong>
                      <small>{user?.email || "Account"}</small>
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
