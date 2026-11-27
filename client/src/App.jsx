import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainStore from "./components/MainStore";
import ShopkeeperRoute from "./components/ShopkeeperRoute";

import OrderPortal from "./components/OrderPortal";
import Checkout from "./components/Checkout";
import CustomerOrders from "./components/CustomerOrders";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Store */}
        <Route path="/" element={<MainStore />} />

        {/* Orders */}
        <Route path="/orders" element={<OrderPortal />} />

        {/* Shopkeeper Dashboard */}
        <Route path="/shopkeeper" element={<ShopkeeperRoute />} />

        {/* Old admin URL */}
        <Route path="/admin" element={<Navigate to="/shopkeeper" replace />} />

        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Customer Orders */}
        <Route path="/my-orders" element={<CustomerOrders />} />

        {/* Invalid URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
