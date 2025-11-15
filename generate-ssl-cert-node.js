/**
 * SSL Certificate Generation Script for BHOKBHOJ (Node.js Native)
 * This script generates self-signed SSL certificates using Node.js crypto module
 * No OpenSSL installation required!
 */

const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
    console.log('✅ Created ssl directory');
}

console.log('🔐 Generating SSL certificates for BHOKBHOJ using Node.js...\n');

try {
    // Generate a key pair
    console.log('   📝 Generating RSA key pair (4096 bits)...');
    const keys = forge.pki.rsa.generateKeyPair(4096);
    
    // Create a certificate
    console.log('   📝 Creating certificate...');
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [
        { name: 'commonName', value: 'localhost' },
        { name: 'countryName', value: 'NP' },
        { shortName: 'ST', value: 'Bagmati' },
        { name: 'localityName', value: 'Kathmandu' },
        { name: 'organizationName', value: 'BHOKBHOJ' },
        { shortName: 'OU', value: 'Development' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    
    // Add extensions
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            server: true,
            client: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 2, // DNS
                    value: 'localhost'
                },
                {
                    type: 7, // IP
                    ip: '127.0.0.1'
                }
            ]
        },
        {
            name: 'subjectKeyIdentifier'
        }
    ]);
    
    // Self-sign certificate
    console.log('   📝 Signing certificate...');
    cert.sign(keys.privateKey, forge.md.sha256.create());
    
    // Convert to PEM format
    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
    
    // Save to files
    console.log('   📝 Saving certificate files...');
    fs.writeFileSync(path.join(sslDir, 'cert.pem'), pemCert);
    fs.writeFileSync(path.join(sslDir, 'key.pem'), pemKey);
    
    console.log('\n✅ SSL certificates generated successfully!');
    console.log('📁 Location: Backend/ssl/');
    console.log('   - cert.pem (Certificate)');
    console.log('   - key.pem (Private Key)');
    console.log('\n📋 Certificate Details:');
    console.log('   - Common Name: localhost');
    console.log('   - Organization: BHOKBHOJ');
    console.log('   - Country: Nepal (NP)');
    console.log('   - Valid for: 1 year');
    console.log('   - Key Size: RSA 4096 bits');
    console.log('\n⚠️  Note: These are self-signed certificates for development only.');
    console.log('   For production, obtain certificates from a trusted CA (Let\'s Encrypt, etc.)');
    console.log('\n🚀 Ready to start HTTPS server!');
    console.log('   Run: npm run dev:https');
    
} catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Make sure node-forge is installed: npm install');
    console.log('   2. Check if you have write permissions in Backend/ssl/');
    console.log('   3. Try running as administrator');
    process.exit(1);
}
