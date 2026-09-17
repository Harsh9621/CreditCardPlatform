import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="CardWise Home">
            <span className="footer-logo-icon" aria-hidden="true">
              C
            </span>

            <span className="footer-logo-text">
              Card<span>Wise</span>
            </span>
          </Link>

          <p className="footer-description">
            Find the right credit card for your lifestyle. Compare cards,
            discover benefits, and apply with confidence.
          </p>

          <div className="footer-trust">
            <span className="footer-trust-dot" aria-hidden="true">
              ✓
            </span>

            <span>Smart comparison. Clear decisions.</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/">Home</Link>
          <Link to="/cards">Credit Cards</Link>
          <Link to="/compare">Compare Cards</Link>
          <Link to="/applications">Applications</Link>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h4>Support</h4>

          <Link to="/contact">Contact Us</Link>
          <Link to="/forgot-password">Forgot Password</Link>
          <Link to="/cards">Browse Cards</Link>
        </div>

        {/* CTA */}
        <div className="footer-column footer-cta">
          <h4>Ready to find your card?</h4>

          <p>
            Explore credit cards and compare their features, rewards, and
            benefits.
          </p>

          <Link to="/cards" className="footer-cta-button">
            Explore Cards
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} CardWise. All rights reserved.</p>

        <div className="footer-bottom-links">
          <Link to="/contact">Support</Link>

          <span aria-hidden="true">•</span>

          <Link to="/contact">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
