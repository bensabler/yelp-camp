// Import required modules
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const UserSchema = new Schema({
  name: {
    type: String, // Full name of the user
    required: true, // This field is mandatory
  },
  email: {
    type: String, // Email address of the user
    required: true, // This field is mandatory
    unique: true, // Ensure that the email address is unique across users
  },
  username: {
    type: String, // Username chosen by the user for login
    required: true, // This field is mandatory
    unique: true, // Ensure that the username is unique across users
  },
  tosAccepted: {
    type: Boolean, // Indicates whether the user accepted the Terms of Service
    required: true, // This field is mandatory
    default: false, // Default value is 'false'
  },
  bio: {
    type: String, // Brief about the user
    required: false, // This field is optional
    default: "Tell us about yourself!", // Default bio if none provided
  },
  campgrounds: [
    {
      type: Schema.Types.ObjectId, // Reference to campgrounds added by the user
      ref: "Campground", // Indicates the ObjectId refers to a Campground document
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId, // Reference to reviews written by the user
      ref: "Review", // Indicates the ObjectId refers to a Review document
    },
  ],
});

// Middleware to remove associated campgrounds when a user is removed
UserSchema.pre("remove", async function (next) {
  try {
    // Find and delete all campgrounds associated with this user
    await mongoose.model("Campground").deleteMany({ author: this._id });
    next();
  } catch (err) {
    // Pass the error to the next middleware
    next(err);
  }
});

// Use the passport-local-mongoose plugin to add username and password fields to the schema
// This also adds some utility functions for authentication
UserSchema.plugin(passportLocalMongoose);

// Export the User model based on the UserSchema
module.exports = mongoose.model("User", UserSchema);
