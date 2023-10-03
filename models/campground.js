// Import required modules
const mongoose = require("mongoose"); // Import Mongoose for database interaction
const Review = require("./review"); // Import Review model for association

// Mongoose Schema shortcut
const Schema = mongoose.Schema;

// Define a schema for storing image details
const ImageSchema = new Schema({
  url: String, // The direct URL to access the image
  filename: String, // Original filename of the uploaded image
});

// Virtual property to get a thumbnail version of the image
// Virtuals are fields that Mongoose computes at runtime, they are not persisted to the database
ImageSchema.virtual("thumbnail").get(function () {
  // This modifies the URL to fetch a resized version of the image from Cloudinary (assuming usage of Cloudinary service)
  // It changes the URL to ask for a 200px wide version of the image
  return this.url.replace("/upload", "/upload/w_200");
});

// Main schema to represent campgrounds in our database
const CampgroundSchema = new Schema({
  title: String, // The name/title of the campground
  image: [ImageSchema], // Array of images associated with the campground
  price: Number, // The price/cost to use or book the campground
  description: String, // A brief description of the campground
  location: String, // Physical location or address of the campground

  // Relationship: Which user created this campground
  // Stores a reference ID pointing to a user in the 'User' collection
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  // Relationship: Reviews related to this campground
  // An array of reference IDs pointing to reviews in the 'Review' collection
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Middleware that runs after a campground is deleted
// It ensures that reviews associated with a deleted campground are also removed from the database
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // If a campground document was found and deleted, remove its associated reviews from the 'Review' collection
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

// Export the Campground model so it can be used in other parts of our application
module.exports = mongoose.model("Campground", CampgroundSchema);
