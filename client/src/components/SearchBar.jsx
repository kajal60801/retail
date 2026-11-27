import React from "react";
import "./SearchBar.css";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  isFuzzyMatch,
  nearestKeyword,
}) {
  return (
    <div className="modern-search-container">
      <div className="modern-search-box">
        <span className="modern-search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search groceries and more..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {searchQuery && (
          <button
            className="modern-clear-search"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isFuzzyMatch && nearestKeyword && (
        <div className="fuzzy-notice">
          Showing results for <strong>{nearestKeyword}</strong>
        </div>
      )}
    </div>
  );
}
