const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().max(100).escapeHTML(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required().max(200).escapeHTML(),
    description: Joi.string().required().max(1000).escapeHTML(),
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
  deleteImages: Joi.array().items(Joi.string().max(200)).optional(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().max(500).escapeHTML(),
  }).required(),
});

module.exports.userSchema = Joi.object({
  name: Joi.string().required().max(100).escapeHTML(),
  email: Joi.string().email().required().max(200).escapeHTML(),
  username: Joi.string().alphanum().min(3).max(30).required().escapeHTML(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .max(30)
    .escapeHTML(),
  repeat_password: Joi.ref("password"),
  tosAccepted: Joi.boolean().required(),
  bio: Joi.string()
    .allow("")
    .default("Tell us about yourself!")
    .max(500)
    .escapeHTML(),
  campgrounds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  reviews: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
}).with("password", "repeat_password"); // Ensure both password and repeat_password are present together
