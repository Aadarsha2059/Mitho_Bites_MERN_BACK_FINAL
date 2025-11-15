require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB\n');

        const username = 'Aadarsha112233';
        const newPassword = 'Test@123456';

        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('❌ User not found:', username);
            process.exit(1);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log('✅ Password reset successful!');
        console.log('Username:', user.username);
        console.log('Email:', user.email);
        console.log('New Password:', newPassword);
        console.log('\nYou can now login with this password to test OTP!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
