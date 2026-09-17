import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import "./CardDetails.css";

function CardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCard = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Invalid credit card ID.");
        }

        const response = await api.get(`/cards/${id}`);

        console.log("Card details:", response.data);

        if (isMounted) {
          setCard(response.data);
        }
      } catch (err) {
        console.error("Card details error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Unable to load credit card details.",
          );

          setCard(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCard();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getBankInitial = () => {
    return card?.bank?.trim()?.charAt(0)?.toUpperCase() || "C";
  };

  const handleApply = () => {
    if (!card?.id) {
      navigate("/cards");
      return;
    }

    navigate(`/apply/${card.id}`);
  };

  const handleCompare = () => {
    navigate("/compare");
  };

  if (loading) {
    return (
      <div className="card-details-page">
        <section className="card-details-loading">
          <div className="card-details-loader" aria-hidden="true"></div>

          <h2>Loading Card Details...</h2>

          <p>Please wait while we fetch the card information.</p>
        </section>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-details-page">
        <section className="card-details-error">
          <div className="details-error-icon" aria-hidden="true">
            !
          </div>

          <span className="details-error-badge">CREDIT CARD</span>

          <h2>Card Not Found</h2>

          <p>{error || "The requested credit card could not be found."}</p>

          <button
            type="button"
            className="details-back-button"
            onClick={() => navigate("/cards")}
          >
            ← Back to Cards
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="card-details-page">
      {/* HERO */}
      <section className="card-details-hero">
        <div className="card-details-container">
          <Link to="/cards" className="details-back-link">
            ← Back to Credit Cards
          </Link>

          <div className="details-hero-content">
            <span className="details-badge">CREDIT CARD DETAILS</span>

            <h1>{card.name}</h1>

            <p>
              Explore the fees, rewards, eligibility and benefits of this credit
              card before applying.
            </p>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="card-details-section">
        <div className="card-details-container">
          <div className="details-layout">
            {/* CARD PREVIEW */}
            <div className="details-card-column">
              <div className="details-credit-card">
                <div className="details-card-glow"></div>
                <div className="details-card-shine"></div>

                <div className="details-card-top">
                  <div
                    className="details-bank-logo"
                    aria-label={`${card.bank || "Card"} logo`}
                  >
                    {getBankInitial()}
                  </div>

                  <span>CardWise</span>
                </div>

                <div className="details-chip" aria-hidden="true"></div>

                <div className="details-card-number">4532 •••• •••• 7821</div>

                <div className="details-card-bottom">
                  <div>
                    <small>CARD HOLDER</small>
                    <strong>CARDWISE USER</strong>
                  </div>

                  <div>
                    <small>VALID THRU</small>
                    <strong>12/29</strong>
                  </div>
                </div>

                <div className="details-card-network">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div className="details-card-bank">
                <div>
                  <span>ISSUED BY</span>
                  <strong>{card.bank || "CardWise"}</strong>
                </div>

                <span className="details-issued-dot">●</span>
              </div>

              <div className="details-secure-note">
                <span aria-hidden="true">✓</span>
                <p>Secure application powered by CardWise</p>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="details-info">
              <div className="details-heading">
                <span className="details-card-type">
                  {card.cardType || "Credit Card"}
                </span>

                <h2>{card.name}</h2>

                <p>
                  A detailed overview of this card's features, pricing and
                  rewards.
                </p>
              </div>

              {/* HIGHLIGHTS */}
              <div className="details-highlights">
                <div className="details-highlight-item">
                  <span>Annual Fee</span>

                  <strong>{formatCurrency(card.annualFee)}</strong>

                  <small>Yearly</small>
                </div>

                <div className="details-highlight-item">
                  <span>Joining Fee</span>

                  <strong>{formatCurrency(card.joiningFee)}</strong>

                  <small>One-time</small>
                </div>

                <div className="details-highlight-item">
                  <span>Cashback</span>

                  <strong>{card.cashbackPercentage ?? 0}%</strong>

                  <small>Applicable rewards</small>
                </div>
              </div>

              {/* REWARD */}
              <div className="details-info-box">
                <div className="details-icon" aria-hidden="true">
                  ★
                </div>

                <div>
                  <span>REWARD TYPE</span>

                  <h3>{card.rewardType || "Rewards"}</h3>
                </div>
              </div>

              {/* ELIGIBILITY */}
              <div className="details-content-box">
                <div className="details-content-heading">
                  <span className="details-content-number" aria-hidden="true">
                    01
                  </span>

                  <h3>Who can apply?</h3>
                </div>

                <p>
                  {card.eligibility ||
                    "Eligibility information is currently unavailable."}
                </p>
              </div>

              {/* BENEFITS */}
              <div className="details-content-box">
                <div className="details-content-heading">
                  <span className="details-content-number" aria-hidden="true">
                    02
                  </span>

                  <h3>Key Benefits</h3>
                </div>

                <p>
                  {card.benefits ||
                    "Benefits information is currently unavailable."}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="details-actions">
                <button
                  type="button"
                  className="details-apply-button"
                  onClick={handleApply}
                >
                  Apply for This Card
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="details-secondary-button"
                  onClick={handleCompare}
                >
                  Compare Other Cards
                </button>
              </div>

              <div className="details-footer-note">
                <span aria-hidden="true">🔒</span>
                <p>
                  Your information is handled securely during the application
                  process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CardDetails;
