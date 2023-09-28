const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
  // Fetch all campgrounds from the database
  const campgrounds = await Campground.find({});
  // Render the campgrounds index view with the retrieved campgrounds
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderCampgroundForm = (req, res) => {
  // Render the new campground form
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // Create a new Campground instance with the request body data
  const campground = new Campground(req.body.campground);
  // Set the author of the campground to the current user
  campground.author = req.user._id;
  // Save the new campground to the database
  await campground.save();
  // Flash a success message and redirect to the campground's details page
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  // Extract the campground ID from the request parameters
  const { id } = req.params;
  // Find the campground with the provided ID
  // Populate the author of the campground and the reviews associated with it
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // If the campground does not exist, flash an error message and redirect
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Render the campground details view with the retrieved campground
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  // Extract the campground ID from the request parameters
  const { id } = req.params;
  // Find the campground with the provided ID
  const campground = await Campground.findById(id);
  // If the campground does not exist, flash an error message and redirect
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Render the edit form for the found campground
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  // Extract the campground ID from the request parameters
  const { id } = req.params;
  // Update the campground with the provided data from the request body
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  // Flash a success message and redirect to the updated campground's details page
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  // Extract the campground ID from the request parameters
  const { id } = req.params;
  // Remove the campground from the database
  await Campground.findByIdAndDelete(id);
  // Flash a success message and redirect to the campgrounds index
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
