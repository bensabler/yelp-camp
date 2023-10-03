// Import necessary modules for routing and functionality
const express = require("express");
// Create a new Express router, merging parameters from parent routes
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync"); // Error handling wrapper function
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware"); // Middleware functions for routes
const reviews = require("../controllers/reviews"); // Review controller functions

// ROUTES FOR CRUD OPERATIONS ON REVIEWS

// POST ROUTE FOR REVIEWS

// POST request to create a new review for a specific campground
router.post(
  "/",
  // Ensure the user is authenticated before they can post a review
  isLoggedIn,
  // Validate the review data using the validateReview middleware before processing it
  validateReview,
  // If the review data is valid, call the createReview method from the reviews controller to add the review
  // The catchAsync function wraps the method to catch any errors and forward them to the global error handler
  catchAsync(reviews.createReview)
);

// DELETE ROUTE FOR REVIEWS

// DELETE request to remove a specific review by its ID
router.delete(
  "/:reviewId",
  // Ensure the user is authenticated before they can delete a review
  isLoggedIn,
  // Ensure the logged-in user is the author of the review they're trying to delete
  isReviewAuthor,
  // If authorized, call the deleteReview method from the reviews controller to remove the review
  // The catchAsync function wraps the method to catch any errors and forward them to the global error handler
  catchAsync(reviews.deleteReview)
);

// Export the router to be used in the main application
module.exports = router;
