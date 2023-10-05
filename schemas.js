// Import required modules
const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Define a custom Joi extension to handle and prevent HTML injections in strings.
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        // Sanitize the input value by removing all HTML tags and attributes
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        // If the sanitized value is different from the original, throw an error
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
      },
    },
  },
});

// Extend the base Joi with our custom extension to include HTML sanitization
const Joi = BaseJoi.extend(extension);

// Define a schema for validating campground inputs
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().max(100).escapeHTML(), // Campground title with max 100 chars
    price: Joi.number().min(0).required(), // Price should be >= 0
    location: Joi.string().required().max(200).escapeHTML(), // Location of the campground
    description: Joi.string().required().max(1000).escapeHTML(), // Description of the campground
    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().required().uri().max(500), // Image URL
          filename: Joi.string().required().max(200), // Image filename
        })
      )
      .max(10)
      .optional(), // Can have up to 10 images
  }).required(),
  deleteImages: Joi.array().items(Joi.string().max(200)).optional(), // Images to be deleted
});

// Define a schema for validating review inputs
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5), // Rating value between 1 to 5
    body: Joi.string().required().max(500).escapeHTML(), // Review text
  }).required(),
});

// Define a schema for validating user registration and update inputs
module.exports.userSchema = Joi.object({
  name: Joi.string().required().max(100).escapeHTML(),
  email: Joi.string().email().required().max(200).escapeHTML(),
  username: Joi.string().alphanum().min(3).max(30).required().escapeHTML(),
  password: Joi.string()
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")) // Password pattern constraint
    .max(30),
  repeat_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Repeat password"),
  tosAccepted: Joi.boolean().required(), // Acceptance of Terms of Service
  bio: Joi.string()
    .allow("")
    .default("Tell us about yourself!")
    .max(500)
    .escapeHTML(),
  campgrounds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)) // Array of ObjectId strings for campgrounds
    .optional(),
  reviews: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)) // Array of ObjectId strings for reviews
    .optional(),
}).with("password", "repeat_password"); // Ensure both password and repeat_password are present together
