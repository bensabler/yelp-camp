// Import the required mongoose module
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for a review
const reviewSchema = new Schema({
  body: String, // Text content of the review
  rating: Number, // Rating given by the user, usually on a scale (e.g., 1 to 5)
  author: {
    type: Schema.Types.ObjectId, // Reference to the User who wrote the review
    ref: "User", // This indicates that the ObjectId refers to a User document
  },
});

// Export the Review model based on the reviewSchema
module.exports = mongoose.model("Review", reviewSchema);
