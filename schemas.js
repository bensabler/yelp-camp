const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().max(100),
    price: Joi.number().min(0).required(),
    location: Joi.string().required().max(200),
    description: Joi.string().required().max(1000),
    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().required().uri().max(500),
          filename: Joi.string().required().max(200),
        })
      )
      .max(10)
      .optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().max(500),
  }).required(),
});

module.exports.userSchema = Joi.object({
  name: Joi.string().required().max(100),
  email: Joi.string().email().required().max(200),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).max(30),
  repeat_password: Joi.ref("password"),
  tosAccepted: Joi.boolean().required(),
  bio: Joi.string().allow("").default("Tell us about yourself!").max(500),
  campgrounds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  reviews: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
}).with("password", "repeat_password"); // Ensure both password and repeat_password are present together
