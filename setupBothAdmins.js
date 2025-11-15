require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function setupBothAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB\n');

        // 1. Update your existing account to admin
        const yourAccount = await User.findOne({ email: 'dhakalaadarshababu20590226@gmail.com' });
        if (yourAccount) {
            yourAccount.role = 'admin';
            await yourAccount.save();
            console.log('✅ Your account updated to admin:');
            console.log('   Username:', yourAccount.username);
            console.log('   Email:', yourAccount.email);
            console.log('   Role:', yourAccount.role);
            console.log('   Password: (your existing password)\n');
        }

        // 2. Create or update admin_aadarsha account
        let adminAccount = await User.findOne({ username: 'admin_aadarsha' });
        
        if (adminAccount) {
            // Update existing admin_aadarsha
            const hashedPassword = await bcrypt.hash('admin_password', 10);
            adminAccount.password = hashedPassword;
            adminAccount.role = 'admin';
            adminAccount.email = 'admin@bhokbhoj.com';
            await adminAccount.save();
            console.log('✅ admin_aadarsha account updated:');
        } else {
            // Create new admin_aadarsha
            const hashedPassword = await bcrypt.hash('admin_password', 10);
            adminAccount = new User({
                username: 'admin_aadarsha',
                email: 'admin@bhokbhoj.com',
                password: hashedPassword,
                phone: 9800000000,
                role: 'admin',
                fullname: 'Admin Aadarsha',
                address: 'Kathmandu, Nepal'
            });
            await adminAccount.save();
            console.log('✅ admin_aadarsha account created:');
        }
        
        console.log('   Username: admin_aadarsha');
        console.log('   Email: admin@bhokbhoj.com');
        console.log('   Password: admin_password');
        console.log('   Role: admin\n');

        console.log('🎉 Both admin accounts are ready!');
        console.log('\nYou can now login as:');
        console.log('1. Email: dhakalaadarshababu20590226@gmail.com (your password)');
        console.log('2. Username: admin_aadarsha, Password: admin_password');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupBothAdmins();
