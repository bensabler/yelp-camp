const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campground");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  // Route to display all campgrounds
  .get(catchAsync(campgrounds.index))
  // Route to handle the creation of a new campground
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// Route to display the form for creating a new campground
router.get("/new", isLoggedIn, campgrounds.renderCampgroundForm);

router
  .route("/:id")
  // Route to display the details of a specific campground by its ID
  .get(catchAsync(campgrounds.showCampground))
  // Route to handle the updating of a specific campground
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // Route to handle the deletion of a specific campground
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Route to display the edit form for a specific campground
router.get(
  "/:id/edit",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
