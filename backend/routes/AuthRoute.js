const express = require('express');
const AuthController = require("../controllers/AuthController.js");

const router = express.Router();

// Register route
router.post("/register", AuthController.register);
// Login route
router.post("/login", AuthController.login);
// Google OAuth route
router.post("/google", AuthController.googleLogin);
// // Forgot password route
// router.post("/forgot-password", AuthController.forgotPassword);
// // Get user profile route
// router.get("/profile", protect, AuthController.getProfile);

module.exports = router;