const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/foodCategory');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

const createSampleProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites");
    console.log('Connected to MongoDB');

    // Get categories and restaurants for reference
    const categories = await Category.find();
    const restaurants = await Restaurant.find();

    if (categories.length === 0) {
      console.log('No categories found. Please create categories first.');
      process.exit(1);
    }

    if (restaurants.length === 0) {
      console.log('No restaurants found. Please create restaurants first.');
      process.exit(1);
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const sampleProducts = [
      {
        name: "Chicken Momo",
        description: "Delicious steamed dumplings filled with minced chicken and spices",
        price: 250,
        categoryId: categories[0]._id, // Burger category
        restaurantId: restaurants[0]._id,
        type: "nepali",
        filepath: "image-0a67f8e2-3807-4f88-b4ea-28ba7c1c65da.jpg"
      },
      {
        name: "Dal Bhat Set",
        description: "Traditional Nepali meal with rice, lentils, and vegetables",
        price: 180,
        categoryId: categories[1]._id, // Dal-Bhat category
        restaurantId: restaurants[1]._id,
        type: "nepali",
        filepath: "image-8d5e0d84-20a1-42c5-bbab-eaecae2f83b0.jpg"
      },
      {
        name: "Chow Mein",
        description: "Stir-fried noodles with vegetables and chicken",
        price: 220,
        categoryId: categories[2]._id, // Chinese category
        restaurantId: restaurants[2]._id,
        type: "indian",
        filepath: "image-46e363ef-8615-49d6-a3bd-153f5d5d3152.jpg"
      },
      {
        name: "Butter Chicken",
        description: "Creamy and rich Indian curry with tender chicken",
        price: 350,
        categoryId: categories[3]._id, // Indian category
        restaurantId: restaurants[3]._id,
        type: "indian",
        filepath: "image-68d00965-0547-4cc5-8b6f-a57cb463ba97.jpg"
      },
      {
        name: "Sel Roti",
        description: "Traditional Nepali rice bread, sweet and crispy",
        price: 120,
        categoryId: categories[4]._id, // Nepali category
        restaurantId: restaurants[4]._id,
        type: "nepali",
        filepath: "image-c081685e-f76e-4c58-9e9d-87d5ba3d49e9.png"
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 450,
        categoryId: categories[5]._id, // Pizza category
        restaurantId: restaurants[5]._id,
        type: "indian",
        filepath: "image-0aae189b-d234-4528-9087-335d59b0f02f.png"
      }
    ];

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log('Sample products created:', products.length);

    console.log('Sample products:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.price} NPR) - ${product.filepath}`);
    });

    console.log('Sample products created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample products:', error);
    process.exit(1);
  }
};

createSampleProducts(); 