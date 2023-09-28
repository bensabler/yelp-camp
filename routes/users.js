const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/user");
const user = require("../models/user");

// Route to display the registration form
router.get("/register", users.renderRegisterForm);

// Route to register a new user
router.post("/register", catchAsync(users.registerUser));

// Route to display the login form
router.get("/login", users.renderLoginForm);

// Route to handle user login
router.post(
  "/login",
  // use the storeReturnTo middleware to save the returnTo value from session to res.locals
  storeReturnTo,
  // passport.authenticate logs the user in and clears req.session
  // Using passport's authenticate method to validate user's credentials
  passport.authenticate("local", {
    failureFlash: true, // Flash an error message if authentication fails
    failureRedirect: "/login", // Redirect back to login page if authentication fails
  }),
  users.loginUser
);

// Route to handle user logout
router.get("/logout", users.logoutUser);

module.exports = router;
