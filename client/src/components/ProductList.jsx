import React from "react";
import ProductCard from "./ProductCard";
import "./ProductList.css";

export default function ProductList({
  products = [],
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  getCartQuantity,
  isOrderingAllowed,
  searchQuery,
}) {
  const productArray = Array.isArray(products) ? products : [];

  if (productArray.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">🛒</div>

        <h3>No products found</h3>

        <p>Try another product name or category.</p>
      </div>
    );
  }

  /*
    When searching/filtering, show one clean section.
    Otherwise create New Arrivals and Recommended sections.
  */

  const isFiltered = searchQuery?.trim() !== "";

  const newArrivals = productArray.slice(0, 6);

  const recommended =
    productArray.length > 6
      ? productArray.slice(6, 14)
      : productArray.slice(0, 8);

  const renderProducts = (items) => (
    <div className="horizontal-product-list">
      {items.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onAddToCart={onAddToCart}
          onIncreaseQuantity={onIncreaseQuantity}
          onDecreaseQuantity={onDecreaseQuantity}
          getCartQuantity={getCartQuantity}
          isOrderingAllowed={isOrderingAllowed}
        />
      ))}
    </div>
  );

  if (isFiltered) {
    return (
      <section className="product-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Search Results</span>

            <h2>Products</h2>
          </div>

          <span className="product-count">{productArray.length}</span>
        </div>

        {renderProducts(productArray)}
      </section>
    );
  }

  return (
    <div className="home-product-sections">
      <section className="product-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Fresh for you</span>

            <h2>New Arrivals</h2>
          </div>

          <span className="view-all-text">View all →</span>
        </div>

        {renderProducts(newArrivals)}
      </section>

      <section className="product-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Popular choices</span>

            <h2>Recommended Products</h2>
          </div>

          <span className="view-all-text">View all →</span>
        </div>

        {renderProducts(recommended)}
      </section>
    </div>
  );
}
