require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB\n');

        const users = await User.find({}).select('username email role fullname');
        
        console.log(`Found ${users.length} users:\n`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role || 'user'}`);
            console.log(`   Fullname: ${user.fullname || 'N/A'}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listUsers();
