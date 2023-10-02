const Joi = require("joi");
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});

const UserJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), // This assumes a basic alphanumeric password validation. Adjust as per your requirements.
  repeat_password: Joi.ref("password"), // Ensure password and repeat_password are the same
  tosAccepted: Joi.boolean().required(),
  bio: Joi.string().allow("").default("Tell us about yourself!"), // Allows an empty string or a provided bio
  // Since campgrounds and reviews are ObjectIds, we're assuming they'll be provided as strings in input. Adjust if necessary.
  campgrounds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  reviews: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
}).with("password", "repeat_password"); // Ensure both password and repeat_password are present together
