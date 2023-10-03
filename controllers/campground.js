// Import necessary dependencies
const Campground = require("../models/campground"); // Mongoose model for campgrounds.
const { cloudinary } = require("../cloudinary"); // Cloudinary configuration for image storage.

// ==============================
// CONTROLLERS FOR CAMPGROUND ROUTES
// ==============================

// Get all campgrounds and display them.
module.exports.index = async (req, res) => {
  // Retrieve all campgrounds from the database.
  const campgrounds = await Campground.find({});
  // Render the campgrounds index page and pass in the fetched campgrounds for display.
  res.render("campgrounds/index", { campgrounds });
};

// Render the form to create a new campground.
module.exports.renderCampgroundForm = (req, res) => {
  res.render("campgrounds/new");
};

// Handle the submission of a new campground.
module.exports.createCampground = async (req, res, next) => {
  // Extract campground data from the form and create a new Campground instance.
  const campground = new Campground(req.body.campground);
  // Process any uploaded images and assign them to the campground's image property.
  campground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // Assign the currently authenticated user as the campground's author.
  campground.author = req.user._id;
  // Save the created campground to the database.
  await campground.save();
  // Flash a success message to inform the user of successful campground creation.
  req.flash("success", "Successfully made a new campground!");
  // Redirect the user to the detail view of the newly created campground.
  res.redirect(`/campgrounds/${campground._id}`);
};

// Display the detailed information of a particular campground.
module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  // Fetch the campground by its ID and populate related reviews and author details.
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // If the fetched campground does not exist, flash an error message and redirect the user.
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Render the detailed view of the campground.
  res.render("campgrounds/show", { campground });
};

// Display the form to edit an existing campground.
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  // Retrieve the campground to be edited.
  const campground = await Campground.findById(id);
  // If the campground doesn't exist, flash an error and redirect.
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Render the edit form and pass in the campground data for pre-population.
  res.render("campgrounds/edit", { campground });
};

// Handle the submission of the edited campground form.
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // Update the campground data using the submitted form data.
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  // Process any new images that were uploaded.
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.image.push(...imgs);
  await campground.save();
  // Check for any images marked for deletion and remove them.
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      // Delete the image from the Cloudinary cloud storage.
      await cloudinary.uploader.destroy(filename);
    }
    // Update the campground's image array in the database to remove deleted images.
    await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
  }
  // Flash a success message and redirect the user to the updated campground's detail view.
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Handle the deletion of a campground.
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  // Delete the specified campground from the database.
  await Campground.findByIdAndDelete(id);
  // Flash a success message to inform the user of the successful deletion.
  req.flash("success", "Successfully deleted campground!");
  // Redirect the user back to the campgrounds index page.
  res.redirect("/campgrounds");
};
