// Script to fix the PaymentMethod collection index issue
const mongoose = require('mongoose');
require('dotenv').config();

async function fixPaymentIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB');

        // Get the PaymentMethod collection
        const db = mongoose.connection.db;
        const collection = db.collection('paymentmethods');

        // Drop the problematic index
        try {
            await collection.dropIndex('orderId_1');
            console.log('✅ Dropped orderId_1 index');
        } catch (err) {
            console.log('Index might not exist or already dropped:', err.message);
        }

        // Optionally, remove documents with null orderId
        const result = await collection.deleteMany({ orderId: null });
        console.log(`✅ Removed ${result.deletedCount} documents with null orderId`);

        // Create the index again (optional, Mongoose will do this automatically)
        await collection.createIndex({ orderId: 1 }, { unique: true, sparse: true });
        console.log('✅ Created new sparse unique index on orderId');

        console.log('\n✅ Fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixPaymentIndex();
