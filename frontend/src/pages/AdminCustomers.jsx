import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminCustomers.css";

const API_URL = "http://localhost:8080";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load customers.");
      }

      const data = await response.json();

      setCustomers(data);
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const changeStatus = async (id, blocked) => {
    const endpoint = blocked
      ? `/api/admin/users/${id}/unblock`
      : `/api/admin/users/${id}/block`;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to update customer status.");
      }

      await loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="customers-loading">
        <div className="customers-spinner"></div>
        <h2>Loading Customers</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <section className="admin-customers-hero">
        <div className="admin-customers-hero-content">
          <span>CARDWISE ADMINISTRATION</span>

          <h1>
            Customer <strong>Management</strong>
          </h1>

          <p>
            View customer accounts, contact information, account status and
            manage customer access.
          </p>
        </div>
      </section>

      <main className="admin-customers-main">
        <div className="admin-customers-container">
          <div className="customers-heading">
            <div>
              <span>CUSTOMER MANAGEMENT</span>

              <h2>All Customers</h2>

              <p>Manage registered CardWise customers.</p>
            </div>

            <button onClick={loadCustomers} className="customers-refresh">
              ↻ Refresh
            </button>
          </div>

          {error && <div className="customers-error">⚠️ {error}</div>}

          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const blocked =
                    String(customer.accountStatus || "").toUpperCase() ===
                    "BLOCKED";

                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name">
                          <div className="customer-avatar">
                            {(customer.name || "U").charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>

                            <small>Customer #{customer.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{customer.email}</td>

                      <td>{customer.phone || "Not provided"}</td>

                      <td>
                        <span className="customer-role">{customer.role}</span>
                      </td>

                      <td>
                        <span
                          className={`customer-status ${
                            blocked ? "blocked" : "active"
                          }`}
                        >
                          ● {blocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <Link
                            to={`/admin/customers/${customer.id}`}
                            className="view-customer-btn"
                          >
                            View
                          </Link>

                          <button
                            className={
                              blocked
                                ? "unblock-customer-btn"
                                : "block-customer-btn"
                            }
                            onClick={() => changeStatus(customer.id, blocked)}
                          >
                            {blocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="customers-empty">
                <div>👥</div>
                <h2>No Customers Found</h2>
                <p>No registered customers are available.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminCustomers;
