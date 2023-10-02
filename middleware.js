const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");

module.exports.isLoggedIn = (req, res, next) => {
  // Ensure the user is authenticated before accessing the form
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // Store the url the user is requesting
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// Middleware to validate the campground data
module.exports.validateCampground = (req, res, next) => {
  console.log(req.body);
  const campground = req.body;
  // Validate the request body against the campground schema
  const { error } = campgroundSchema.validate(campground);
  if (error) {
    // Extract the validation error messages
    const msg = error.details.map((el) => el.message).join(",");
    // Throw an Express error with the validation messages and a 400 status
    throw new ExpressError(msg, 400);
  } else {
    // If there are no validation errors, proceed to the next middleware
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  // Extract the campground ID from the request parameters
  const { id } = req.params;
  // Find the campground by its ID
  const campground = await Campground.findById(id);
  // If the current user is not the author of the campground, flash an error message and redirect
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  // If the current user is the author of the campground, proceed to the next middleware
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  // Extract the campground ID from the request parameters
  const { reviewId } = req.params;
  // Find the campground by its ID
  const review = await Review.findById(reviewId);
  // If the current user is not the author of the campground, flash an error message and redirect
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  // If the current user is the author of the campground, proceed to the next middleware
  next();
};

// Middleware to validate incoming reviews against the reviewSchema
module.exports.validateReview = (req, res, next) => {
  // Using the reviewSchema to validate the incoming request body
  const { error } = reviewSchema.validate(req.body);
  // If there's an error, map through each error detail and create a message
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    // Throw a new ExpressError with the generated message and a 400 status code
    throw new ExpressError(msg, 400);
  } else {
    // If no errors, proceed to the next middleware
    next();
  }
};

module.exports.isProfileOwner = async (req, res, next) => {
  // Extract the username from the request parameters
  const { username } = req.params;
  // Retrieve the user with the given username
  const user = await User.findOne({ username: username });
  // If no user is found or if the logged-in user is not defined, redirect with an error
  if (!user || !req.user) {
    req.flash("error", "User not found or not logged in.");
    return res.redirect("/campgrounds");
  }
  // Check if the logged-in user's ID matches the retrieved user's ID
  if (!req.user._id.equals(user._id)) {
    req.flash("error", "You do not have permission to view this profile!");
    return res.redirect("/campgrounds");
  }
  // If the current user matches the profile, proceed to the next middleware
  next();
};
