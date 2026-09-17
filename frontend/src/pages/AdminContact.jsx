import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./AdminContact.css";

function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/contact");

      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Contact Center error:", err);

      setError(
        err.response?.data?.message || "Unable to load contact messages.",
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/admin/contact/${id}/read`);

      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, status: "READ" } : message,
        ),
      );

      setSelectedMessage((current) =>
        current && current.id === id ? { ...current, status: "READ" } : current,
      );
    } catch (err) {
      console.error("Unable to mark message as read:", err);
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/contact/${id}`);

      setMessages((current) => current.filter((message) => message.id !== id));

      setSelectedMessage(null);
    } catch (err) {
      console.error("Unable to delete message:", err);

      alert(err.response?.data?.message || "Unable to delete this message.");
    }
  };

  const filteredMessages = useMemo(() => {
    const value = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !value ||
        String(message.name || "")
          .toLowerCase()
          .includes(value) ||
        String(message.email || "")
          .toLowerCase()
          .includes(value) ||
        String(message.subject || "")
          .toLowerCase()
          .includes(value) ||
        String(message.message || "")
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(message.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const unreadCount = messages.filter(
    (message) => String(message.status || "").toUpperCase() === "UNREAD",
  ).length;

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openMessage = (message) => {
    setSelectedMessage(message);

    if (String(message.status || "").toUpperCase() === "UNREAD") {
      markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="admin-contact-page">
        <div className="admin-contact-loading">
          <div className="admin-contact-loader"></div>

          <h2>Loading Contact Messages...</h2>

          <p>Fetching messages sent by CardWise customers.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-contact-page">
        <div className="admin-contact-error">
          <div className="contact-error-icon">!</div>

          <h2>Unable to Load Contact Messages</h2>

          <p>{error}</p>

          <button type="button" onClick={fetchMessages}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contact-page">
      <section className="admin-contact-header">
        <div>
          <span className="admin-contact-label">CARDWISE ADMIN</span>

          <h1>Contact Messages</h1>

          <p>View and manage messages submitted by CardWise customers.</p>
        </div>

        <div className="applicant-summary">
          <strong>{unreadCount}</strong>
          <span>Unread Messages</span>
        </div>
      </section>

      <section className="admin-contact-toolbar">
        <div className="contact-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, email, subject or message..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Messages</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>

        <button
          type="button"
          className="refresh-contact-btn"
          onClick={fetchMessages}
        >
          ↻ Refresh
        </button>
      </section>

      {filteredMessages.length === 0 ? (
        <div className="contact-empty">
          <div>✉</div>

          <h2>No Messages Found</h2>

          <p>
            {search || statusFilter !== "ALL"
              ? "No messages match your current filters."
              : "No customer messages have been received yet."}
          </p>
        </div>
      ) : (
        <section className="applicant-grid">
          {filteredMessages.map((message) => {
            const unread =
              String(message.status || "").toUpperCase() === "UNREAD";

            return (
              <article
                className={`applicant-card ${
                  unread ? "contact-message-unread" : ""
                }`}
                key={message.id}
              >
                <div className="applicant-card-top">
                  <div className="applicant-avatar">
                    {String(message.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="applicant-main-info">
                    <h2>{message.name || "Unknown User"}</h2>

                    <span>{message.email || "No email"}</span>
                  </div>

                  <span
                    className={`application-status ${
                      unread ? "pending" : "approved"
                    }`}
                  >
                    {message.status || "UNREAD"}
                  </span>
                </div>

                <div className="applied-card-box">
                  <span>SUBJECT</span>

                  <strong>{message.subject || "No subject"}</strong>
                </div>

                <div className="applicant-details">
                  <div className="applicant-detail">
                    <span>MESSAGE</span>

                    <strong>
                      {message.message
                        ? message.message.length > 120
                          ? `${message.message.substring(0, 120)}...`
                          : message.message
                        : "No message"}
                    </strong>
                  </div>

                  <div className="applicant-detail">
                    <span>RECEIVED</span>

                    <strong>{formatDate(message.createdAt)}</strong>
                  </div>
                </div>

                <div className="applicant-actions">
                  <button
                    type="button"
                    className="view-applicant-btn"
                    onClick={() => openMessage(message)}
                  >
                    View Message
                  </button>

                  {message.email && (
                    <a
                      className="email-applicant-btn"
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(
                        message.subject || "CardWise Support",
                      )}`}
                    >
                      ✉ Reply
                    </a>
                  )}

                  <button
                    type="button"
                    className="call-applicant-btn"
                    onClick={() => deleteMessage(message.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedMessage && (
        <div
          className="applicant-modal-overlay"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="applicant-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedMessage(null)}
            >
              ×
            </button>

            <div className="modal-profile-header">
              <div className="modal-avatar">
                {String(selectedMessage.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h2>{selectedMessage.name || "Unknown User"}</h2>

                <p>Customer Contact Message</p>
              </div>
            </div>

            <div className="modal-section">
              <h3>Customer Information</h3>

              <div className="modal-info-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedMessage.name || "Not available"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{selectedMessage.email || "Not available"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedMessage.status || "UNREAD"}</strong>
                </div>

                <div>
                  <span>Received</span>
                  <strong>{formatDate(selectedMessage.createdAt)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Message</h3>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong>{selectedMessage.subject}</strong>

                <p>{selectedMessage.message}</p>
              </div>
            </div>

            <div className="modal-actions">
              {selectedMessage.email && (
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || "CardWise Support",
                  )}`}
                  className="modal-email-btn"
                >
                  ✉ Reply by Email
                </a>
              )}

              <button
                type="button"
                className="modal-call-btn"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContact;
