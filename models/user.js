const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// define User schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  tosAccepted: {
    type: Boolean,
    required: true,
    default: false,
  },
  bio: {
    type: String,
    required: false,
    default: "Tell us about yourself!",
  },
  campgrounds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Campground",
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

UserSchema.pre("remove", async function (next) {
  try {
    // Remove all campgrounds associated with the user
    await mongoose.model("Campground").deleteMany({ author: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

// passport-local-mongoose adds username and password fields to the schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
