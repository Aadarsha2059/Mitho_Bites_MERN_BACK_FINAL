require("dotenv").config()
const app = require("./index")

const PORT = process.env.PORT || 5050
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites"

// Set default environment variables if not provided
process.env.MONGODB_URI = MONGODB_URI
process.env.SECRET = process.env.SECRET || "your-secret-key-here"

app.listen(
    PORT,
    () =>{
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`📊 MongoDB URI: ${MONGODB_URI}`)
        
        console.log(`📝 Registration: http://localhost:${PORT}/api/auth/register`)
        console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`)
    }
).on('error', (err) => {
    console.error('❌ Server failed to start:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop other servers or use a different port.`);
    }
});