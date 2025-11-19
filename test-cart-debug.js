const mongoose = require('mongoose');
require('dotenv').config();

const Cart = require('./models/Cart');
const Product = require('./models/Product');

async function testCartData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all carts
        const carts = await Cart.find()
            .populate({
                path: 'items.productId',
                select: 'name price filepath isAvailable type categoryId restaurantId',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'restaurantId', select: 'name location' }
                ]
            })
            .limit(5);

        console.log('\n=== Cart Data ===');
        console.log(`Found ${carts.length} carts`);

        carts.forEach((cart, index) => {
            console.log(`\nCart ${index + 1}:`);
            console.log(`User ID: ${cart.userId}`);
            console.log(`Items count: ${cart.items.length}`);
            
            cart.items.forEach((item, itemIndex) => {
                console.log(`\n  Item ${itemIndex + 1}:`);
                console.log(`    Product ID: ${item.productId?._id}`);
                console.log(`    Product Name: ${item.productId?.name}`);
                console.log(`    Price: ${item.price}`);
                console.log(`    Quantity: ${item.quantity}`);
                console.log(`    Category: ${item.productId?.categoryId?.name}`);
                console.log(`    Restaurant: ${item.productId?.restaurantId?.name}`);
                console.log(`    Restaurant Location: ${item.productId?.restaurantId?.location}`);
                console.log(`    Type: ${item.productId?.type}`);
                console.log(`    Has productId: ${!!item.productId}`);
                console.log(`    Has categoryId: ${!!item.productId?.categoryId}`);
                console.log(`    Has restaurantId: ${!!item.productId?.restaurantId}`);
            });
        });

        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testCartData();
