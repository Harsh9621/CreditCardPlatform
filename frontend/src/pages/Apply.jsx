import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./Apply.css";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    income: "",
    employmentType: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await api.get(`/cards/${id}`);

        setCard(response.data);

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          const user = JSON.parse(savedUser);

          setFormData((previous) => ({
            ...previous,
            fullName: user.name || "",
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Apply card error:", err);

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
    setSubmitting(true);

    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(savedUser);

      await api.post("/applications", {
        userId: user.id,
        creditCardId: Number(id),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        income: Number(formData.income),
        employmentType: formData.employmentType,
        address: formData.address,
      });

      navigate("/applications");
    } catch (err) {
      console.error("Application submission error:", err);

      setError(
        err.response?.data?.message || "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-page">
        <div className="apply-message">Loading application...</div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="apply-page">
        <div className="apply-message error">{error}</div>

        <Link to="/cards" className="back-link">
          ← Back to Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-container">
        <Link to={`/cards/${id}`} className="back-link">
          ← Back to Card Details
        </Link>

        <div className="apply-layout">
          {/* CARD INFORMATION */}

          <div className="apply-card-info">
            <span className="apply-label">CARDWISE APPLICATION</span>

            <h1>Apply for {card?.name}</h1>

            <p className="apply-bank">{card?.bank}</p>

            <div className="apply-card-summary">
              <div>
                <span>Card Type</span>
                <strong>{card?.cardType}</strong>
              </div>

              <div>
                <span>Cashback</span>
                <strong>{card?.cashbackPercentage}%</strong>
              </div>

              <div>
                <span>Annual Fee</span>
                <strong>₹{card?.annualFee}</strong>
              </div>

              <div>
                <span>Joining Fee</span>
                <strong>₹{card?.joiningFee}</strong>
              </div>
            </div>

            <div className="apply-benefits">
              <h3>Why apply for this card?</h3>

              <p>{card?.benefits}</p>
            </div>
          </div>

          {/* APPLICATION FORM */}

          <div className="apply-form-card">
            <div className="apply-form-heading">
              <h2>Application Details</h2>

              <p>Enter your details to submit your credit card application.</p>
            </div>

            {error && <div className="apply-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="income">Monthly Income</label>

                <input
                  id="income"
                  name="income"
                  type="number"
                  value={formData.income}
                  onChange={handleChange}
                  placeholder="Enter your monthly income"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="employmentType">Employment Type</label>

                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employment type</option>

                  <option value="SALARIED">Salaried</option>

                  <option value="SELF_EMPLOYED">Self Employed</option>

                  <option value="BUSINESS">Business Owner</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="4"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-application"
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

export default Apply;
