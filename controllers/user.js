const User = require("../models/user");
const Campground = require("../models/campground");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register"); // Rendering the registration form
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { email, username, password, name, tos, repeatPassword } = req.body;

    if (password !== repeatPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }

    if (!tos) {
      // Check if 'tos' is not truthy
      req.flash("error", "You must agree to the Terms of Service.");
      return res.redirect("/register");
    }

    const tosAccepted = tos === "true";
    const user = new User({ email, username, name, tosAccepted });

    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login"); // Rendering the login form
};

module.exports.loginUser = (req, res) => {
  // If authentication is successful, flash a welcome back message
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  // Redirect user to campgrounds page after successful login
  res.redirect(redirectUrl);
};

module.exports.renderProfile = async (req, res) => {
  // Extract the username from the request parameters
  const { username } = req.params;

  // Find the user by username
  const user = await User.findOne({ username: username });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/"); // Redirect to home or another appropriate page
  }

  // Find the campgrounds where the author field matches the user's id
  const campgrounds = await Campground.find({ author: user._id });

  // Render the profile page with the user object and their campgrounds
  res.render("users/profile", { user, campgrounds });
};

module.exports.logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

module.exports.renderEditProfile = async (req, res) => {
  // Extract the username from the request parameters
  const { username } = req.params;

  // Find the user by username
  const user = await User.findOne({ username: username });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/"); // Redirect to home or another appropriate page
  }

  // Render the edit profile page with the user object
  res.render("users/edit", { user });
};

module.exports.updateBio = async (req, res) => {
  const { username } = req.params;
  const { bio } = req.body;

  // Find user and update bio
  await User.findOneAndUpdate({ username: username }, { bio: bio });

  req.flash("success", "Bio updated successfully!");
  res.redirect(`/profile/${username}`);
};
