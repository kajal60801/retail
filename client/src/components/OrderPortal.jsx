import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ShopkeeperLogin from "./ShopkeeperLogin";
import "./OrderPortal.css";

const STATUS_OPTIONS = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

const TOKEN_KEY = "shopkeeper_token";

export default function OrderPortal() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY)),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("shopkeeper_user");
    delete axios.defaults.headers.common.Authorization;
    setIsAuthenticated(false);
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}`, { status });
      const updatedOrder = response.data?.order;

      setOrders((previous) =>
        previous.map((order) =>
          order.orderId === orderId
            ? updatedOrder || { ...order, status }
            : order,
        ),
      );
    } catch (error) {
      console.error("Error updating order:", error);
      if (error.response?.status === 401) {
        logout();
      } else {
        alert(error.response?.data?.error || "Failed to update order status.");
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/orders/${orderId}`);
      setOrders((previous) =>
        previous.filter((order) => order.orderId !== orderId),
      );
    } catch (error) {
      console.error("Error deleting order:", error);
      if (error.response?.status === 401) logout();
      else alert(error.response?.data?.error || "Failed to delete order.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      String(order.orderId || "").toLowerCase().includes(query) ||
      String(order.customerName || "").toLowerCase().includes(query) ||
      String(order.contactNumber || "").includes(query)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="orders-page-container login-wrapper">
        <ShopkeeperLogin
          isOpen
          onClose={() => (window.location.href = "/")}
          onLoginSuccess={() => setIsAuthenticated(true)}
        />
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-page-header">
        <div>
          <h2>📋 Live Order Portal</h2>
          <p className="orders-subtitle">
            Same Order ID as the customer and WhatsApp
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/shopkeeper" className="back-portal-link">
            ← Dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", border: 0, cursor: "pointer" }}
          >
            🔒 Logout
          </button>
        </div>
      </div>

      <div className="order-search-box">
        <input
          type="text"
          placeholder="Search Order ID, customer name or mobile..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="orders-status-box">
          <p>Loading incoming orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-status-box">
          <p>
            {orders.length ? "No matching orders." : "No orders placed yet."}
          </p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="order-ticket-card">
              <div className="ticket-header">
                <div>
                  <span className="ticket-id-label">ORDER ID</span>
                  <h3 className="ticket-id">{order.orderId}</h3>
                </div>
                <span
                  className={`ticket-status ${String(order.status || "Placed").toLowerCase()}`}
                >
                  {order.status || "Placed"}
                </span>
              </div>

              <div className="ticket-body">
                <div className="customer-info-row">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Mobile:</strong> {order.contactNumber || "N/A"}</p>
                  <p className="order-time">
                    <strong>Time:</strong> {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="ticket-items">
                  <h4>Ordered Items:</h4>
                  <ul>
                    {Array.isArray(order.cartItems) &&
                      order.cartItems.map((item, index) => (
                        <li key={`${order.orderId}-${index}`}>
                          <span>{item.name} (×{item.quantity})</span>
                          <span>
                            ₹{Number(item.price || 0) * Number(item.quantity || 0)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="ticket-total">
                  <span>Total Amount:</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>

                <div className="order-verification-box">
                  <strong>🔐 Verification ID</strong>
                  <span>{order.orderId}</span>
                  <small>
                    This must match the Order ID shown to the customer and in WhatsApp.
                  </small>
                </div>

                <div className="ticket-status-control">
                  <label htmlFor={`status-${order.orderId}`}>Order Status</label>
                  <select
                    id={`status-${order.orderId}`}
                    value={order.status || "Placed"}
                    onChange={(event) =>
                      handleStatusChange(order.orderId, event.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="ticket-actions">
                  <button
                    className="btn-delete-order"
                    onClick={() => handleDeleteOrder(order.orderId)}
                    type="button"
                  >
                    🗑 Delete Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
