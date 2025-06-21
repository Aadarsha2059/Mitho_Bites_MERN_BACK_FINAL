const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin_aadarsha' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin_password', 10);
      
      const adminUser = new User({
        fullname: 'Aadarsha Babu Dhakal',
        username: 'admin_aadarsha',
        email: 'admin@mithobites.com',
        password: hashedPassword,
        phone: 1234567890,
        address: 'Kathmandu, Nepal'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('Admin credentials:');
    console.log('Username: admin_aadarsha');
    console.log('Password: admin_password');

    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser(); 