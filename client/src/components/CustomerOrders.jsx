import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CustomerOrders.css";

const LAST_PHONE_KEY = "dailyneed_last_order_phone";

export default function CustomerOrders() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPhone = localStorage.getItem(LAST_PHONE_KEY);
    if (savedPhone) {
      setPhone(savedPhone);
      loadOrders(savedPhone);
    }
  }, []);

  const loadOrders = async (mobile) => {
    const cleanPhone = String(mobile || "").replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await axios.get(`/api/orders/customer/${cleanPhone}`);
      setOrders(Array.isArray(response.data) ? response.data : []);
      localStorage.setItem(LAST_PHONE_KEY, cleanPhone);
    } catch (err) {
      console.error("Error loading customer orders:", err);
      setOrders([]);
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) =>
    String(status || "Placed").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="customer-orders-page">
      <div className="customer-orders-header">
        <div>
          <span>Daily Need Store</span>
          <h1>My Orders</h1>
          <p>Use your mobile number to find your orders.</p>
        </div>
        <Link to="/" className="customer-orders-home-link">
          ← Home
        </Link>
      </div>

      <section className="customer-orders-search-card">
        <label htmlFor="customer-order-phone">Mobile Number</label>
        <div className="customer-orders-search-row">
          <input
            id="customer-order-phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter 10-digit mobile number"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={() => loadOrders(phone)}
            disabled={loading}
          >
            {loading ? "Searching..." : "Find Orders"}
          </button>
        </div>
        {error && <p className="customer-orders-error">{error}</p>}
      </section>

      {loading ? (
        <div className="customer-orders-empty">Loading your orders...</div>
      ) : !searched ? (
        <div className="customer-orders-empty">
          Enter the mobile number used while placing the order.
        </div>
      ) : orders.length === 0 ? (
        <div className="customer-orders-empty">
          <div className="customer-orders-empty-icon">📦</div>
          <h2>No orders found</h2>
          <p>Check the mobile number and try again.</p>
        </div>
      ) : (
        <div className="customer-orders-list">
          {orders.map((order) => (
            <article className="customer-order-card" key={order.orderId}>
              <div className="customer-order-card-header">
                <div>
                  <span className="customer-order-label">ORDER ID</span>
                  <h2>{order.orderId}</h2>
                </div>
                <span className={`customer-order-status ${getStatusClass(order.status)}`}>
                  {order.status || "Placed"}
                </span>
              </div>

              <div className="customer-order-meta">
                <span>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                <span>Cash on Delivery</span>
              </div>

              <div className="customer-order-items">
                {Array.isArray(order.cartItems) &&
                  order.cartItems.map((item, index) => (
                    <div className="customer-order-item" key={`${order.orderId}-${index}`}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>
                        ₹{Number(item.price || 0) * Number(item.quantity || 0)}
                      </strong>
                    </div>
                  ))}
              </div>

              <div className="customer-order-total">
                <span>Total Amount</span>
                <strong>₹{order.totalAmount}</strong>
              </div>

              <div className="customer-order-verification">
                <strong>Verification:</strong> This Order ID is the same ID
                sent to the shopkeeper through WhatsApp.
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
