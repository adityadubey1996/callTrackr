const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { updateCors } = require("./utils/updateCors");
const connectDB = require("./config/dataBaseConnection");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const transcriptionLogRoutes = require("./routes/transcriptionLogRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const metricRoutes = require("./routes/metricRoutes");
const metricResultRoutes = require("./routes/metricResultRoutes");
connectDB();

// Call the CORS update function during server startup
(async () => {
  try {
    console.log("Updating CORS configuration...");
    await updateCors();
    console.log("CORS configuration updated successfully.");
  } catch (error) {
    console.error("Error while updating CORS configuration:", error.message);
  }
})();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://34.68.51.196:4173",
  "https://your-frontend-domain.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" })); // Adjust limit as needed
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/logs", transcriptionLogRoutes);
app.use("/conversation", conversationRoutes);
app.use("/chat", chatRoutes);
app.use("/metrics", metricRoutes);
app.use("/metrics-result", metricResultRoutes);

// Add transcription log routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});

module.exports = app;
