require("dotenv").config()
const app = require("./index")

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites"

// Set default environment variables if not provided
process.env.MONGODB_URI = MONGODB_URI
process.env.SECRET = process.env.SECRET || "your-secret-key-here"

app.listen(
    PORT,
    () =>{
        console.log(`Server running on port ${PORT}`)
        console.log(`MongoDB URI: ${MONGODB_URI}`)
    }
)