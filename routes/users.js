// Importing necessary libraries and modules for routing, user authentication, error handling, and more.
const express = require("express");
const router = express.Router(); // Initialize a new Express router to manage user routes.
const passport = require("passport"); // Passport library to handle user authentication.
const catchAsync = require("../utils/catchAsync"); // Utility to catch errors in asynchronous functions and pass them to Express error handlers.
const {
  storeReturnTo,
  isLoggedIn,
  isProfileOwner,
  validateUser,
} = require("../middleware"); // Importing middleware functions to validate user input, check if user is logged in, and other functionalities.
const users = require("../controllers/user"); // Controller functions related to user operations.

// ROUTES FOR USER REGISTRATION, LOGIN, AND PROFILE OPERATIONS

// REGISTRATION ROUTES:

router
  .route("/register")
  // Display the registration form to the user:
  .get(users.renderRegisterForm)
  // Process user registration:
  // The validateUser middleware ensures that the data provided by the user during registration meets specific criteria.
  // The registerUser controller function handles the actual process of registering the user in the database.
  .post(validateUser, catchAsync(users.registerUser));

// LOGIN ROUTES:

router
  .route("/login")
  // Display the login form to the user:
  .get(users.renderLoginForm)
  // Process user login:
  // 1. The storeReturnTo middleware saves the previous page's URL (if any) before login so the user can be redirected back after successful authentication.
  // 2. passport.authenticate checks the provided credentials against the stored user data. If there's a match, the user is logged in.
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true, // Provide feedback if login fails.
      failureRedirect: "/login", // Redirect back to the login page if authentication fails.
    }),
    users.loginUser // If authentication succeeds, this function continues the login process, such as setting user sessions.
  );

// PROFILE ROUTE:

// Render the user's profile page:
// The isLoggedIn middleware ensures that a user must be logged in to view profiles.
router.get("/profile/:username", isLoggedIn, catchAsync(users.renderProfile));

// UPDATE BIO ROUTE:

// Allows users to update their biography on their profile:
// isLoggedIn ensures only logged-in users can update profiles.
// isProfileOwner ensures users can only edit their own profile.
router.post(
  "/profile/:username/editBio",
  isLoggedIn,
  isProfileOwner,
  catchAsync(users.updateBio)
);

// LOGOUT ROUTE:

// Handles user logout, clearing their session and redirecting them as necessary.
router.get("/logout", users.logoutUser);

// Export the router so it can be used by the main application.
module.exports = router;
