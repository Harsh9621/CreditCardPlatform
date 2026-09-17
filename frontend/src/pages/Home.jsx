import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-badge">SMARTER CREDIT CARD CHOICES</span>

          <h1>
            Find the Right
            <span> Credit Card for You</span>
          </h1>

          <p>
            Compare credit cards, discover powerful benefits, and choose the
            card that fits your lifestyle.
          </p>

          <div className="home-actions">
            <Link to="/cards" className="home-primary-button">
              Explore Cards
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/register" className="home-secondary-button">
              Create Account
            </Link>
          </div>

          <div className="home-stats">
            <div className="home-stat">
              <strong>50+</strong>
              <span>Credit Cards</span>
            </div>

            <div className="home-stat">
              <strong>10+</strong>
              <span>Major Banks</span>
            </div>

            <div className="home-stat">
              <strong>100%</strong>
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* =================================================
            CREDIT CARD VISUAL
            ================================================= */}
        <div className="home-card-area">
          <div className="home-card-glow" aria-hidden="true" />

          <div className="home-credit-card">
            <div className="home-credit-card-header">
              <div className="home-card-bank">C</div>

              <span>CardWise</span>
            </div>

            <div className="home-credit-card-chip" aria-hidden="true">
              <span />
            </div>

            <div className="home-credit-card-number">
              4532&nbsp; •••• &nbsp;••••&nbsp; 7821
            </div>

            <div className="home-credit-card-footer">
              <div>
                <small>CARD HOLDER</small>
                <strong>CARDWISE USER</strong>
              </div>

              <div>
                <small>VALID THRU</small>
                <strong>12/29</strong>
              </div>
            </div>

            <div className="home-card-network">VISA</div>
          </div>

          <div className="home-floating-card home-floating-one">
            <span>Cashback</span>
            <strong>5.5%</strong>
          </div>

          <div className="home-floating-card home-floating-two">
            <span>Reward Points</span>
            <strong>2X</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CARDWISE
          ===================================================== */}
      <section className="home-features">
        <div className="home-section-heading">
          <span className="home-section-label">WHY CARDWISE</span>

          <h2>Everything You Need to Choose Better</h2>

          <p>
            Make smarter financial decisions with simple comparison and
            application tools.
          </p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              💳
            </div>

            <h3>Compare Cards</h3>

            <p>
              Compare annual fees, cashback, rewards and benefits in one place.
            </p>

            <Link to="/cards" className="home-feature-link">
              Explore Cards →
            </Link>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              💰
            </div>

            <h3>Best Benefits</h3>

            <p>
              Find cards with rewards and benefits that match your spending.
            </p>

            <Link to="/cards" className="home-feature-link">
              View Benefits →
            </Link>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              🔒
            </div>

            <h3>Secure Applications</h3>

            <p>
              Your account and application data are protected with secure
              authentication.
            </p>

            <Link to="/applications" className="home-feature-link">
              View Applications →
            </Link>
          </article>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
          ===================================================== */}
      <section className="home-benefits">
        <div className="home-section-heading">
          <span className="home-section-label">CARDWISE BENEFITS</span>

          <h2>Choose With Confidence</h2>

          <p>
            CardWise makes the credit card selection process simple and
            transparent.
          </p>
        </div>

        <div className="home-benefit-grid">
          <Link
            to="/cards"
            className="home-benefit-card home-benefit-link-card"
          >
            <div className="home-benefit-icon" aria-hidden="true">
              ⚡
            </div>

            <h3>Fast Comparison</h3>

            <p>Quickly compare important card features.</p>

            <span className="home-benefit-action">Compare Cards →</span>
          </Link>

          <Link
            to="/cards"
            className="home-benefit-card home-benefit-link-card"
          >
            <div className="home-benefit-icon" aria-hidden="true">
              💎
            </div>

            <h3>Premium Benefits</h3>

            <p>Discover cards offering valuable rewards.</p>

            <span className="home-benefit-action">Discover Benefits →</span>
          </Link>

          <Link
            to="/cards"
            className="home-benefit-card home-benefit-link-card"
          >
            <div className="home-benefit-icon" aria-hidden="true">
              📊
            </div>

            <h3>Clear Information</h3>

            <p>Understand fees, rewards and eligibility.</p>

            <span className="home-benefit-action">View Cards →</span>
          </Link>

          <Link
            to="/applications"
            className="home-benefit-card home-benefit-link-card"
          >
            <div className="home-benefit-icon" aria-hidden="true">
              🛡️
            </div>

            <h3>Secure Platform</h3>

            <p>Your personal information stays protected.</p>

            <span className="home-benefit-action">My Applications →</span>
          </Link>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section className="home-cta">
        <div className="home-cta-container">
          <span className="home-section-label">READY TO START?</span>

          <h2>Find Your Perfect Credit Card Today</h2>

          <p>
            Explore available cards and discover the benefits that fit your
            lifestyle.
          </p>

          <Link to="/cards" className="home-cta-button">
            Explore Credit Cards
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
