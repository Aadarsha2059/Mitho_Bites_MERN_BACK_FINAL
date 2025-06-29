const mongoose = require("mongoose");
const CONNECTION_STRING = process.env.MONGODB_URI || "mongodb://localhost:27017/mithobites";

const connectDB = async () => {
  try {
    await mongoose.connect(CONNECTION_STRING);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // exit with failure
  }
};

module.exports = connectDB;