require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function setupCorrectAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mithobites');
        console.log('Connected to MongoDB\n');

        // 1. Set Aadarsha112233 back to regular user
        const regularUser = await User.findOne({ username: 'Aadarsha112233' });
        if (regularUser) {
            regularUser.role = 'user';
            await regularUser.save();
            console.log('✅ Aadarsha112233 set as regular user:');
            console.log('   Username:', regularUser.username);
            console.log('   Email:', regularUser.email);
            console.log('   Role:', regularUser.role);
            console.log('   Password: (your existing password)\n');
        }

        // 2. Create or update admin_aadarsha account
        let adminAccount = await User.findOne({ username: 'admin_aadarsha' });
        
        const hashedPassword = await bcrypt.hash('admin_password', 10);
        
        if (adminAccount) {
            // Update existing
            adminAccount.password = hashedPassword;
            adminAccount.role = 'admin';
            adminAccount.fullname = 'Admin Aadarsha';
            await adminAccount.save();
            console.log('✅ admin_aadarsha account updated:');
        } else {
            // Create new with unique email
            adminAccount = new User({
                username: 'admin_aadarsha',
                email: 'admin.aadarsha@bhokbhoj.com',
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
        console.log('   Email:', adminAccount.email);
        console.log('   Password: admin_password');
        console.log('   Role: admin\n');

        console.log('🎉 Setup complete!');
        console.log('\n📋 Summary:');
        console.log('   ADMIN: username=admin_aadarsha, password=admin_password, email=' + adminAccount.email);
        console.log('   USER:  username=Aadarsha112233, email=dhakalaadarshababu20590226@gmail.com (your existing password)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupCorrectAdmin();
