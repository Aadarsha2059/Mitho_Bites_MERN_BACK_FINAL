require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: 'dhakalaadarshababu20590226@gmail.com' },
                { username: 'admin_aadarsha' }
            ]
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            
            // Update email if needed
            if (existingAdmin.email !== 'dhakalaadarshababu20590226@gmail.com') {
                existingAdmin.email = 'dhakalaadarshababu20590226@gmail.com';
                await existingAdmin.save();
                console.log('✅ Email updated to: dhakalaadarshababu20590226@gmail.com');
            }
            
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin_password', 10);

        // Create admin user
        const adminUser = new User({
            username: 'admin_aadarsha',
            email: 'dhakalaadarshababu20590226@gmail.com',
            password: hashedPassword,
            phone: 9800000000,
            role: 'admin',
            fullname: 'Admin Aadarsha',
            address: 'Kathmandu, Nepal'
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('Username: admin_aadarsha');
        console.log('Password: admin_password');
        console.log('Email: dhakalaadarshababu20590226@gmail.com');
        console.log('Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
