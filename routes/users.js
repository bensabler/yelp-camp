const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

// show the register form
router.get("/register", (req, res) => {
  res.render("users/register"); // render the register form
});

// register a new user
router.post(
  "/register",
  // wrapper that allows us to catch errors
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body; // destructure from req.body
      const user = new User({ email, username }); // create a new user
      const registeredUser = await User.register(user, password); // register the user with passport
      req.flash("success", "Welcome to Yelp Camp!"); // flash a success message
      res.redirect("/campgrounds"); // redirect to /campgrounds
    } catch (err) {
      req.flash("error", err.message); // flash an error message
      res.redirect("/register"); // redirect to /register
    }
  })
);

module.exports = router;
