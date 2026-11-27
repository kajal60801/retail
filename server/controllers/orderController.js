const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "../data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const readShopSettings = () => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return { isOpen: true, acceptingOrders: true };
    }

    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));

    return {
      isOpen: data?.isOpen !== false,
      acceptingOrders: data?.acceptingOrders !== false,
    };
  } catch (error) {
    console.error("Error reading shop settings:", error);
    return { isOpen: true, acceptingOrders: true };
  }
};

const readJsonFile = (filePath, fallbackValue = []) => {
  try {
    if (!fs.existsSync(filePath)) return fallbackValue;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || JSON.stringify(fallbackValue));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallbackValue;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    throw err;
  }
};

const generateOrderId = (orders) => {
  const now = new Date();
  const datePart = `${String(now.getFullYear()).slice(-2)}${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  let orderId;
  do {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    orderId = `DNS-${datePart}-${randomPart}`;
  } while (orders.some((order) => order.orderId === orderId));

  return orderId;
};

// POST /api/orders
exports.createOrder = (req, res) => {
  try {
    const shopSettings = readShopSettings();

    if (!shopSettings.isOpen) {
      return res.status(403).json({
        error: "The shop is currently closed and cannot accept orders.",
        code: "SHOP_CLOSED",
      });
    }

    if (!shopSettings.acceptingOrders) {
      return res.status(403).json({
        error: "The shop is currently not accepting orders.",
        code: "ORDERS_PAUSED",
      });
    }
    const {
      customerName,
      contactNumber,
      cartItems,
      totalAmount,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    if (
      !customerName ||
      !contactNumber ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return res.status(400).json({
        error: "Invalid order details",
      });
    }

    const orders = readJsonFile(ORDERS_FILE, []);
    const orderId = generateOrderId(orders);

    const verifiedTotal = cartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );

    const newOrder = {
      orderId,
      customerName: String(customerName).trim(),
      contactNumber: String(contactNumber).trim(),
      cartItems: cartItems.map((item) => ({
        productId: item._id || item.id || null,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image: item.image || item.imageUrl || null,
      })),
      totalAmount: verifiedTotal,
      paymentMethod,
      createdAt: new Date().toISOString(),
      status: "Placed",
    };

    orders.push(newOrder);
    writeJsonFile(ORDERS_FILE, orders);

    return res.status(201).json({
      message: "Order created successfully",
      orderId,
      order: newOrder,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({
      error: "Failed to create order",
    });
  }
};

// GET /api/orders
exports.getAllOrders = (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    res.json(orders.slice().reverse());
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET /api/orders/customer/:contactNumber
exports.getCustomerOrders = (req, res) => {
  try {
    const contactNumber = String(req.params.contactNumber || "").replace(/\D/g, "");

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const orders = readJsonFile(ORDERS_FILE, []);

    const customerOrders = orders
      .filter(
        (order) =>
          String(order.contactNumber || "").replace(/\D/g, "") === contactNumber,
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(customerOrders);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({ error: "Failed to fetch customer orders" });
  }
};

// GET /api/orders/:orderId
exports.getOrderById = (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const order = orders.find((o) => o.orderId === req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching single order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// PUT /api/orders/:orderId
exports.updateOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Placed",
      "Confirmed",
      "Preparing",
      "Ready",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid order status",
      });
    }

    let orders = readJsonFile(ORDERS_FILE, []);
    let updatedOrder = null;

    orders = orders.map((order) => {
      if (order.orderId === orderId) {
        updatedOrder = {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return order;
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    writeJsonFile(ORDERS_FILE, orders);

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// DELETE /api/orders/:orderId
exports.deleteOrder = (req, res) => {
  try {
    const { orderId } = req.params;
    let orders = readJsonFile(ORDERS_FILE, []);

    const initialLength = orders.length;
    orders = orders.filter((order) => order.orderId !== orderId);

    if (orders.length === initialLength) {
      return res.status(404).json({ error: "Order not found" });
    }

    writeJsonFile(ORDERS_FILE, orders);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
