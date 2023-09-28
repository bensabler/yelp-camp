const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campground");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// Route to display all campgrounds
router.get("/", catchAsync(campgrounds.index));

// Route to display the form for creating a new campground
router.get("/new", isLoggedIn, campgrounds.renderCampgroundForm);

// Route to handle the creation of a new campground
router.post(
  "/",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Validate the campground data before creation
  validateCampground,
  // Create the new campground
  catchAsync(campgrounds.createCampground)
);

// Route to display the details of a specific campground by its ID
router.get("/:id", catchAsync(campgrounds.showCampground));

// Route to display the edit form for a specific campground
router.get(
  "/:id/edit",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// Route to handle the updating of a specific campground
router.put(
  "/:id",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

// Route to handle the deletion of a specific campground
router.delete(
  "/:id",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
