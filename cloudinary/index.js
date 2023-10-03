// Import required modules
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Create a new cloudinary storage instance. This is for multer to know where to store uploaded images.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yelp-camp", // The folder in Cloudinary where images are stored
    allowedFormats: ["jpeg", "png", "jpg"], // Allowed image formats
  },
});

// Export the configured cloudinary and storage instance
module.exports = {
  cloudinary,
  storage,
};
