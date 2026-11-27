import React, { useState, useEffect, useRef } from "react";

import Header from "./Header";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Footer from "./Footer";

import { filterAndFuzzySearchProducts } from "../utils/fuzzySearch";

import { axios, BASE_URL } from "../services/auth";

function MainStore() {
  const [products, setProducts] = useState([]);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("user_cart");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);

  const [shopStatus, setShopStatus] = useState({
    isOpen: true,
    acceptingOrders: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const homeRef = useRef(null);
  const categoryRef = useRef(null);

  const orderingAllowed =
    shopStatus.isOpen === true && shopStatus.acceptingOrders === true;

  // Fetch products and listen for live shop status
  useEffect(() => {
    fetchProducts();

    let eventSource;

    try {
      eventSource = new EventSource(`${BASE_URL}/api/settings/stream`);

      eventSource.onmessage = (event) => {
        try {
          const liveStatus = JSON.parse(event.data);

          if (liveStatus && typeof liveStatus === "object") {
            setShopStatus((previous) => ({
              ...previous,
              ...liveStatus,
            }));
          }
        } catch (error) {
          console.error("Error parsing shop status:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (error) {
      console.error("SSE error:", error);
    }

    return () => eventSource?.close();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("user_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);

      setProducts([]);
    }
  };

  // Get product ID
  const getProductId = (product) => {
    return product?._id || product?.id || null;
  };

  // Add product to cart
  const handleAddToCart = (product, quantity = 1) => {
    if (!orderingAllowed) {
      alert(
        shopStatus.isOpen === false
          ? "The shop is currently closed."
          : "Orders are currently paused.",
      );

      return;
    }

    const productId = getProductId(product);

    if (!productId) return;

    setCartItems((previousItems) => {
      const existing = previousItems.find(
        (item) => getProductId(item) === productId,
      );

      if (existing) {
        return previousItems.map((item) =>
          getProductId(item) === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + Number(quantity || 1),
              }
            : item,
        );
      }

      return [
        ...previousItems,
        {
          ...product,
          quantity: Number(quantity) || 1,
        },
      ];
    });

    setCartAnimation(true);

    setTimeout(() => setCartAnimation(false), 700);
  };

  // Increase quantity
  const handleIncreaseQuantity = (product) => {
    handleAddToCart(product, 1);
  };

  // Decrease quantity
  const handleDecreaseQuantity = (product) => {
    const productId = getProductId(product);

    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          getProductId(item) === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 1) - 1,
              }
            : item,
        )
        .filter((item) => Number(item.quantity || 0) > 0),
    );
  };

  // Remove item
  const handleRemoveItem = (id) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => getProductId(item) !== id),
    );
  };

  // Get quantity of product in cart
  const getCartQuantity = (product) => {
    const productId = getProductId(product);

    const item = cartItems.find(
      (cartItem) => getProductId(cartItem) === productId,
    );

    return item ? Number(item.quantity || 0) : 0;
  };

  // Cart count
  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  // Search and category filtering
  const searchResult = filterAndFuzzySearchProducts(
    products,
    searchQuery,
    selectedCategory,
  );

  const filteredProducts = searchResult?.filteredProducts || [];

  // Scroll to home
  const scrollToHome = () => {
    homeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Scroll to category
  const scrollToCategory = () => {
    categoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="app-container" ref={homeRef}>
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        shopStatus={shopStatus}
        cartAnimation={cartAnimation}
      />

      <section className="store-search-section">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isFuzzyMatch={searchResult?.isFuzzyMatch || false}
          nearestKeyword={searchResult?.nearestKeyword || ""}
        />

        <div ref={categoryRef}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {!orderingAllowed && (
        <div
          style={{
            margin: "1rem auto",
            maxWidth: "1200px",
            padding: "0.9rem 1rem",
            borderRadius: "14px",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {shopStatus.isOpen === false
            ? "🔴 Shop is currently closed. Ordering is unavailable."
            : "⏸️ Orders are currently paused. Please try again later."}
        </div>
      )}

      <main className="main-content">
        <ProductList
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          getCartQuantity={getCartQuantity}
          isOrderingAllowed={orderingAllowed}
          searchQuery={searchQuery}
        />
      </main>

      {isCartOpen && (
        <Cart
          isOpen={isCartOpen}
          cartItems={cartItems}
          setCartItems={setCartItems}
          onClose={() => setIsCartOpen(false)}
        />
      )}

      <Footer
        cartCount={cartCount}
        onHome={scrollToHome}
        onCategory={scrollToCategory}
        onCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}

export default MainStore;
