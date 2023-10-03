// Import necessary models
const Review = require("../models/review"); // Mongoose model for reviews.
const Campground = require("../models/campground"); // Mongoose model for campgrounds.

// ==============================
// CONTROLLERS FOR REVIEW ROUTES
// ==============================

// Create a new review for a specific campground.
module.exports.createReview = async (req, res) => {
  // Retrieve the specified campground using its unique ID.
  const campground = await Campground.findById(req.params.id);

  // Create a new instance of the Review model using the submitted form data.
  const review = new Review(req.body.review);

  // Associate the currently authenticated user as the author of the new review.
  review.author = req.user._id;

  // Add the newly created review to the campground's collection of reviews.
  campground.reviews.push(review);

  // Persist the new review to the database.
  await review.save();

  // Save the changes made to the campground (i.e., the added review) in the database.
  await campground.save();

  // Provide feedback to the user indicating the successful creation of the review.
  req.flash("success", "Created new review!");

  // Redirect the user to the detailed view of the associated campground.
  res.redirect(`/campgrounds/${campground._id}`);
};

// Delete a specific review from a specific campground.
module.exports.deleteReview = async (req, res) => {
  // Destructure the campground's ID and the review's ID from the request's parameters.
  const { id, reviewId } = req.params;

  // Update the specified campground in the database by removing the specified review from its reviews collection.
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  // Permanently remove the specified review from the database.
  await Review.findByIdAndDelete(reviewId);

  // Provide feedback to the user indicating the successful deletion of the review.
  req.flash("success", "Successfully deleted review!");

  // Redirect the user back to the detailed view of the associated campground.
  res.redirect(`/campgrounds/${id}`);
};
