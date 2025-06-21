const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
require('dotenv').config({ path: '../config/config.env' });

const sampleRestaurants = [
  {
    name: "Rooftop Nepal",
    location: "Thamel, Kathmandu",
    contact: "+977-9800000001"
  },
  {
    name: "Salone de Cafe",
    location: "Durbar Marg, Kathmandu", 
    contact: "+977-9800000002"
  },
  {
    name: "Your Own Restro",
    location: "Baneshwor, Kathmandu",
    contact: "+977-9800000003"
  },
  {
    name: "Nezze Restro Nepal",
    location: "New Road, Kathmandu",
    contact: "+977-9800000004"
  }
];

const createSampleRestaurants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Insert sample restaurants
    const restaurants = await Restaurant.insertMany(sampleRestaurants);
    console.log('Sample restaurants created:', restaurants.length);

    console.log('Sample restaurants:');
    restaurants.forEach(restaurant => {
      console.log(`- ${restaurant.name} (${restaurant.location})`);
    });

    console.log('Sample restaurants created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample restaurants:', error);
    process.exit(1);
  }
};

createSampleRestaurants(); 