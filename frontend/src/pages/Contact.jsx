import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import "./Contact.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSending(true);
      setError("");

      await api.post("/contact", payload);

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error("Contact message error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendAnother = () => {
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="contact-page">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="contact-hero">
        <div className="contact-container">
          <div className="contact-hero-content">
            <span className="contact-badge">CARDWISE SUPPORT</span>

            <h1>How Can We Help You?</h1>

            <p>
              Have questions about a credit card, eligibility, benefits, or your
              application? Contact the CardWise administration team.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ====================================================== */}

      <section className="contact-section">
        <div className="contact-container contact-grid">
          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}

          <div className="contact-information">
            <span className="contact-label">GET IN TOUCH</span>

            <h2>We're Here to Help</h2>

            <p className="contact-information-description">
              If you need assistance with a credit card or application, send us
              a message or contact the CardWise team directly.
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-method-icon" aria-hidden="true">
                  ✉
                </div>

                <div className="contact-method-content">
                  <span>Email</span>

                  <strong>support@cardwise.com</strong>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-method-icon" aria-hidden="true">
                  ☎
                </div>

                <div className="contact-method-content">
                  <span>Phone</span>

                  <strong>+91 7235986172</strong>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-method-icon" aria-hidden="true">
                  🕐
                </div>

                <div className="contact-method-content">
                  <span>Support Hours</span>

                  <strong>Monday – Saturday</strong>

                  <small>10:00 AM – 6:00 PM</small>
                </div>
              </div>
            </div>

            <Link to="/cards" className="contact-back-button">
              <span aria-hidden="true">←</span>
              Back to Credit Cards
            </Link>
          </div>

          {/* =================================================
              CONTACT FORM
          ================================================== */}

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success" role="status" aria-live="polite">
                <div className="contact-success-icon" aria-hidden="true">
                  ✓
                </div>

                <span className="contact-success-label">MESSAGE RECEIVED</span>

                <h2>Message Sent Successfully</h2>

                <p>
                  Thank you for contacting CardWise. Our administration team
                  will review your message and get back to you.
                </p>

                <button
                  type="button"
                  className="contact-success-button"
                  onClick={handleSendAnother}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-heading">
                  <span>SEND A MESSAGE</span>

                  <h2>Contact CardWise</h2>

                  <p>
                    Fill in the details below and send your message to our
                    administration team.
                  </p>
                </div>

                {error && (
                  <div className="contact-error-message" role="alert">
                    <span aria-hidden="true">!</span>
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label htmlFor="name">
                        Your Name
                        <span aria-hidden="true">*</span>
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        maxLength={100}
                        required
                        disabled={sending}
                      />
                    </div>

                    <div className="contact-input-group">
                      <label htmlFor="email">
                        Email Address
                        <span aria-hidden="true">*</span>
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        maxLength={150}
                        required
                        disabled={sending}
                      />
                    </div>
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="subject">
                      Subject
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What do you need help with?"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={150}
                      required
                      disabled={sending}
                    />
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="message">
                      Message
                      <span aria-hidden="true">*</span>
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Write your message..."
                      value={form.message}
                      onChange={handleChange}
                      maxLength={2000}
                      required
                      disabled={sending}
                    />

                    <small className="contact-character-count">
                      {form.message.length}/2000
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="contact-submit-button"
                    disabled={sending}
                    aria-busy={sending}
                  >
                    {sending ? (
                      <>
                        <span
                          className="contact-submit-spinner"
                          aria-hidden="true"
                        ></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
