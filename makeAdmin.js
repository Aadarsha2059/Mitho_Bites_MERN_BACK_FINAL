/**
 * Make a user an admin
 * Usage: node makeAdmin.js username
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const username = process.argv[2] || 'Aadarsha11';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        const user = await User.findOne({ username: username });
        
        if (!user) {
            console.log(`❌ User '${username}' not found`);
            process.exit(1);
        }
        
        console.log(`Found user: ${user.username}`);
        console.log(`Current role: ${user.role}`);
        
        if (user.role === 'admin') {
            console.log('✅ User is already an admin!');
        } else {
            user.role = 'admin';
            await user.save();
            console.log('✅ User updated to admin!');
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
