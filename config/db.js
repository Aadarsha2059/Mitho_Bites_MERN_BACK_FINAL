const mongoose = require("mongoose");
const CONNECTION_STRING = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // exit with failure
  }
};

module.exports = connectDB;
