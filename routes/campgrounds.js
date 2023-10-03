// Import necessary modules for routing and functionality
const express = require("express");
const router = express.Router(); // Create a new Express router
const campgrounds = require("../controllers/campground"); // Campground controller functions
const catchAsync = require("../utils/catchAsync"); // Error handling wrapper function
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
  limitImageUpload,
} = require("../middleware"); // Middleware functions for routes
const multer = require("multer"); // Middleware for handling `multipart/form-data`
const { storage } = require("../cloudinary"); // Cloudinary storage setup
const upload = multer({ storage }); // Configure multer with the Cloudinary storage option

// ROUTES FOR CRUD OPERATIONS ON CAMPGROUNDS

router
  .route("/")
  // GET request to display all the campgrounds
  .get(catchAsync(campgrounds.index))
  // POST request to handle the creation of a new campground
  // Uses multiple middleware to:
  //   1. Check user is logged in
  //   2. Handle image uploads using multer and Cloudinary
  //   3. Limit the number of images being uploaded
  //   4. Validate the campground data
  .post(
    isLoggedIn,
    upload.array("image"), // Allows for an array of images to be uploaded
    limitImageUpload, // Ensures user does not upload more than 10 images
    validateCampground, // Validates the campground against a predefined schema
    catchAsync(campgrounds.createCampground) // Calls the function to create a campground in the database
  );

// GET request to display the form for creating a new campground
router.get("/new", isLoggedIn, campgrounds.renderCampgroundForm);

router
  .route("/:id")
  // GET request to display a specific campground based on its ID
  .get(catchAsync(campgrounds.showCampground))
  // PUT request to handle updating a specific campground based on its ID
  // Uses multiple middleware to:
  //   1. Check user is logged in and is the author of the campground
  //   2. Handle image uploads and set limits
  //   3. Validate the updated campground data
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    limitImageUpload,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // DELETE request to handle removal of a specific campground based on its ID
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// GET request to display the edit form for a specific campground based on its ID
// Middleware ensures the user is both logged in and the author of the campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// Export the router to be used in the main application
module.exports = router;
