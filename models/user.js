const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// define User schema
const UserSchema = new Schema({
  email: {
    type: String, //  type is a string
    required: true, // email is required
    unique: true, // email must be unique
  },
});

// passport-local-mongoose adds username and password fields to the schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
