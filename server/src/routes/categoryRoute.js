const express = require("express");
const router = express.Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} = require("../controllers/categoryController");

const authentication = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorization");

// For Admin Only
router.post(
  "/categories/add",
  authentication,
  authorization("admin"),
  createCategory
);
router.put(
  "/categories/:id",
  authentication,
  authorization("admin"),
  updateCategory
);
router.delete(
  "/categories/:id",
  authentication,
  authorization("admin"),
  deleteCategory
);

// Public Routes
router.get("/allCategories", getAllCategories);
router.get("/getCategory/:id", getCategoryById);

module.exports = router;
