// Load environment variables from .env file if not in production mode
if (process.env.NODE_ENV !== "production") {
  // The dotenv library is used to load environment variables from a `.env` file into the `process.env` object in Node.
  // The conditional check ensures that this only happens when the application is NOT running in a production environment.
  // This is a common practice to protect sensitive data in production.
  require("dotenv").config();
}

// The `express` library provides a robust set of features for web and mobile applications.
const express = require("express");

// The `path` module provides utilities for working with file and directory paths.
// It's a core Node.js module, so no need to install it separately.
const path = require("path");

// The `mongoose` library provides a straight-forward, schema-based solution to model your application data with MongoDB.
const mongoose = require("mongoose");

// `ejs-mate` is an express.js view engine which supports "layout", "partials" and "block" templates.
// It's a helper for EJS templates.
const ejsMate = require("ejs-mate");

// `express-session` is used to manage session for Express applications.
// Session data is stored server-side, but can be stored client-side if configured to do so.
const session = require("express-session");

// `connect-mongo` is a MongoDB session store for Express.
// It uses MongoDB to store session data.
const MongoStore = require("connect-mongo");

// The `connect-flash` middleware is used to store temporary messages.
// Messages are saved in the session and can be extracted in views and then deleted.
const flash = require("connect-flash");

// `ExpressError` is a custom utility for handling exceptions.
const ExpressError = require("./utils/ExpressError");

// `method-override` lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
const methodOverride = require("method-override");

// `passport` is an authentication middleware for Express.
// It's designed to serve a singular purpose: authenticate requests.
const passport = require("passport");

// `passport-local` is a strategy for authenticating with a username and password.
const LocalStrategy = require("passport-local");

// The `User` model is likely where our application user data is defined and where Passport.js methods might be applied.
const User = require("./models/user");

// `helmet` helps secure Express apps by setting various HTTP headers.
const helmet = require("helmet");

// `express-mongo-sanitize` is a middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
const mongoSanitize = require("express-mongo-sanitize");

// Import routers for user, campgrounds, and reviews:
// These routers will define the endpoints and how the application should respond to specific routes.
const userRoutes = require("./routes/users"); // Router for all user-related routes (like login, registration, etc.)
const campgroundRoutes = require("./routes/campgrounds"); // Router for all campground-related routes (like listing, creating, etc.)
const reviewRoutes = require("./routes/reviews"); // Router for all review-related routes (like creating a review, editing, etc.)

// Connect to MongoDB database:
// Here, we're asking Mongoose to connect to a MongoDB instance running on our local machine.
// The path specifies a "yelp-camp" database. If it doesn't exist, MongoDB will create it for us.
const dbUrl = process.env.DB_URL;
// "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl, {
  useUnifiedTopology: true,
});

// Establish connection to the database and set up event listeners:
// This section provides feedback on the status of our connection to the database.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:")); // Logs any errors that occur while trying to connect to MongoDB.
db.once("open", () => {
  console.log("Database connected"); // Logs a success message once a connection to MongoDB has been established.
});

// Initialize the Express application:
// This is the primary driver of our web application, handling route management, middleware, and more.
const app = express();

// Set up ejs-mate as the view engine for EJS templates:
// This tells Express to use EJS as the templating engine and where to find these templates.
app.engine("ejs", ejsMate); // Use ejs-mate for extended features from the regular EJS view engine.
app.set("view engine", "ejs"); // Set EJS as the app's view engine.
app.set("views", path.join(__dirname, "views")); // Define the directory where Express should look for EJS views.

// Middlewares setup:
// Middleware functions are functions that have access to the request and response objects,
// and the next function in the application’s request-response cycle.
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(methodOverride("_method")); // Let's you use HTTP verbs like PUT or DELETE in places where they aren't supported.
app.use(express.static(path.join(__dirname, "public"))); // Define where static assets like stylesheets, scripts, and images are located.
app.use(mongoSanitize()); // Middleware to sanitize data by preventing data which includes MongoDB operators.

// Configure session store:
// This tells Express to use the MongoDB session store.
// This is necessary to store session data in the database.
const store = MongoStore.create({
  mongoUrl: dbUrl, // The URL to the MongoDB instance.
  // mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, // The time period in seconds after which the session will be updated.
  crypto: {
    secret: "thisshouldbeabettersecret!", // The secret used to sign the session ID cookie.
  },
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

// Configure session settings:
// Sessions allow us to persist data across requests. They're a way to store data on the server-side which can be accessed between multiple requests.
const sessionConfig = {
  store, // The session store to use.
  name: "sesh", // The name of the cookie to be set in the user's browser. It's the identifier for the session.
  secret: "thisshouldbeabettersecret!", // This is used to sign the session ID cookie. Can be a string or an array of multiple secrets.
  resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request.
  saveUninitialized: true, // Forces a session that is "uninitialized" (new but not modified) to be saved to the store.
  cookie: {
    httpOnly: true, // Marks the cookie as an HTTP-only cookie, which means it's not accessible via JavaScript.
    // secure: true, // This would mark the cookie to be used over HTTPS only. Uncomment this if you're running your app on a HTTPS connection.
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Sets a date for when the cookie will expire. Here, it's set to 7 days in the future.
    maxAge: 1000 * 60 * 60 * 24 * 7, // Specifies the number of milliseconds for the cookie's max-age. Also set to 7 days.
  },
};

app.use(session(sessionConfig)); // This tells Express to use the session middleware with the above configuration.

app.use(flash()); // This uses the 'connect-flash' middleware. It allows us to store temporary messages to display to the user. It's often used for error or success messages after a redirect.

// Define content security policy (CSP) for Helmet:
// CSP is a security feature provided by web browsers to prevent cross-site scripting (XSS) attacks,
// mixed content, and other code injection attacks.

// These are whitelisted script sources. Only scripts loaded from these sources will be executed.
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com", // Bootstrap CDN
  "https://cdnjs.cloudflare.com", // General-purpose CDN
  "https://cdn.jsdelivr.net", // Another general-purpose CDN
];

// Whitelisted style sources. Only stylesheets loaded from these sources will be applied.
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com", // Bootstrap CDN
  "https://cdn.jsdelivr.net", // CDN for various libraries
];

