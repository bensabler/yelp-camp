module.exports.isLoggedIn = (req, res, next) => {
  // Ensure the user is authenticated before accessing the form
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // Store the url the user is requesting
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
