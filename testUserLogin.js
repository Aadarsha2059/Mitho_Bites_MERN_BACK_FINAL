const axios = require('axios');

async function testUserLogin() {
    try {
        console.log('Testing regular user login (should send OTP)...\n');
        
        const response = await axios.post('http://localhost:5050/api/auth/login', {
            username: 'Aadarsha112233',
            password: 'Test@123456'
        });
        
        console.log('✅ Login request successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n📧 Check your email for OTP!');
        console.log('Email:', response.data.email);
        
    } catch (error) {
        console.log('❌ Login failed!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testUserLogin();
