import React from "react";
import "./Footer.css";

const MY_ORDERS_URL = "https://daily-need-store.vercel.app/my-orders";

export default function Footer({ cartCount, onHome, onCategory, onCart }) {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      <button className="bottom-nav-item active" onClick={onHome} type="button">
        <span className="bottom-nav-icon">⌂</span>
        <span>Home</span>
      </button>

      <button className="bottom-nav-item" onClick={onCategory} type="button">
        <span className="bottom-nav-icon">◉</span>
        <span>Category</span>
      </button>

      <a
        className="bottom-nav-item"
        href={MY_ORDERS_URL}
        aria-label="View my orders"
      >
        <span className="bottom-nav-icon">📋</span>
        <span>Orders</span>
      </a>

      <button className="bottom-nav-item cart-nav-item" onClick={onCart} type="button">
        <span className="cart-nav-icon-wrapper">
          <span className="bottom-nav-icon">🛒</span>
          {cartCount > 0 && (
            <span className="bottom-cart-count">{cartCount}</span>
          )}
        </span>
        <span>Cart</span>
      </button>
    </nav>
  );
}
