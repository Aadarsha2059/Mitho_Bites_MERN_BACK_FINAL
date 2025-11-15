require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB');

        // Find user with your email and update to admin
        const result = await User.findOneAndUpdate(
            { email: 'dhakalaadarshababu20590226@gmail.com' },
            { role: 'admin' },
            { new: true }
        );
        
        if (result) {
            console.log('✅ User updated to admin role!');
            console.log('Username:', result.username);
            console.log('Email:', result.email);
            console.log('Role:', result.role);
        } else {
            console.log('❌ User not found with email: dhakalaadarshababu20590226@gmail.com');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAdmin();
