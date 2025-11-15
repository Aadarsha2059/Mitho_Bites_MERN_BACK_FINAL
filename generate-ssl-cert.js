/**
 * SSL Certificate Generation Script for BHOKBHOJ
 * This script generates self-signed SSL certificates for development
 * For production, use certificates from a trusted Certificate Authority (CA)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
    console.log('✅ Created ssl directory');
}

console.log('🔐 Generating SSL certificates for BHOKBHOJ...\n');

try {
    // Generate private key and certificate
    const command = `openssl req -x509 -newkey rsa:4096 -keyout ${path.join(sslDir, 'key.pem')} -out ${path.join(sslDir, 'cert.pem')} -days 365 -nodes -subj "/C=NP/ST=Bagmati/L=Kathmandu/O=BHOKBHOJ/OU=Development/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ SSL certificates generated successfully!');
    console.log('📁 Location: Backend/ssl/');
    console.log('   - cert.pem (Certificate)');
    console.log('   - key.pem (Private Key)');
    console.log('\n⚠️  Note: These are self-signed certificates for development only.');
    console.log('   For production, obtain certificates from a trusted CA (Let\'s Encrypt, etc.)');
    
} catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message);
    console.log('\n📝 Manual generation instructions:');
    console.log('   Run this command in your terminal:');
    console.log('   openssl req -x509 -newkey rsa:4096 -keyout Backend/ssl/key.pem -out Backend/ssl/cert.pem -days 365 -nodes');
    process.exit(1);
}
