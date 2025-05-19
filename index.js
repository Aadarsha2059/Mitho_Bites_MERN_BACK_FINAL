const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes"); // assuming routes/ is in the same folder as this file

const app = express();

// Parse incoming JSON (MUST come before routes)
app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/mydbb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // stops server if DB connection fails
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
