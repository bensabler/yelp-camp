const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { validateReview } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");

// Route to post a new review
router.post(
  "/",
  // First, validate the review using the validateReview middleware
  validateReview,
  // Use the catchAsync utility to handle asynchronous functions
  catchAsync(async (req, res) => {
    // Find the campground by its ID
    const campground = await Campground.findById(req.params.id);
    // Create a new review using the incoming request body
    const review = new Review(req.body.review);
    // Add the new review to the campground's reviews array
    campground.reviews.push(review);
    // Save the review to the database
    await review.save();
    // Save the updated campground to the database
    await campground.save();
    // Flash a success message to the user
    req.flash("success", "Created new review!");
    // Redirect the user to the campground's page
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Route to delete a review
router.delete(
  "/:reviewId",
  // Use the catchAsync utility to handle asynchronous functions
  catchAsync(async (req, res) => {
    // Extract the campground ID and review ID from the request parameters
    const { id, reviewId } = req.params;
    // Find the campground by its ID and pull (remove) the review from its reviews array
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    // Delete the review from the database
    await Review.findByIdAndDelete(reviewId);
    // Flash a success message to the user
    req.flash("success", "Successfully deleted review!");
    // Redirect the user back to the campground's page
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
