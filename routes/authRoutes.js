import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Private
router.get("/profile", protect, getUserProfile);

// Admin routes
router.route("/users").get(protect, admin, getUsers);
router
  .route("/users/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
