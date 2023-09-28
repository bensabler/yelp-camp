const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

// Route to post a new review
router.post(
  "/",
  // First, ensure the user is logged in using the isLoggedIn middleware
  isLoggedIn,
  // First, validate the review using the validateReview middleware
  validateReview,
  // Use the catchAsync utility to handle asynchronous functions
  catchAsync(reviews.createReview)
);

// Route to delete a review
router.delete(
  "/:reviewId",
  // First, ensure the user is logged in using the isLoggedIn middleware
  isLoggedIn,
  // Next, ensure the user is the author of the review using the isReviewAuthor middleware
  isReviewAuthor,
  // Use the catchAsync utility to handle asynchronous functions
  catchAsync(reviews.deleteReview)
);

module.exports = router;
