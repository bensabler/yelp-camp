const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

const sample = (array) => array[Math.floor(Math.random() * array.length)];

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomIndex = Math.floor(Math.random() * cities.length);
    const randomCity = cities[randomIndex];
    const camp = new Campground({
      location: `${randomCity.city}, ${randomCity.state_id}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
