const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

// Route to display the registration form
router.get("/register", (req, res) => {
  res.render("users/register"); // Rendering the registration form
});

// Route to register a new user
router.post(
  "/register",
  catchAsync(async (req, res) => {
    // Using the catchAsync utility to handle async operations
    try {
      // Destructuring relevant information from the request body
      const { email, username, password } = req.body;
      // Creating a new user instance with email and username (password will be handled by passport)
      const user = new User({ email, username });
      // Using passport's register method to handle password hashing and save the user to the database
      const registeredUser = await User.register(user, password);
      // Flash a welcome message to the user
      req.flash("success", "Welcome to Yelp Camp!");
      // Redirecting user to campgrounds page after successful registration
      res.redirect("/campgrounds");
    } catch (err) {
      // In case of an error, flash the error message
      req.flash("error", err.message);
      // Redirect user back to registration page
      res.redirect("/register");
    }
  })
);

// Route to display the login form
router.get("/login", (req, res) => {
  res.render("users/login"); // Rendering the login form
});

// Route to handle user login
router.post(
  "/login",
  // Using passport's authenticate method to validate user's credentials
  passport.authenticate("local", {
    failureFlash: true, // Flash an error message if authentication fails
    failureRedirect: "/login", // Redirect back to login page if authentication fails
  }),
  (req, res) => {
    // If authentication is successful, flash a welcome back message
    req.flash("success", "Welcome back!");
    // Redirect user to campgrounds page after successful login
    res.redirect("/campgrounds");
  }
);

module.exports = router;
