import React, { useState } from "react";
import axios from "axios";
import "./ShopkeeperLogin.css";

export default function ShopkeeperLogin({ isOpen = true, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      const token = response.data?.token;

      if (!token) {
        throw new Error("Login token was not returned by the server.");
      }

      localStorage.setItem("shopkeeper_token", token);
      localStorage.setItem(
        "shopkeeper_user",
        JSON.stringify(response.data?.user || { username: username.trim() }),
      );

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      setPassword("");
      onLoginSuccess?.(response.data?.user);
    } catch (err) {
      console.error("Shopkeeper login error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your username and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        {onClose && (
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "2rem" }}>🔐</div>
          <h2>Shopkeeper Login</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Authorized access only
          </p>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shopkeeper-username">Username</label>
            <input
              id="shopkeeper-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopkeeper-password">Password</label>
            <input
              id="shopkeeper-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? "Checking..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
