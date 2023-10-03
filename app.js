if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const sessionConfig = {
  name: "sesh",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, // only works on https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://cdn.jsdelivr.net",
];

const imgSrcUrls = [
  "https://res.cloudinary.com/dr6ra3p17/",
  "https://images.unsplash.com/",
];

const connectSrcUrls = ["https://res.cloudinary.com"];
const fontSrcUrls = ["https://cdn.jsdelivr.net"];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
        styleSrc: ["'self'", ...styleSrcUrls, "'unsafe-inline'"],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    },
  })
);

app.use(passport.initialize()); // sets up passport
app.use(passport.session()); // allows persistent login sessions
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy
passport.serializeUser(User.serializeUser()); // how to store a user in a session
passport.deserializeUser(User.deserializeUser()); // how to get a user out of a session

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const statusCode = 400; // Bad Request
    const errorMessage = messages.join(" ");
    return res.status(statusCode).render("error", {
      err: { message: errorMessage, statusCode: statusCode },
    });
  }

  if (err.name === "CastError") {
    const statusCode = 400; // Bad Request
    const errorMessage = "Invalid ID provided";
    return res.status(statusCode).render("error", {
      err: { message: errorMessage, statusCode: statusCode },
    });
  }

  // default error handling:
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
