const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing ADMIN login...');
        
        const response = await axios.post('http://localhost:5050/api/auth/login', {
            username: 'admin_aadarsha',
            password: 'admin_password'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
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

testLogin();
