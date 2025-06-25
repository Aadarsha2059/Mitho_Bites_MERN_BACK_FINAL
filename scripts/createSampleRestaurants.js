const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

const sampleRestaurants = [
  {
    name: "Rooftop Nepal",
    location: "Thamel, Kathmandu",
    contact: "+977-9800000001",
    filepath: "image-d4879da7-8d7e-47b6-9a35-f0664b26bb04.jpg"
  },
  {
    name: "Salone de Cafe",
    location: "Durbar Marg, Kathmandu", 
    contact: "+977-9800000002",
    filepath: "image-6019e67a-0aaa-441f-b7c5-ad053e315990.jpg"
  },
  {
    name: "Your Own Restro",
    location: "Baneshwor, Kathmandu",
    contact: "+977-9800000003",
    filepath: "image-9b42f86f-d3f9-4b05-a8a1-6ffc47a9f468.jpg"
  },
  {
    name: "Nezze Restro Nepal",
    location: "New Road, Kathmandu",
    contact: "+977-9800000004",
    filepath: "image-809ce75f-67a6-4bf9-bd09-223d87d44430.jpg"
  },
  {
    name: "Momo House",
    location: "Lazimpat, Kathmandu",
    contact: "+977-9800000005",
    filepath: "image-94d255f5-dd53-4816-a303-767c93d168a5.jpg"
  },
  {
    name: "Thakali Kitchen",
    location: "Durbarmarg, Kathmandu",
    contact: "+977-9800000006",
    filepath: "image-4dcd2542-22d4-4666-a57c-53bf714e133c.jpg"
  }
];

const createSampleRestaurants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites");
    console.log('Connected to MongoDB');

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Insert sample restaurants
    const restaurants = await Restaurant.insertMany(sampleRestaurants);
    console.log('Sample restaurants created:', restaurants.length);

    console.log('Sample restaurants:');
    restaurants.forEach(restaurant => {
      console.log(`- ${restaurant.name} (${restaurant.location}) - ${restaurant.filepath}`);
    });

    console.log('Sample restaurants created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample restaurants:', error);
    process.exit(1);
  }
};

createSampleRestaurants(); 