import { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Contact message:", form);

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      {/* HERO */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <span className="contact-badge">
            CARDWISE SUPPORT
          </span>

          <h1>
            How Can We Help You?
          </h1>

          <p>
            Have questions about a credit card, eligibility,
            benefits or your application? Contact the CardWise
            administration team.
          </p>

        </div>

      </section>

      {/* CONTACT CONTENT */}

      <section className="contact-section">

        <div className="contact-container">

          {/* LEFT */}

          <div className="contact-information">

            <span className="contact-label">
              GET IN TOUCH
            </span>

            <h2>
              We're Here to Help
            </h2>

            <p>
              If you need assistance with a credit card or
              application, send us a message or contact the
              CardWise team directly.
            </p>

            <div className="contact-methods">

              <div className="contact-method">

                <div className="contact-method-icon">
                  ✉
                </div>

                <div>
                  <span>Email</span>
                  <strong>support@cardwise.com</strong>
                </div>

              </div>

              <div className="contact-method">

                <div className="contact-method-icon">
                  ☎
                </div>

                <div>
                  <span>Phone</span>
                  <strong>+91 98765 43210</strong>
                </div>

              </div>

              <div className="contact-method">

                <div className="contact-method-icon">
                  🕐
                </div>

                <div>
                  <span>Support Hours</span>
                  <strong>Monday – Saturday</strong>
                  <small>10:00 AM – 6:00 PM</small>
                </div>

              </div>

            </div>

            <Link
              to="/cards"
              className="contact-back-button"
            >
              ← Back to Credit Cards
            </Link>

          </div>

          {/* RIGHT */}

          <div className="contact-form-card">

            {submitted ? (

              <div className="contact-success">

                <div className="contact-success-icon">
                  ✓
                </div>

                <h2>
                  Message Sent Successfully
                </h2>

                <p>
                  Thank you for contacting CardWise.
                  Our administration team will review
                  your message and get back to you.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>

              </div>

            ) : (

              <>

                <div className="contact-form-heading">

                  <span>
                    SEND A MESSAGE
                  </span>

                  <h2>
                    Contact CardWise
                  </h2>

                  <p>
                    Fill in the details below and send
                    your message to our administration team.
                  </p>

                </div>

                <form onSubmit={handleSubmit}>

                  <div className="contact-form-row">

                    <div className="contact-input-group">

                      <label htmlFor="name">
                        Your Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    <div className="contact-input-group">

                      <label htmlFor="email">
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />

                    </div>

                  </div>

                  <div className="contact-input-group">

                    <label htmlFor="subject">
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What do you need help with?"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="contact-input-group">

                    <label htmlFor="message">
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      placeholder="Write your message..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="contact-submit-button"
                  >
                    Send Message →
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