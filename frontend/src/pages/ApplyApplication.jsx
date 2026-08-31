import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./ApplyApplication.css";

function ApplyApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    monthlyIncome: "",
    employmentType: "Salaried",
    dateOfBirth: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await api.get(`/cards/${id}`);
        setCard(response.data);
      } catch (err) {
        console.error("Card loading error:", err);

        setError(
          err.response?.data?.message || "Unable to load credit card details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (!user?.id) {
      setError("User information is missing. Please login again.");
      return;
    }

    if (!formData.monthlyIncome) {
      setError("Please enter your monthly income.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    if (!formData.phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        userId: user.id,
        creditCardId: Number(id),
      };

      console.log("Submitting application:", applicationData);

      const response = await api.post("/applications", applicationData);

      console.log("Application created:", response.data);

      setSuccess(
        "Your credit card application has been submitted successfully!",
      );

      setTimeout(() => {
        navigate("/applications");
      }, 1200);
    } catch (err) {
      console.error("Application submission error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-page">
        <div className="apply-message">
          <h2>Loading Card Details...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="apply-page">
        <div className="apply-message apply-error">
          <h2>Unable to Load Card</h2>
          <p>{error}</p>

          <Link to="/cards" className="apply-back-button">
            ← Back to Cards
          </Link>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="apply-page">
      <div className="apply-container">
        <Link to={`/cards/${id}`} className="apply-back">
          ← Back to Card Details
        </Link>

        <div className="apply-layout">
          {/* CARD INFORMATION */}
          <div className="apply-card-info">
            <span className="apply-label">CARDWISE APPLICATION</span>

            <h1>Apply for Your Credit Card</h1>

            <p className="apply-intro">
              Complete the application form below to submit your application for
              this credit card.
            </p>

            <div className="selected-card">
              <div className="selected-card-top">
                <div className="selected-card-logo">
                  {card.bank?.charAt(0) || "C"}
                </div>

                <div>
                  <span>{card.bank}</span>
                  <strong>{card.name}</strong>
                </div>
              </div>

              <div className="selected-card-details">
                <div>
                  <span>Card Type</span>
                  <strong>{card.cardType}</strong>
                </div>

                <div>
                  <span>Cashback</span>
                  <strong>{card.cashbackPercentage || 0}%</strong>
                </div>

                <div>
                  <span>Annual Fee</span>
                  <strong>₹{card.annualFee}</strong>
                </div>

                <div>
                  <span>Joining Fee</span>
                  <strong>₹{card.joiningFee}</strong>
                </div>
              </div>
            </div>

            <div className="apply-benefits">
              <h3>Why Choose This Card?</h3>

              <p>
                {card.benefits ||
                  "Enjoy valuable benefits and rewards with this credit card."}
              </p>
            </div>
          </div>

          {/* APPLICATION FORM */}
          <div className="apply-form-card">
            <div className="apply-form-heading">
              <h2>Application Details</h2>

              <p>Please provide your information to continue.</p>
            </div>

            {error && <div className="apply-form-error">{error}</div>}

            {success && <div className="apply-form-success">✓ {success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="apply-input-group">
                <label htmlFor="monthlyIncome">Monthly Income</label>

                <input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  placeholder="Enter monthly income"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="apply-input-group">
                <label htmlFor="employmentType">Employment Type</label>

                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className="apply-input-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="apply-input-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="apply-input-group">
                <label htmlFor="address">Address</label>

                <textarea
                  id="address"
                  name="address"
                  rows="4"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="apply-security-note">
                🔒 Your information is securely processed by CardWise.
              </div>

              <button
                type="submit"
                className="apply-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyApplication;
