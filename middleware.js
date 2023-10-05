// Required modules and schemas are imported for later use.
const { campgroundSchema, reviewSchema, userSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError"); // A utility to structure Express-related errors more effectively.
const Campground = require("./models/campground"); // Mongoose model for campgrounds.
const Review = require("./models/review"); // Mongoose model for reviews.
const User = require("./models/user"); // Mongoose model for users.

// Middleware to check if a user is logged in.
module.exports.isLoggedIn = (req, res, next) => {
  // The `req.isAuthenticated()` method is provided by Passport and checks if the user is authenticated.
  if (!req.isAuthenticated()) {
    // If not authenticated, save the attempted URL to the session for post-login redirection.
    req.session.returnTo = req.originalUrl;
    // Notify the user about the need to be logged in.
    req.flash("error", "You must be signed in first!");
    // Redirect the user to the login page.
    return res.redirect("/login");
  }
  // If authenticated, proceed to the route handler or the next middleware.
  next();
};

// Middleware to store the return URL for potential post-login redirection.
module.exports.storeReturnTo = (req, res, next) => {
  // If there's a URL in the session, make it accessible to views through `res.locals`.
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// Middleware to validate campground data against a predefined schema.
module.exports.validateCampground = (req, res, next) => {
  // Validate data against the Joi campgroundSchema.
  const { error } = campgroundSchema.validate(req.body);
  // If there's a validation error, handle it by creating a custom error message.
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};

// This middleware ensures that the user trying to make changes to a campground
// is the actual author (creator) of that campground.
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params; // Extract campground ID from route parameters.
  const campground = await Campground.findById(id); // Retrieve the specific campground from the database using its ID.
  // Check if the current user's ID doesn't match the author ID of the retrieved campground.
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!"); // Display an error message.
    return res.redirect(`/campgrounds/${id}`); // Redirect back to that campground's page.
  }
  next(); // If user is the author, continue to the next function or middleware.
};

// Similar to the above, this middleware ensures that the user trying to make
// changes to a review is the actual author (creator) of that review.
module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params; // Extract review ID from route parameters.
  const review = await Review.findById(reviewId); // Retrieve the specific review from the database using its ID.
  // Check if the current user's ID doesn't match the author ID of the retrieved review.
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!"); // Display an error message.
    return res.redirect(`/campgrounds/${id}`); // Redirect back to the associated campground's page.
  }
  next(); // If user is the author, continue to the next function or middleware.
};

// This middleware validates the incoming review data against a predefined schema.
// It helps ensure that users provide all required fields in the correct format.
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // Validate the incoming data using the review schema.
  // If there are validation errors...
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); // Combine all error messages into one string.
    throw new ExpressError(msg, 400); // Use the custom error handling class to throw the error with a status of 400.
  }
  next(); // If data is valid, proceed to the next middleware or function.
};

// This middleware ensures that the user accessing a profile is the owner of that profile.
// It prevents users from viewing/editing profiles of other users.
module.exports.isProfileOwner = async (req, res, next) => {
  const { username } = req.params; // Extract the username from route parameters.
  const user = await User.findOne({ username }); // Find the user associated with that username.
  // Check for a matching user and ensure that the logged-in user is the same as the retrieved user.
  if (!user || !req.user || !req.user._id.equals(user._id)) {
    req.flash(
      "error",
      !user || !req.user
        ? "User not found or not logged in."
        : "You do not have permission to view this profile!"
    ); // Display the appropriate error message.
    return res.redirect("/campgrounds"); // Redirect to the campgrounds page.
  }
  next(); // If all checks pass, proceed.
};

// This middleware ensures users don't upload more than a set number of images (in this case, 10)
// when creating or editing a campground.
module.exports.limitImageUpload = (req, res, next) => {
  if (req.files.length > 10) {
    // If more than 10 files are included in the request...
    req.flash("error", "You can upload a maximum of 10 images per campground."); // Inform the user of the limit.
    return res.redirect("back"); // Redirect them to the previous page.
  }
  next(); // If within limit, proceed.
};

// Validates user registration data. Ensures that incoming user data,
// like email and username, meets certain criteria for security and consistency.
module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body); // Validate the incoming user data against the predefined schema.
  console.log(req.body);
  if (req.body.password !== req.body.repeat_password) {
    console.error("Passwords do not actually match!");
  }
  // If there are validation errors...
  if (error) {
    // If there are validation errors...
    const msg = error.details.map((el) => el.message).join(","); // Aggregate error messages.
    throw new ExpressError(msg, 400); // Throw an error with a 400 status.
  }
  next(); // If data is valid, proceed.
};