// Whitelisted image sources. Only images from these sources will be loaded.
const imgSrcUrls = [
  "https://res.cloudinary.com/dr6ra3p17/", // Cloudinary, an image management and manipulation service.
  "https://images.unsplash.com/", // Unsplash image hosting.
];

// Whitelisted connection sources for loading using fetch or XMLHttpRequest.
const connectSrcUrls = ["https://res.cloudinary.com"]; // Cloudinary again, for making AJAX requests possibly.

// Whitelisted font sources. Only fonts from these sources will be loaded.
const fontSrcUrls = ["https://cdn.jsdelivr.net"]; // General-purpose CDN that may host some fonts.

// Configure and use Helmet middleware with the defined content security policy.
// Helmet helps secure Express apps by setting various HTTP headers.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [], // By default, no sources are allowed to load. You'd override this with other directive categories.
        connectSrc: ["'self'", ...connectSrcUrls], // Allows connections to self and Cloudinary.
        imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls], // Allows image loads from self, inline data URIs, and whitelisted image hosts.
        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls], // Allows scripts from self, inline scripts (considered unsafe), and whitelisted script hosts.
        styleSrc: ["'self'", ...styleSrcUrls, "'unsafe-inline'"], // Allows styles from self, inline styles (considered unsafe), and whitelisted style hosts.
        fontSrc: ["'self'", ...fontSrcUrls], // Allows fonts from self and whitelisted font hosts.
      },
    },
  })
);

// Configure Passport for user authentication:
// Passport is a flexible user authentication middleware for Node.js applications.

// Initialize passport and start an authentication session:
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy for Passport:
// The local strategy uses a username and password for authentication.
passport.use(new LocalStrategy(User.authenticate()));

// Serialize the user to decide which data of the user object should be stored in the session:
// The result of the serializeUser method is attached to the session as req.session.passport.user = {}.
passport.serializeUser(User.serializeUser());

// Deserialize the user from the session to get the user data on each request.
// This data is attached to the request object as req.user.
passport.deserializeUser(User.deserializeUser());

// Middleware to pass local variables to templates:
// These variables will be available in all EJS templates.
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Current logged-in user's data.
  res.locals.success = req.flash("success"); // Flash messages for successful actions.
  res.locals.error = req.flash("error"); // Flash messages for errors.
  next(); // Move to the next middleware or route.
});

// Setup application routes:
// These routes define the main URL patterns the app should respond to.
app.use("/", userRoutes); // User related routes (login, register, etc.)
app.use("/campgrounds", campgroundRoutes); // Routes related to campgrounds.
app.use("/campgrounds/:id/reviews", reviewRoutes); // Routes for reviews related to specific campgrounds.

// Serve static files like images, CSS, and JavaScript:
// These files are served from the 'public' directory.
app.use(express.static("public"));

// Define a basic route for the homepage:
// When a user visits the root URL, they'll be rendered the home page.
app.get("/", (req, res) => {
  res.render("home");
});

// Middleware to handle undefined routes:
// This captures requests to any undefined routes (ones that haven't been explicitly defined earlier in the app).
// This is especially useful for returning a custom 404 error page when a user tries to access a route that doesn't exist.
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Central error handling middleware:
// This middleware is designed to handle different types of errors that occur in the application and present them in a user-friendly way.
app.use((err, req, res, next) => {
  // Handle Mongoose validation errors:
  // These errors occur when data doesn't meet the validation criteria defined in the schema.
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const statusCode = 400; // Represents a Bad Request.
    const errorMessage = messages.join(" ");
    return res.status(statusCode).render("error", {
      err: { message: errorMessage, statusCode: statusCode },
    });
  }

  // Handle Mongoose cast errors:
  // These errors arise when trying to perform operations on an ID that doesn't exist in the database.
  if (err.name === "CastError") {
    const statusCode = 400; // Represents a Bad Request.
    const errorMessage = "Invalid ID provided";
    return res.status(statusCode).render("error", {
      err: { message: errorMessage, statusCode: statusCode },
    });
  }

  // Default error handling:
  // If an error doesn't fall into the above categories, this default handler will manage it.
  // For instance, an internal server error.
  const { statusCode = 500 } = err; // If no specific status code is provided, default to 500 (Internal Server Error).
  res.status(statusCode).render("error", { err });
});

// Server initialization:
// The application will start and listen for incoming requests on port 3000.
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
