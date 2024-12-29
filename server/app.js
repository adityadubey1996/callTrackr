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
  "https://your-frontend-domain.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/logs", transcriptionLogRoutes);
app.use("/conversation", conversationRoutes);
app.use("/chat", chatRoutes);
// Add transcription log routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});

module.exports = app;
