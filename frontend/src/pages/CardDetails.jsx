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
    fetchCard();
  }, [id]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/cards/${id}`);

      console.log("Card details:", response.data);

      setCard(response.data);
    } catch (err) {
      console.error("Card details error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load credit card details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="card-details-page">
        <div className="card-details-loading">
          <div className="card-details-loader"></div>
          <h2>Loading Card Details...</h2>
          <p>Please wait while we fetch the card information.</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-details-page">
        <div className="card-details-error">
          <div className="details-error-icon">!</div>

          <h2>Card Not Found</h2>

          <p>{error || "The requested credit card could not be found."}</p>

          <button
            className="details-back-button"
            onClick={() => navigate("/cards")}
          >
            ← Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-details-page">
      {/* HEADER */}
      <section className="card-details-hero">
        <div className="card-details-container">

          <Link to="/cards" className="details-back-link">
            ← Back to Credit Cards
          </Link>

          <span className="details-badge">
            CREDIT CARD DETAILS
          </span>

          <h1>{card.name}</h1>

          <p>
            Explore the fees, rewards, eligibility and benefits
            of this credit card before applying.
          </p>

        </div>
      </section>

      {/* DETAILS */}
      <section className="card-details-section">
        <div className="card-details-container">

          <div className="details-layout">

            {/* CARD PREVIEW */}
            <div className="details-card-column">

              <div className="details-credit-card">

                <div className="details-card-top">
                  <div className="details-bank-logo">
                    {card.bank?.charAt(0) || "C"}
                  </div>

                  <span>CardWise</span>
                </div>

                <div className="details-chip"></div>

                <div className="details-card-number">
                  4532 •••• •••• 7821
                </div>

                <div className="details-card-bottom">

                  <div>
                    <small>CARD HOLDER</small>
                    <strong>HARSH SINGH</strong>
                  </div>

                  <div>
                    <small>VALID THRU</small>
                    <strong>12/29</strong>
                  </div>

                </div>

              </div>

              <div className="details-card-bank">
                <span>ISSUED BY</span>
                <strong>{card.bank}</strong>
              </div>

            </div>

            {/* INFORMATION */}
            <div className="details-info">

              <div className="details-heading">
                <span>{card.cardType}</span>

                <h2>{card.name}</h2>

                <p>
                  A detailed overview of the card's features,
                  pricing and rewards.
                </p>
              </div>

              {/* HIGHLIGHTS */}
              <div className="details-highlights">

                <div>
                  <span>Annual Fee</span>
                  <strong>
                    {formatCurrency(card.annualFee)}
                  </strong>
                </div>

                <div>
                  <span>Joining Fee</span>
                  <strong>
                    {formatCurrency(card.joiningFee)}
                  </strong>
                </div>

                <div>
                  <span>Cashback</span>
                  <strong>
                    {card.cashbackPercentage ?? 0}%
                  </strong>
                </div>

              </div>

              {/* REWARD */}
              <div className="details-info-box">
                <div className="details-icon">★</div>

                <div>
                  <span>REWARD TYPE</span>
                  <h3>{card.rewardType || "Rewards"}</h3>
                </div>
              </div>

              {/* ELIGIBILITY */}
              <div className="details-content-box">

                <h3>Who can apply?</h3>

                <p>
                  {card.eligibility ||
                    "Eligibility information is currently unavailable."}
                </p>

              </div>

              {/* BENEFITS */}
              <div className="details-content-box">

                <h3>Key Benefits</h3>

                <p>
                  {card.benefits ||
                    "Benefits information is currently unavailable."}
                </p>

              </div>

              {/* ACTIONS */}
              <div className="details-actions">

                <button
                  className="details-apply-button"
                  onClick={() => navigate("/cards")}
                >
                  Apply for This Card →
                </button>

                <button
                  className="details-secondary-button"
                  onClick={() => navigate("/cards")}
                >
                  Compare Other Cards
                </button>

              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

export default CardDetails;