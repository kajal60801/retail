import React from "react";
import "./CategoryFilter.css";

export const DEFAULT_CATEGORIES = [
  "All",
  "Rice",
  "Biscuits",
  "Namkeen",
  "Soap",
  "Shampoo",
  "Snacks",
  "Masala",
  "Packed Food",
  "Cold Drink",
  "Feminine Hygiene",
  "Cleaning Essentials",
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
}) {
  return (
    <section className="category-section">
      <div className="category-heading">
        <div>
          <span>Shop by</span>
          <h2>Categories</h2>
        </div>
      </div>

      <div className="category-buttons-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}
