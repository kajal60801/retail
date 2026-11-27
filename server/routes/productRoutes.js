const express = require("express");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Public: customers can browse products.
router.get("/", getProducts);

// Protected: only authenticated shopkeepers can modify inventory.
router.post("/", requireAuth, createProduct);
router.put("/:id", requireAuth, updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

module.exports = router;
