import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./Header.css";

export default function Header({
  cartCount,
  onOpenCart,
  shopStatus,
  cartAnimation,
}) {
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <header className="modern-header">
      <div className="header-top">
        <button
          className="logo-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/daily-need-logo.png"
            alt="Daily Need Store"
            className="store-logo"
          />
        </button>

        <button
          className={`header-cart-button ${cartAnimation ? "cart-bounce" : ""}`}
          onClick={onOpenCart}
          aria-label="Open cart"
        >
          <span className="cart-icon">🛒</span>

          {cartCount > 0 && (
            <span className="header-cart-count">{cartCount}</span>
          )}
        </button>
      </div>

      <div className="store-status-row">
        <span
          className={`store-status ${
            shopStatus?.isOpen ? "status-open" : "status-closed"
          }`}
        >
          <span className="status-dot"></span>

          {shopStatus?.isOpen ? "Shop Open" : "Shop Closed"}
        </span>

        <span
          className={`store-status ${
            shopStatus?.acceptingOrders ? "status-orders" : "status-paused"
          }`}
        >
          <span className="status-dot"></span>

          {shopStatus?.acceptingOrders ? "Orders On" : "Orders Off"}
        </span>

        <button
          className="theme-button"
          onClick={toggleTheme}
          aria-label="Change theme"
        >
          ◐
        </button>
      </div>
    </header>
  );
}
