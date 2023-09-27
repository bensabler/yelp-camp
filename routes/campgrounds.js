const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const Campground = require("../models/campground");

// Route to display all campgrounds
router.get(
  "/",
  catchAsync(async (req, res) => {
    // Fetch all campgrounds from the database
    const campgrounds = await Campground.find({});
    // Render the campgrounds index view with the retrieved campgrounds
    res.render("campgrounds/index", { campgrounds });
  })
);

// Route to display the form for creating a new campground
router.get("/new", isLoggedIn, (req, res) => {
  // Render the form for a new campground
  res.render("campgrounds/new");
});

// Route to handle the creation of a new campground
router.post(
  "/",
  // Ensure the user is authenticated before access
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    // Create a new Campground instance with the request body data
    const campground = new Campground(req.body.campground);
    // Set the author of the campground to the current user
    campground.author = req.user._id;
    // Save the new campground to the database
    await campground.save();
    // Flash a success message and redirect to the campground's details page
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Route to display the details of a specific campground by its ID
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    // Find the campground by its ID and populate the associated reviews
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    console.log(campground);
    // If the campground does not exist, flash an error message and redirect to the campgrounds index
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    // Render the details view for the found campground
    res.render("campgrounds/show", { campground });
  })
);

// Route to display the edit form for a specific campground
router.get(
  "/:id/edit",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // If the campground does not exist, flash an error message and redirect
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    // Render the edit form for the found campground
    res.render("campgrounds/edit", { campground });
  })
);

// Route to handle the updating of a specific campground
router.put(
  "/:id",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    // Extract the campground ID from the request parameters
    const { id } = req.params;
    // Update the campground with the provided data from the request body
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    // Flash a success message and redirect to the updated campground's details page
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Route to handle the deletion of a specific campground
router.delete(
  "/:id",
  // Ensure the user is authenticated before access
  isLoggedIn,
  // Ensure the user is the author of the campground before access
  isAuthor,
  catchAsync(async (req, res) => {
    // Extract the campground ID from the request parameters
    const { id } = req.params;
    // Remove the campground from the database
    await Campground.findByIdAndDelete(id);
    // Flash a success message and redirect to the campgrounds index
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
