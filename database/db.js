const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Database connected"))
    .catch((error) => console.error("Error:", error));
};

module.exports = connectDB;