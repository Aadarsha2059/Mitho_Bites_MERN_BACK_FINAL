const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Product = require('./models/Product');
const Category = require('./models/foodCategory');
const Restaurant = require('./models/Restaurant');

async function testOrderData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all orders
        const orders = await Order.find()
            .populate({
                path: 'items.productId',
                select: 'name price filepath description type',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(5);

        console.log('\n=== Order Data ===');
        console.log(`Found ${orders.length} orders`);

        orders.forEach((order, index) => {
            console.log(`\nOrder ${index + 1}:`);
            console.log(`Order ID: ${order._id}`);
            console.log(`User ID: ${order.userId}`);
            console.log(`Status: ${order.orderStatus}`);
            console.log(`Items count: ${order.items.length}`);
            console.log(`Subtotal: ${order.subtotal}`);
            console.log(`Delivery Fee: ${order.deliveryFee}`);
            console.log(`Tax: ${order.tax}`);
            console.log(`Total: ${order.totalAmount}`);
            
            order.items.forEach((item, itemIndex) => {
                console.log(`\n  Item ${itemIndex + 1}:`);
                console.log(`    Product ID: ${item.productId?._id || 'N/A'}`);
                console.log(`    Product Name (stored): ${item.productName}`);
                console.log(`    Product Name (populated): ${item.productId?.name || 'N/A'}`);
                console.log(`    Price: ${item.price}`);
                console.log(`    Quantity: ${item.quantity}`);
                console.log(`    Category (stored): ${item.categoryName}`);
                console.log(`    Category (populated): ${item.productId?.categoryId?.name || 'N/A'}`);
                console.log(`    Restaurant (stored): ${item.restaurantName}`);
                console.log(`    Restaurant (populated): ${item.productId?.restaurantId?.name || 'N/A'}`);
                console.log(`    Location (stored): ${item.restaurantLocation}`);
                console.log(`    Type (stored): ${item.foodType}`);
            });
        });

        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testOrderData();
