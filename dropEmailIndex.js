require('dotenv').config();
const mongoose = require('mongoose');

async function dropEmailIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB\n');

        // Drop the unique index on email
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        try {
            await collection.dropIndex('email_1');
            console.log('✅ Email unique index dropped successfully!');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Email index does not exist (already dropped)');
            } else {
                throw error;
            }
        }

        console.log('\n✅ Now you can register users with duplicate emails!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

dropEmailIndex();
