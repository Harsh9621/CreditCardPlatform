import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./AdminContact.css";

function AdminContact() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * This endpoint should return applications with
       * applicant/user and credit-card information.
       */
      const response = await api.get("/admin/applications");

      const data = Array.isArray(response.data) ? response.data : [];

      /*
       * Remove duplicate application IDs.
       */
      const uniqueApplications = Array.from(
        new Map(
          data.map((application) => [application.id, application]),
        ).values(),
      );

      setApplications(uniqueApplications);
    } catch (err) {
      console.error("Contact Center error:", err);

      setError(
        err.response?.data?.message || "Unable to load applicant information.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return applications;
    }

    return applications.filter((application) => {
      const user = application.user || application.applicant || {};
      const card = application.creditCard || application.card || {};

      return (
        String(user.name || "")
          .toLowerCase()
          .includes(value) ||
        String(user.email || "")
          .toLowerCase()
          .includes(value) ||
        String(user.phone || user.mobile || user.contactNumber || "")
          .toLowerCase()
          .includes(value) ||
        String(card.name || "")
          .toLowerCase()
          .includes(value) ||
        String(application.id || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [applications, search]);

  const getUser = (application) => {
    return application.user || application.applicant || {};
  };

  const getCard = (application) => {
    return application.creditCard || application.card || {};
  };

  const getPhone = (user) => {
    return user.phone || user.mobile || user.contactNumber || "";
  };

  const getAddress = (user) => {
    return user.address || user.location || "Address not available";
  };

  const getStatus = (application) => {
    return application.status || application.applicationStatus || "PENDING";
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    try {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="admin-contact-page">
        <div className="admin-contact-loading">
          <div className="admin-contact-loader"></div>

          <h2>Loading Contact Center...</h2>

          <p>Fetching CardWise applicants and their contact information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-contact-page">
        <div className="admin-contact-error">
          <div className="contact-error-icon">!</div>

          <h2>Unable to Load Contact Center</h2>

          <p>{error}</p>

          <button type="button" onClick={fetchApplicants}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contact-page">
      {/* HEADER */}

      <section className="admin-contact-header">
        <div>
          <span className="admin-contact-label">CARDWISE ADMIN</span>

          <h1>Contact Center</h1>

          <p>
            Manage and contact customers who have applied for CardWise credit
            cards.
          </p>
        </div>

        <div className="applicant-summary">
          <strong>{applications.length}</strong>
          <span>Total Applications</span>
        </div>
      </section>

      {/* SEARCH */}

      <section className="admin-contact-toolbar">
        <div className="contact-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, email, mobile, card or application ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="refresh-contact-btn"
          onClick={fetchApplicants}
        >
          ↻ Refresh
        </button>
      </section>

      {/* EMPTY */}

      {filteredApplications.length === 0 ? (
        <div className="contact-empty">
          <div>👤</div>

          <h2>No Applicants Found</h2>

          <p>
            {search
              ? "No applicant matches your search."
              : "No users have applied for a credit card yet."}
          </p>
        </div>
      ) : (
        <section className="applicant-grid">
          {filteredApplications.map((application) => {
            const user = getUser(application);
            const card = getCard(application);
            const phone = getPhone(user);
            const status = getStatus(application);

            return (
              <article className="applicant-card" key={application.id}>
                {/* TOP */}

                <div className="applicant-card-top">
                  <div className="applicant-avatar">
                    {String(user.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="applicant-main-info">
                    <h2>{user.name || "Unknown User"}</h2>

                    <span>Application #{application.id || "N/A"}</span>
                  </div>

                  <span
                    className={`application-status ${String(
                      status,
                    ).toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                {/* APPLIED CARD */}

                <div className="applied-card-box">
                  <span>APPLIED CARD</span>

                  <strong>{card.name || "Credit Card"}</strong>

                  <small>{card.bank || "Bank not available"}</small>
                </div>

                {/* DETAILS */}

                <div className="applicant-details">
                  <div className="applicant-detail">
                    <span>EMAIL</span>

                    <strong>{user.email || "Not available"}</strong>
                  </div>

                  <div className="applicant-detail">
                    <span>MOBILE</span>

                    <strong>{phone || "Not available"}</strong>
                  </div>

                  <div className="applicant-detail">
                    <span>ADDRESS</span>

                    <strong>{getAddress(user)}</strong>
                  </div>

                  <div className="applicant-detail">
                    <span>APPLIED ON</span>

                    <strong>
                      {formatDate(
                        application.createdAt || application.appliedAt,
                      )}
                    </strong>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="applicant-actions">
                  <button
                    type="button"
                    className="view-applicant-btn"
                    onClick={() => setSelectedApplicant(application)}
                  >
                    View Profile
                  </button>

                  {phone && (
                    <a className="call-applicant-btn" href={`tel:${phone}`}>
                      ☎ Call
                    </a>
                  )}

                  {user.email && (
                    <a
                      className="email-applicant-btn"
                      href={`mailto:${user.email}`}
                    >
                      ✉ Email
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* PROFILE MODAL */}

      {selectedApplicant && (
        <div
          className="applicant-modal-overlay"
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="applicant-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedApplicant(null)}
            >
              ×
            </button>

            {(() => {
              const user = getUser(selectedApplicant);

              const card = getCard(selectedApplicant);

              const phone = getPhone(user);

              return (
                <>
                  <div className="modal-profile-header">
                    <div className="modal-avatar">
                      {String(user.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2>{user.name || "Unknown User"}</h2>

                      <p>CardWise Applicant</p>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h3>Applicant Information</h3>

                    <div className="modal-info-grid">
                      <div>
                        <span>Name</span>
                        <strong>{user.name || "Not available"}</strong>
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>{user.email || "Not available"}</strong>
                      </div>

                      <div>
                        <span>Mobile Number</span>
                        <strong>{phone || "Not available"}</strong>
                      </div>

                      <div>
                        <span>Address</span>
                        <strong>{getAddress(user)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h3>Application</h3>

                    <div className="modal-info-grid">
                      <div>
                        <span>Application ID</span>

                        <strong>#{selectedApplicant.id || "N/A"}</strong>
                      </div>

                      <div>
                        <span>Status</span>

                        <strong>{getStatus(selectedApplicant)}</strong>
                      </div>

                      <div>
                        <span>Card</span>

                        <strong>{card.name || "Not available"}</strong>
                      </div>

                      <div>
                        <span>Bank</span>

                        <strong>{card.bank || "Not available"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    {phone && (
                      <a href={`tel:${phone}`} className="modal-call-btn">
                        ☎ Call Applicant
                      </a>
                    )}

                    {user.email && (
                      <a
                        href={`mailto:${user.email}`}
                        className="modal-email-btn"
                      >
                        ✉ Send Email
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContact;
