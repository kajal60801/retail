import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const CART_KEY = "user_cart";
const LAST_PHONE_KEY = "dailyneed_last_order_phone";
const WHATSAPP_NUMBER = "918840516577";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");
  const [shopStatus, setShopStatus] = useState({ isOpen: true, acceptingOrders: true });
  const [checkingShopStatus, setCheckingShopStatus] = useState(true);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);

      const savedPhone = localStorage.getItem(LAST_PHONE_KEY);
      if (savedPhone) setPhone(savedPhone);
    } catch (err) {
      console.error("Error loading checkout data:", err);
      setCartItems([]);
    }

    fetchShopStatus();
    const interval = setInterval(fetchShopStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchShopStatus = async () => {
    try {
      const response = await axios.get("/api/settings");
      setShopStatus((previous) => ({ ...previous, ...response.data }));
    } catch (err) {
      console.error("Error checking shop status:", err);
    } finally {
      setCheckingShopStatus(false);
    }
  };

  const orderingAllowed =
    shopStatus.isOpen === true && shopStatus.acceptingOrders === true;

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const total = safeCartItems.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const totalItems = safeCartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const buildWhatsAppMessage = (orderId, customerName, customerPhone) => {
    let message = `*DAILY NEED STORE - NEW ORDER*\n\n`;
    message += `*Order ID: ${orderId}*\n\n`;
    message += `*Customer Details*\n`;
    message += `Name: ${customerName}\n`;
    message += `Mobile: ${customerPhone}\n`;
    message += `Payment: Cash on Delivery\n\n`;
    message += `*Order Details*\n\n`;

    safeCartItems.forEach((item, index) => {
      const itemTotal =
        Number(item.price || 0) * Number(item.quantity || 0);

      message += `${index + 1}. ${item.name}\n`;
      message += `   Qty: ${item.quantity}\n`;
      message += `   Price: ₹${item.price}\n`;
      message += `   Total: ₹${itemTotal}\n\n`;
    });

    message += `*Total Items: ${totalItems}*\n`;
    message += `*Total Amount: ₹${total}*\n\n`;
    message += `Payment Method: Cash on Delivery\n\n`;
    message += `Please keep the Order ID unchanged for verification.`;

    return message;
  };

  const handlePlaceOrder = async () => {
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (safeCartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (placingOrder) return;

    try {
      const settingsResponse = await axios.get("/api/settings");
      const currentStatus = settingsResponse.data || {};
      setShopStatus((previous) => ({ ...previous, ...currentStatus }));

      if (currentStatus.isOpen !== true) {
        setError("The shop is currently closed. Your order cannot be placed.");
        return;
      }

      if (currentStatus.acceptingOrders !== true) {
        setError("Orders are currently paused. Please try again later.");
        return;
      }
    } catch (statusError) {
      console.error("Unable to verify shop status:", statusError);
      setError("Unable to verify shop status. Please try again.");
      return;
    }

    setPlacingOrder(true);

    // Open a blank tab immediately so the browser does not block WhatsApp later.
    let whatsappWindow = null;
    try {
      whatsappWindow = window.open("about:blank", "_blank");
    } catch {
      whatsappWindow = null;
    }

    try {
      const response = await axios.post("/api/orders", {
        customerName: trimmedName,
        contactNumber: trimmedPhone,
        cartItems: safeCartItems,
        totalAmount: total,
        paymentMethod: "Cash on Delivery",
      });

      const orderId = response.data?.orderId;
      const order = response.data?.order;

      if (!orderId) {
        throw new Error("Backend did not return an Order ID.");
      }

      const message = buildWhatsAppMessage(
        orderId,
        trimmedName,
        trimmedPhone,
      );

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(message);

      // Save customer phone so My Orders can load their orders automatically.
      localStorage.setItem(LAST_PHONE_KEY, trimmedPhone);
      localStorage.setItem("dailyneed_last_order_id", orderId);

      // Save a local copy for immediate customer visibility.
      const savedCustomerOrders = JSON.parse(
        localStorage.getItem("dailyneed_customer_orders") || "[]",
      );
      const existingOrders = Array.isArray(savedCustomerOrders)
        ? savedCustomerOrders
        : [];

      localStorage.setItem(
        "dailyneed_customer_orders",
        JSON.stringify([
          order || {
            orderId,
            customerName: trimmedName,
            contactNumber: trimmedPhone,
            cartItems: safeCartItems,
            totalAmount: total,
            paymentMethod: "Cash on Delivery",
            status: "Placed",
            createdAt: new Date().toISOString(),
          },
          ...existingOrders.filter((item) => item.orderId !== orderId),
        ]),
      );

      // Clear cart only after backend successfully creates the order.
      localStorage.removeItem(CART_KEY);
      setCartItems([]);

      setPlacedOrder({
        orderId,
        totalAmount: order?.totalAmount ?? total,
        status: order?.status || "Placed",
        whatsappUrl,
      });

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        // If popup was blocked, the user can use the button on the success page.
        console.warn("WhatsApp popup was blocked by the browser.");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }
      setError(
        err.response?.data?.error ||
          "Unable to place the order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="checkout-page empty-checkout">
        <div className="empty-checkout-icon">✓</div>

        <h2>Order Placed Successfully!</h2>

        <p>Your order has been saved successfully.</p>

        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "1rem auto",
            padding: "1.25rem",
            borderRadius: "16px",
            background: "rgba(34, 197, 94, 0.10)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            textAlign: "center",
          }}
        >
          <span style={{ display: "block", fontSize: "0.8rem", opacity: 0.7 }}>
            ORDER ID
          </span>
          <strong style={{ display: "block", fontSize: "1.5rem", marginTop: "0.3rem" }}>
            {placedOrder.orderId}
          </strong>
          <p style={{ marginBottom: 0 }}>
            Keep this ID unchanged. It is the same ID shown to the shopkeeper.
          </p>
        </div>

        <p>
          Total: <strong>₹{placedOrder.totalAmount}</strong>
        </p>

        <button
          type="button"
          onClick={() => window.open(placedOrder.whatsappUrl, "_blank")}
          className="checkout-primary-button"
        >
          💬 Open WhatsApp
        </button>

        <button
          type="button"
          onClick={() => navigate("/my-orders")}
          className="checkout-primary-button"
          style={{ marginTop: "0.75rem" }}
        >
          📦 View My Orders
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="checkout-primary-button"
          style={{ marginTop: "0.75rem" }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (safeCartItems.length === 0) {
    return (
      <div className="checkout-page empty-checkout">
        <div className="empty-checkout-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="checkout-primary-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button
          type="button"
          className="checkout-back-button"
          onClick={() => navigate("/")}
        >
          ←
        </button>
        <div>
          <span>Daily Need Store</span>
          <h1>Checkout</h1>
        </div>
      </header>

      <main className="checkout-content">
        <section className="checkout-card instruction-card">
          <div className="checkout-card-title">
            <div className="title-icon">💡</div>
            <div>
              <h2>How to place your order?</h2>
              <p>Ordering is quick and simple</p>
            </div>
          </div>

          <div className="order-steps">
            <div className="order-step"><span>1</span><p>Review your products</p></div>
            <div className="order-step"><span>2</span><p>Enter your name and mobile number</p></div>
            <div className="order-step"><span>3</span><p>Select Cash on Delivery</p></div>
            <div className="order-step"><span>4</span><p>Tap Place Order via WhatsApp</p></div>
            <div className="order-step"><span>5</span><p>Use the same Order ID to verify the order</p></div>
          </div>
        </section>

        <section className="checkout-card">
          <div className="checkout-section-heading">
            <span>👤</span>
            <h2>Customer Details</h2>
          </div>

          <label>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
          />

          <label>Mobile Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter 10-digit mobile number"
            inputMode="numeric"
          />

          {error && (
            <p style={{ color: "#ef4444", marginTop: "0.75rem" }}>{error}</p>
          )}
        </section>

        <section className="checkout-card">
          <div className="checkout-section-heading">
            <span>💳</span>
            <h2>Payment Method</h2>
          </div>

          <button type="button" className="payment-option selected">
            <div className="payment-left">
              <div className="payment-icon">🏠</div>
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay when your order is delivered</p>
              </div>
            </div>
            <div className="payment-check">✓</div>
          </button>
        </section>

        <section className="checkout-card">
          <div className="checkout-section-heading">
            <span>🧾</span>
            <h2>Order Summary</h2>
          </div>

          <div className="checkout-products">
            {safeCartItems.map((item, index) => {
              const itemTotal =
                Number(item.price || 0) * Number(item.quantity || 0);

              return (
                <div
                  className="checkout-product"
                  key={item._id || item.id || index}
                >
                  <div className="checkout-product-info">
                    <strong>{item.name}</strong>
                    <span>₹{item.price} × {item.quantity}</span>
                  </div>
                  <strong>₹{itemTotal}</strong>
                </div>
              );
            })}
          </div>

          <div className="checkout-total">
            <span>Total Amount</span>
            <strong>₹{total}</strong>
          </div>
        </section>

        {!orderingAllowed && (
          <div
            style={{
              padding: "0.9rem 1rem",
              marginBottom: "0.8rem",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {shopStatus.isOpen === false
              ? "🔴 Shop is closed. Ordering is unavailable."
              : "⏸️ Orders are currently paused."}
          </div>
        )}

        <button
          type="button"
          className="place-order-button"
          onClick={handlePlaceOrder}
          disabled={placingOrder || checkingShopStatus || !orderingAllowed}
          style={{ opacity: placingOrder || !orderingAllowed ? 0.6 : 1 }}
        >
          <span>{placingOrder ? "⏳" : "💬"}</span>
          {placingOrder
            ? "Creating Order..."
            : checkingShopStatus
              ? "Checking Shop Status..."
              : !orderingAllowed
                ? "Ordering Unavailable"
                : "Place Order via WhatsApp"}
        </button>

        <p className="checkout-bottom-note">
          Your Order ID is generated by the backend and is the same ID shown in
          the shopkeeper portal and WhatsApp.
        </p>
      </main>
    </div>
  );
}
