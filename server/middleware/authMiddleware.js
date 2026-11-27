const jwt = require("jsonwebtoken");

const JWT_SECRET = "DailyNeedStore_SuperSecret_Key_2026_ChangeThis";

const requireShopkeeperAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "shopkeeper") {
      return res.status(403).json({
        success: false,
        message: "Shopkeeper access required.",
      });
    }

    req.shopkeeper = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = requireShopkeeperAuth;
