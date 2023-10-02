// Importing the campground model
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// Controller to fetch and display all campgrounds
module.exports.index = async (req, res) => {
  // Fetching all the campgrounds from the database
  const campgrounds = await Campground.find({});

  // Rendering the index view and passing in the fetched campgrounds
  res.render("campgrounds/index", { campgrounds });
};

// Controller to render the new campground form
module.exports.renderCampgroundForm = (req, res) => {
  res.render("campgrounds/new");
};

// Controller to handle creation of a new campground
module.exports.createCampground = async (req, res, next) => {
  // Create a new instance of the Campground model using the form data
  const campground = new Campground(req.body.campground);
  // Process uploaded images, setting URLs and filenames for the campground
  campground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // Set the author to the currently logged-in user
  campground.author = req.user._id;
  // Save the new campground instance to the database
  await campground.save();
  // Flash a success message and redirect to the new campground's detail page
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Controller to display details of a single campground
module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  // Fetch the campground by its ID, populating its reviews and authors
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // If the campground isn't found, display an error and redirect
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  // Render the campground's detail view
  res.render("campgrounds/show", { campground });
};

// Controller to render the edit form for a campground
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

// Controller to handle updating a campground
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // Find the campground by its ID and update it with the new data
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.image.push(...imgs);
  // Save the updated campground to the database
  await campground.save();
  // If any images were deleted, delete them from the database
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Controller to handle deleting a campground
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  // Find the campground by its ID and delete it
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
