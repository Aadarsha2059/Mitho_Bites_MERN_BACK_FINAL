/**
 * HTTPS Server Configuration for BHOKBHOJ
 * Implements SSL/TLS encryption for secure communication
 */

require("dotenv").config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require("./index");

const PORT = process.env.PORT || 5051;
const HTTP_REDIRECT_PORT = process.env.HTTP_REDIRECT_PORT || 5050;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites";

// Fallback for local dev if Docker hostname 'mongo' is not found
if (MONGODB_URI.includes('mongo') && !process.env.USE_DOCKER_MONGO) {
  MONGODB_URI = "mongodb://localhost:27017/mithobites";
}

// Set default environment variables if not provided
process.env.MONGODB_URI = MONGODB_URI;
process.env.SECRET = process.env.SECRET || "your-secret-key-here";

// SSL Certificate paths
const sslKeyPath = path.join(__dirname, 'ssl', 'key.pem');
const sslCertPath = path.join(__dirname, 'ssl', 'cert.pem');

// Check if SSL certificates exist
const sslExists = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

if (sslExists) {
    // HTTPS Server Configuration with TLS 1.3
    const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
        // TLS 1.3 Configuration (Latest and Most Secure)
        minVersion: 'TLSv1.3', // Enforce TLS 1.3 minimum
        maxVersion: 'TLSv1.3', // Use only TLS 1.3
        // TLS 1.3 Cipher Suites (automatically selected, but can be specified)
        cipherSuites: [
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_128_CCM_SHA256'
        ].join(':'),
        // Additional security options
        honorCipherOrder: true,
        // Enable session resumption for better performance
        sessionTimeout: 300,
        // Disable older protocols explicitly
        secureOptions: require('crypto').constants.SSL_OP_NO_SSLv2 |
                       require('crypto').constants.SSL_OP_NO_SSLv3 |
                       require('crypto').constants.SSL_OP_NO_TLSv1 |
                       require('crypto').constants.SSL_OP_NO_TLSv1_1 |
                       require('crypto').constants.SSL_OP_NO_TLSv1_2
    };

    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);

    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log('\n🔐 ═══════════════════════════════════════════════════════');
        console.log('   BHOKBHOJ SECURE SERVER (HTTPS) STARTED');
        console.log('   ═══════════════════════════════════════════════════════');
        console.log(`   🚀 HTTPS Server: https://localhost:${HTTPS_PORT}`);
        console.log(`   📊 MongoDB URI: ${MONGODB_URI}`);
        console.log(`   🔒 SSL/TLS: ENABLED`);
        console.log(`   🛡️  Encryption: TLS 1.3 (Latest)`);
        console.log(`   🔐 Cipher Suites: AES-256-GCM, ChaCha20-Poly1305`);
        console.log('   ═══════════════════════════════════════════════════════');
        console.log('\n   📝 API Endpoints (HTTPS):');
        console.log(`   • Registration: https://localhost:${HTTPS_PORT}/api/auth/register`);
        console.log(`   • Login: https://localhost:${HTTPS_PORT}/api/auth/login`);
        console.log(`   • Verify OTP: https://localhost:${HTTPS_PORT}/api/auth/verify-otp`);
        console.log('   ═══════════════════════════════════════════════════════\n');
    }).on('error', (err) => {
        console.error('❌ HTTPS Server failed to start:', err.message);
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${HTTPS_PORT} is already in use.`);
        }
    });

    // Optional: Create HTTP server that redirects to HTTPS
    const httpServer = http.createServer((req, res) => {
        res.writeHead(301, { 
            "Location": `https://${req.headers.host.split(':')[0]}:${HTTPS_PORT}${req.url}` 
        });
        res.end();
    });

    httpServer.listen(HTTP_REDIRECT_PORT, '0.0.0.0', () => {
        console.log(`   ↪️  HTTP Redirect: http://localhost:${HTTP_REDIRECT_PORT} → https://localhost:${HTTPS_PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`   ⚠️  HTTP redirect port ${HTTP_REDIRECT_PORT} already in use (skipping redirect server)`);
        }
    });

} else {
    // Fallback to HTTP if SSL certificates don't exist
    console.log('\n⚠️  ═══════════════════════════════════════════════════════');
    console.log('   WARNING: SSL certificates not found!');
    console.log('   ═══════════════════════════════════════════════════════');
    console.log('   Running in HTTP mode (NOT SECURE)');
    console.log('   To enable HTTPS, generate SSL certificates:');
    console.log('   npm run generate-ssl');
    console.log('   ═══════════════════════════════════════════════════════\n');

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
        console.log(`📝 Registration: http://localhost:${PORT}/api/auth/register`);
        console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
    }).on('error', (err) => {
        console.error('❌ Server failed to start:', err.message);
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use.`);
        }
    });
}
