import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import "./AdminCards.css";

function AdminCards() {
  const [cards, setCards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    bank: "",
    cardType: "",
    annualFee: "",
    joiningFee: "",
    cashbackPercentage: "",
    rewardType: "",
    eligibility: "",
    benefits: "",
  });

  // ==========================================
  // ADMIN CHECK
  // ==========================================

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  // ==========================================
  // LOAD
  // ==========================================

  useEffect(() => {
    if (isAdmin) {
      loadCards();
    }
  }, [isAdmin]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cards");

      const data = Array.isArray(response.data) ? response.data : [];

      setCards(data);
    } catch (err) {
      console.error("Cards loading error:", err);

      setError(err.response?.data?.message || "Unable to load credit cards.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      bank: "",
      cardType: "",
      annualFee: "",
      joiningFee: "",
      cashbackPercentage: "",
      rewardType: "",
      eligibility: "",
      benefits: "",
    });
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (card) => {
    setEditingId(card.id);

    setForm({
      name: card.name || "",
      bank: card.bank || "",
      cardType: card.cardType || "",
      annualFee: card.annualFee ?? "",
      joiningFee: card.joiningFee ?? "",
      cashbackPercentage: card.cashbackPercentage ?? "",
      rewardType: card.rewardType || "",
      eligibility: card.eligibility || "",
      benefits: card.benefits || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this credit card?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/cards/${id}`);

      setMessage("Credit card deleted successfully.");

      await loadCards();
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err.response?.data?.message || "Unable to delete the credit card.",
      );
    }
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Credit card name is required.");
      return;
    }

    if (!form.bank.trim()) {
      setError("Bank name is required.");
      return;
    }

    if (!form.cardType.trim()) {
      setError("Card type is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        bank: form.bank.trim(),
        cardType: form.cardType.trim(),

        annualFee: Number(form.annualFee || 0),

        joiningFee: Number(form.joiningFee || 0),

        cashbackPercentage: Number(form.cashbackPercentage || 0),

        rewardType: form.rewardType.trim(),

        eligibility: form.eligibility.trim(),

        benefits: form.benefits.trim(),
      };

      if (editingId) {
        await api.put(`/cards/${editingId}`, payload);

        setMessage("Credit card updated successfully.");
      } else {
        await api.post("/cards", payload);

        setMessage("Credit card added successfully.");
      }

      resetForm();

      await loadCards();
    } catch (err) {
      console.error("Save card error:", err);

      setError(err.response?.data?.message || "Unable to save credit card.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // NOT ADMIN
  // ==========================================

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-cards-loading-page">
        <div className="admin-cards-spinner"></div>

        <h2>Loading Credit Cards</h2>

        <p>Fetching CardWise card inventory...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="admin-cards-page">
      {/* ======================================
          HERO
      ====================================== */}

      <section className="admin-cards-hero">
        <div className="admin-cards-hero-content">
          <span className="admin-cards-badge">CARDWISE ADMINISTRATION</span>

          <h1>
            Manage <span>Credit Cards</span>
          </h1>

          <p>
            Add, update and remove credit cards available to CardWise customers.
          </p>
        </div>
      </section>

      <main className="admin-cards-main">
        {/* ====================================
            ALERTS
        ==================================== */}

        {message && (
          <div className="admin-card-alert success">
            <div className="alert-icon">✓</div>

            <div className="alert-content">
              <strong>Action Completed</strong>

              <p>{message}</p>
            </div>

            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="admin-card-alert error">
            <div className="alert-icon">!</div>

            <div className="alert-content">
              <strong>Something went wrong</strong>

              <p>{error}</p>
            </div>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* ====================================
            FORM
        ==================================== */}

        <section className="admin-card-form-section">
          <div className="admin-section-heading">
            <span>{editingId ? "UPDATE CREDIT CARD" : "ADD CREDIT CARD"}</span>

            <h2>
              {editingId ? "Edit Card Information" : "Add New Credit Card"}
            </h2>

            <p>
              This information will be displayed to customers on the CardWise
              cards page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-card-form">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Card Name *</label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="HDFC Millennia Credit Card"
                />
              </div>

              <div className="admin-form-group">
                <label>Bank *</label>

                <input
                  name="bank"
                  value={form.bank}
                  onChange={handleChange}
                  placeholder="HDFC Bank"
                />
              </div>

              <div className="admin-form-group">
                <label>Card Type *</label>

                <input
                  name="cardType"
                  value={form.cardType}
                  onChange={handleChange}
                  placeholder="Cashback"
                />
              </div>

              <div className="admin-form-group">
                <label>Reward Type</label>

                <input
                  name="rewardType"
                  value={form.rewardType}
                  onChange={handleChange}
                  placeholder="Cashback"
                />
              </div>

              <div className="admin-form-group">
                <label>Annual Fee</label>

                <input
                  type="number"
                  min="0"
                  name="annualFee"
                  value={form.annualFee}
                  onChange={handleChange}
                  placeholder="1000"
                />
              </div>

              <div className="admin-form-group">
                <label>Joining Fee</label>

                <input
                  type="number"
                  min="0"
                  name="joiningFee"
                  value={form.joiningFee}
                  onChange={handleChange}
                  placeholder="1000"
                />
              </div>

              <div className="admin-form-group">
                <label>Cashback Percentage</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="cashbackPercentage"
                  value={form.cashbackPercentage}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>

              <div className="admin-form-group full">
                <label>Eligibility</label>

                <textarea
                  name="eligibility"
                  value={form.eligibility}
                  onChange={handleChange}
                  placeholder="Salaried professionals with eligible income"
                  rows="3"
                />
              </div>

              <div className="admin-form-group full">
                <label>Benefits</label>

                <textarea
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  placeholder="5% cashback on online shopping, 1% cashback on other spends"
                  rows="4"
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "✓ Update Credit Card"
                    : "+ Add Credit Card"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ====================================
            EXISTING CARDS
        ==================================== */}

        <section className="admin-existing-cards">
          <div className="admin-section-heading">
            <span>CARD INVENTORY</span>

            <h2>Existing Credit Cards</h2>

            <p>
              {cards.length} card
              {cards.length !== 1 ? "s" : ""} currently available.
            </p>
          </div>

          {cards.length === 0 ? (
            <div className="admin-no-cards">
              <div className="no-card-icon">💳</div>

              <h3>No Credit Cards</h3>

              <p>Add your first credit card using the form above.</p>
            </div>
          ) : (
            <div className="admin-managed-cards">
              {cards.map((card) => (
                <article key={card.id} className="admin-managed-card">
                  <div className="managed-card-header">
                    <div className="managed-card-icon">💳</div>

                    <div className="managed-card-title">
                      <span>{card.bank || "Bank"}</span>

                      <h3>{card.name || "Credit Card"}</h3>
                    </div>
                  </div>

                  <div className="managed-card-stats">
                    <div>
                      <span>CARD TYPE</span>

                      <strong>{card.cardType || "N/A"}</strong>
                    </div>

                    <div>
                      <span>ANNUAL FEE</span>

                      <strong>₹{card.annualFee ?? 0}</strong>
                    </div>

                    <div>
                      <span>JOINING FEE</span>

                      <strong>₹{card.joiningFee ?? 0}</strong>
                    </div>

                    <div>
                      <span>CASHBACK</span>

                      <strong>{card.cashbackPercentage ?? 0}%</strong>
                    </div>
                  </div>

                  <div className="managed-card-details">
                    <div>
                      <span>REWARD TYPE</span>

                      <p>{card.rewardType || "N/A"}</p>
                    </div>

                    <div>
                      <span>ELIGIBILITY</span>

                      <p>{card.eligibility || "Not specified"}</p>
                    </div>

                    <div>
                      <span>BENEFITS</span>

                      <p>{card.benefits || "No benefits specified"}</p>
                    </div>
                  </div>

                  <div className="managed-card-actions">
                    <button
                      type="button"
                      className="edit-card-button"
                      onClick={() => handleEdit(card)}
                    >
                      ✎ Edit
                    </button>

                    <button
                      type="button"
                      className="delete-card-button"
                      onClick={() => handleDelete(card.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminCards;
