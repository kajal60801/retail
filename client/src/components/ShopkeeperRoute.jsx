import React, { useEffect, useState } from "react";

import Header from "./Header";
import ShopkeeperPanel from "./ShopkeeperPanel";
import ShopkeeperLogin from "./ShopkeeperLogin";

import {
  axios,
  getShopkeeperToken,
  setShopkeeperToken,
} from "../services/auth";

function ShopkeeperRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getShopkeeperToken()),
  );

  const [products, setProducts] = useState([]);

  const [shopStatus, setShopStatus] = useState({
    isOpen: true,
    acceptingOrders: true,
  });

  // Load shopkeeper data after login
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchProducts();
    fetchShopStatus();
  }, [isAuthenticated]);

  // Logout
  const logout = () => {
    setShopkeeperToken(null);
    setIsAuthenticated(false);
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }

      console.error("Error fetching products:", error);
    }
  };

  // Fetch shop status
  const fetchShopStatus = async () => {
    try {
      const response = await axios.get("/api/settings");

      setShopStatus((previous) => ({
        ...previous,
        ...response.data,
      }));
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // Toggle shop status
  const handleToggleStatus = async (key) => {
    const previousStatus = shopStatus;

    const updatedStatus = {
      ...previousStatus,
      [key]: !previousStatus[key],
    };

    setShopStatus(updatedStatus);

    try {
      const response = await axios.put("/api/settings", updatedStatus);

      setShopStatus(response.data?.settings || response.data || updatedStatus);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }

      console.error("Error updating shop settings:", error);

      setShopStatus(previousStatus);

      alert("Unable to update shop status. Please try again.");
    }
  };

  // Add product
  const addProduct = async (product) => {
    try {
      const response = await axios.post("/api/products", product);

      setProducts((previous) => [...previous, response.data]);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        alert(error.response?.data?.message || "Unable to add product.");
      }
    }
  };

  // Edit product
  const editProduct = async (id, updatedData) => {
    try {
      await axios.put(`/api/products/${id}`, updatedData);

      setProducts((previous) =>
        previous.map((product) =>
          (product._id || product.id) === id
            ? {
                ...product,
                ...updatedData,
              }
            : product,
        ),
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        alert(error.response?.data?.message || "Unable to edit product.");
      }
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);

      setProducts((previous) =>
        previous.filter((product) => (product._id || product.id) !== id),
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        alert(error.response?.data?.message || "Unable to delete product.");
      }
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <ShopkeeperLogin
        isOpen
        onClose={() => (window.location.href = "/")}
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="app-container">
      <Header cartCount={0} onOpenCart={() => {}} shopStatus={shopStatus} />

      <main className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => (window.location.href = "/orders")}
            style={{
              padding: "0.7rem 1rem",
              borderRadius: "10px",
              border: "0",
              cursor: "pointer",
            }}
          >
            📋 Show Orders
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              padding: "0.7rem 1rem",
              borderRadius: "10px",
              border: "0",
              cursor: "pointer",
            }}
          >
            🔒 Logout
          </button>
        </div>

        <ShopkeeperPanel
          products={products}
          onAddProduct={addProduct}
          onEditProduct={editProduct}
          onDeleteProduct={deleteProduct}
          shopStatus={shopStatus}
          onToggleStatus={handleToggleStatus}
        />
      </main>
    </div>
  );
}

export default ShopkeeperRoute;
