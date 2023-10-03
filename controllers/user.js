// Import necessary models
const User = require("../models/user"); // Mongoose model for users.
const Campground = require("../models/campground"); // Mongoose model for campgrounds.

// =====================================
// CONTROLLERS FOR USER-RELATED ROUTES
// =====================================

// Controller to render the user registration form
module.exports.renderRegisterForm = (req, res) => {
  // Render the registration view for users
  res.render("users/register");
};

// Controller to handle user registration logic
module.exports.registerUser = async (req, res, next) => {
  try {
    // Destructure fields from the request's body
    const { email, username, password, name, tos, repeatPassword } = req.body;

    // Check for password consistency
    if (password !== repeatPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }

    // Ensure user accepts the Terms of Service
    if (!tos) {
      req.flash("error", "You must agree to the Terms of Service.");
      return res.redirect("/register");
    }

    // Create a new User instance
    const tosAccepted = tos === "true";
    const user = new User({ email, username, name, tosAccepted });

    // Use Passport's register method to save user with hashed password
    const registeredUser = await User.register(user, password);

    // Log the registered user in
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
};

// Controller to render the login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

// Controller to handle user login logic
module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Controller to display a user's profile page
module.exports.renderProfile = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  }

  const campgrounds = await Campground.find({ author: user._id });
  res.render("users/profile", { user, campgrounds });
};

// Controller to handle user logout
module.exports.logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

// Controller to render the edit profile form for a user
module.exports.renderEditProfile = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  }

  res.render("users/edit", { user });
};

// Controller to handle updating the bio of a user
module.exports.updateBio = async (req, res) => {
  const { username } = req.params;
  const { bio } = req.body;

  // Update user's bio in the database
  await User.findOneAndUpdate({ username: username }, { bio: bio });

  req.flash("success", "Bio updated successfully!");
  res.redirect(`/profile/${username}`);
};
