import React, { useState } from "react";
import { DEFAULT_CATEGORIES } from "./CategoryFilter";
import SearchBar from "./SearchBar";
import { filterAndFuzzySearchProducts } from "../utils/fuzzySearch";
import "./ShopkeeperPanel.css";

export default function ShopkeeperPanel({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  shopStatus,
  onToggleStatus,
}) {
  const [sortBy, setSortBy] = useState("name");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Rice",
  });

  // Search & Fuzzy Match State (Same as User Side)
  const [searchQuery, setSearchQuery] = useState("");

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
  });

  const availableCategories = DEFAULT_CATEGORIES.filter((c) => c !== "All");

  // Use the exact same search algorithm as user side
  const { filteredProducts, isFuzzyMatch, nearestKeyword } =
    filterAndFuzzySearchProducts(products, searchQuery, "All");

  // Apply sorting on top of search
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
    return (a.name || "").localeCompare(b.name || "");
  });

  const handleSubmitNew = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    onAddProduct({
      ...newProduct,
      price: Number(newProduct.price),
    });
    setNewProduct({
      name: "",
      price: "",
      category: availableCategories[0] || "Rice",
    });
  };

  const handleStartEdit = (product) => {
    const pId = product._id || product.id;
    setEditingId(pId);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category || availableCategories[0],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", price: "", category: "" });
  };

  const handleSaveEdit = (pId) => {
    if (!editForm.name || !editForm.price) return;
    onEditProduct(pId, {
      name: editForm.name,
      price: Number(editForm.price),
      category: editForm.category,
    });
    setEditingId(null);
  };

  return (
    <div className="shopkeeper-container">
      <div className="shopkeeper-header">
        <h2>Shopkeeper Dashboard</h2>

        <div className="status-controls">
          <button
            className={`status-toggle-btn ${shopStatus.isOpen ? "btn-open" : "btn-closed"}`}
            onClick={() => onToggleStatus("isOpen")}
          >
            Shop Status: {shopStatus.isOpen ? "OPEN" : "CLOSED"}
          </button>
          <button
            className={`status-toggle-btn ${shopStatus.acceptingOrders ? "btn-active" : "btn-paused"}`}
            onClick={() => onToggleStatus("acceptingOrders")}
          >
            Order Acceptance:{" "}
            {shopStatus.acceptingOrders ? "ACCEPTING" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      <form className="add-product-card" onSubmit={handleSubmitNew}>
        <h3>Add New Product</h3>

        <div className="form-grid">
          <div className="input-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="e.g., Basmati Rice 5kg"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Price (₹)</label>
            <input
              type="number"
              placeholder="e.g., 250"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Category</label>
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-product-btn">
          + Add Product
        </button>
      </form>

      {/* Manage Inventory Section */}
      <div className="inventory-section">
        <h3>Manage Inventory ({sortedProducts.length})</h3>

        {/* Search Bar (Identical to User Side) */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isFuzzyMatch={isFuzzyMatch}
          nearestKeyword={nearestKeyword}
        />

        <div className="management-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {sortedProducts.length === 0 ? (
          <p className="no-items-msg">No products match your search query.</p>
        ) : (
          <div className="manage-list">
            {sortedProducts.map((p) => {
              const pId = p._id || p.id;
              const isEditing = editingId === pId;

              return (
                <div key={pId} className="manage-item">
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="edit-mode-container">
                      <div className="edit-form-row">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Product Name"
                        />
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                          placeholder="Price"
                        />
                        <select
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                            })
                          }
                        >
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="action-btn-group">
                        <button
                          className="save-btn"
                          onClick={() => handleSaveEdit(pId)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Display Mode */
                    <>
                      <div className="item-info">
                        <span className="item-name">{p.name}</span>
                        <div className="item-meta">
                          <span className="item-price">₹{p.price}</span>
                          {p.category && (
                            <span className="item-category-tag">
                              {p.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="action-btn-group">
                        <button
                          className="edit-item-btn"
                          onClick={() => handleStartEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-item-btn"
                          onClick={() => onDeleteProduct(pId)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
