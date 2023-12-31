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
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "651a225f9271061a9c9038f8",
      location: `${randomCity.city}, ${randomCity.state_id}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
      price,
      image: [
        {
          url: "https://res.cloudinary.com/dr6ra3p17/image/upload/v1696296137/yelp-camp/lw23jxjfozjvwqnsrl84.jpg",
          filename: "yelp-camp/lw23jxjfozjvwqnsrl84",
        },
        {
          url: "https://res.cloudinary.com/dr6ra3p17/image/upload/v1696296138/yelp-camp/v0lba2cbraryck5rocxy.jpg",
          filename: "yelp-camp/v0lba2cbraryck5rocxy",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
