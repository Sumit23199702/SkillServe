const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  otpLogin,
  googleLogin,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  blockUnblockUser,
  changePassword,
} = require("../controllers/userController");

let authentication = require("../middlewares/authMiddleware");
let authorization = require("../middlewares/authorization");

// Public Routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Get Own Profile (LoggedIn User)
router.get("/profile", authentication, getUserProfile);

// Get All User Profile (For Admin)
router.get("/allUsers", authentication, authorization("admin"), getAllUsers);

// Delete Self
router.delete("/deleteProfile", authentication, deleteUser);

// Admin delete user
router.delete(
  "/user/:userId",
  authentication,
  authorization("admin"),
  deleteUser
);

// Block Unblock User (For Admin)
router.put(
  "/user/block/:userId",
  authentication,
  authorization("admin"),
  blockUnblockUser
);

// Password Change
router.put("/change-password", authentication, changePassword);

module.exports = router;
