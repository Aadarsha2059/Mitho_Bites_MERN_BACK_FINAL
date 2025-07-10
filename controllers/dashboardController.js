const Restaurant = require('../models/Restaurant');
const Category = require('../models/foodCategory');
const Product = require('../models/Product');

exports.getLatestAdditions = async (req, res) => {
  try {
    const latestRestaurant = await Restaurant.findOne().sort({ createdAt: -1 });
    const latestCategory = await Category.findOne().sort({ createdAt: -1 });
    const latestProduct = await Product.findOne().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        restaurant: latestRestaurant ? latestRestaurant.name : null,
        category: latestCategory ? latestCategory.name : null,
        food: latestProduct ? latestProduct.name : null,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}; 