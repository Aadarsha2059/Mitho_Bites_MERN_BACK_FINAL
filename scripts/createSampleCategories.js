const mongoose = require('mongoose');
const Category = require('../models/foodCategory');
require('dotenv').config();

const sampleCategories = [
  {
    name: "Burger",
    filepath: "image-036bc4f4-d98a-43e6-971a-fd09ed14ffeb.png"
  },
  {
    name: "Dal-Bhat",
    filepath: "image-61e3302e-0d61-41f1-a5dd-cde2d993a1cd.png"
  },
  {
    name: "Chinese",
    filepath: "image-c3e2a486-9dce-4d42-bbf4-52d5d0a8d706.png"
  },
  {
    name: "Indian",
    filepath: "image-29de209b-4b8a-4bad-be3b-40f117c75f5f.png"
  },
  {
    name: "Nepali",
    filepath: "image-aa15558d-4db3-480e-a473-63d27f0ac543.jpg"
  },
  {
    name: "Pizza",
    filepath: "image-2a8ac41e-b629-46d4-bd4b-8c34684166e6.jpg"
  },
  {
    name: "Sushi",
    filepath: "image-1810ff41-df28-49f0-9ace-e71f08765e2f.jpg"
  },
  {
    name: "Desserts",
    filepath: "image-8d8d6615-f720-4061-a0f5-e453fdbc20ed.jpg"
  }
];

const createSampleCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites");
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert sample categories
    const categories = await Category.insertMany(sampleCategories);
    console.log('Sample categories created:', categories.length);

    console.log('Sample categories:');
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.filepath})`);
    });

    console.log('Sample categories created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample categories:', error);
    process.exit(1);
  }
};

createSampleCategories(); 