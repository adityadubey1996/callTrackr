const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Get credentials and cluster details from .env
    const username = encodeURIComponent(process.env.MONGO_USERNAME);
    const password = encodeURIComponent(process.env.MONGO_PASSWORD);
    const cluster = process.env.MONGO_CLUSTER;
    const options = process.env.MONGO_OPTIONS;

    // Construct the MongoDB URI
    const connectionString = `mongodb+srv://${username}:${password}@${cluster}/?${options}`;
    console.log("connectionString", connectionString);
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
