import React from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const getProductId = (item) => {
  if (!item) return null;
  return item._id || item.id;
};

const getItemImage = (item) => {
  return (
    item?.image || item?.imageUrl || item?.productImage || item?.img || null
  );
};

export default function Cart({ cartItems = [], setCartItems, onClose }) {
  const navigate = useNavigate();

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  /* =========================================
     INCREASE
  ========================================= */

  const increaseQuantity = (id) => {
    if (!setCartItems) return;

    setCartItems((previousItems) =>
      previousItems.map((item) =>
        getProductId(item) === id
          ? {
              ...item,
              quantity: Number(item.quantity || 0) + 1,
            }
          : item,
      ),
    );
  };

  /* =========================================
     DECREASE
  ========================================= */

  const decreaseQuantity = (id) => {
    if (!setCartItems) return;

    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (getProductId(item) !== id) {
            return item;
          }

          return {
            ...item,
            quantity: Number(item.quantity || 1) - 1,
          };
        })
        .filter((item) => Number(item.quantity || 0) > 0),
    );
  };

  /* =========================================
     REMOVE
  ========================================= */

  const removeItem = (id) => {
    if (!setCartItems) return;

    setCartItems((previousItems) =>
      previousItems.filter((item) => getProductId(item) !== id),
    );
  };

  /* =========================================
     TOTAL ITEMS
  ========================================= */

  const totalItems = safeCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  /* =========================================
     TOTAL AMOUNT
  ========================================= */

  const totalAmount = safeCartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  /* =========================================
     CHECKOUT
  ========================================= */

  const handleCheckout = () => {
    if (safeCartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (onClose) {
      onClose();
    }

    navigate("/checkout");
  };

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        {/* HEADER */}

        <div className="cart-header">
          <div className="cart-heading">
            <span className="cart-bag-icon">🛒</span>

            <div>
              <h2>Your Cart</h2>

              <span className="cart-item-count">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cart-close-button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate("/");
              }
            }}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <div className="cart-body">
          {safeCartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>

              <h3>Your cart is empty</h3>

              <p>Add some products to your cart to get started.</p>

              <button
                type="button"
                className="continue-shopping-button"
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    navigate("/");
                  }
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {safeCartItems.map((item) => {
                const id = getProductId(item);

                const quantity = Number(item.quantity || 1);

                const price = Number(item.price || 0);

                const itemTotal = price * quantity;

                const image = getItemImage(item);

                return (
                  <div className="cart-product" key={id}>
                    {/* IMAGE */}

                    <div className="cart-product-image">
                      {image ? (
                        <img src={image} alt={item.name || "Product"} />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="cart-product-details">
                      <h3>{item.name}</h3>

                      <div className="cart-product-price">₹{price}</div>

                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(id)}
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(id)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="cart-product-right">
                      <strong>₹{itemTotal}</strong>

                      <button
                        type="button"
                        className="remove-product"
                        onClick={() => removeItem(id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}

        {safeCartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Items</span>

                <span>{totalItems}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total</span>

                <strong>₹{totalAmount}</strong>
              </div>
            </div>

            <button
              type="button"
              className="checkout-button"
              onClick={handleCheckout}
            >
              <span>Proceed to Checkout</span>

              <span>→</span>
            </button>

            <p className="checkout-info">
              Review your order and enter your details on the next page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
