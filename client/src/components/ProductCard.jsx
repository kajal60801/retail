import React, { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  getCartQuantity,
  isOrderingAllowed,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const quantity = getCartQuantity(product);

  const handleFirstAdd = () => {
    if (!isOrderingAllowed) return;

    setIsAnimating(true);

    onAddToCart(product, 1);

    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const handleIncrease = () => {
    if (!isOrderingAllowed) return;

    setIsAnimating(true);

    onIncreaseQuantity(product);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const image = product.image || product.imageUrl || product.productImage || "";

  return (
    <article className="modern-product-card">
      <div className="product-image-container">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">🛍️</div>
        )}

        {quantity === 0 ? (
          <button
            className="product-add-button"
            onClick={handleFirstAdd}
            disabled={!isOrderingAllowed}
            aria-label={`Add ${product.name} to cart`}
          >
            +
          </button>
        ) : (
          <div className="product-quantity-control">
            <button
              onClick={() => onDecreaseQuantity(product)}
              disabled={!isOrderingAllowed}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              onClick={handleIncrease}
              disabled={!isOrderingAllowed}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        {isAnimating && <div className="flying-cart-animation">🛒</div>}
      </div>

      <div className="product-card-content">
        <div className="product-price">₹{product.price}</div>

        <h3 className="product-name">{product.name}</h3>

        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
      </div>
    </article>
  );
}
