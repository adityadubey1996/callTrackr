const { exec } = require("child_process");
const connectDB = require("./config/dataBaseConnection");
const FileModel = require("./models/fileModel"); // Assume FileModel handles MongoDB schema
const dotenv = require("dotenv");
dotenv.config();
// Function to run the Python script
const runPythonChunking = (filePath) => {
  const pythonCommand = `python3 /Users/adityadubey/calltrackr/server/main.py --chunking ${filePath} --fileId 6770062634d030b19ebee37a`;

  exec(pythonCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Python stderr: ${stderr}`);
      return;
    }
    console.log(`Python stdout: ${stdout}`);
  });
};

// Hardcoded file path (example)
const srtFilePath =
  "/Users/adityadubey/calltrackr/server/transcriptions/testing.srt";

// Execute Python script for chunking
const processFile = async () => {
  try {
    await connectDB(); // Ensure Node.js is connected to MongoDB
    console.log("Node.js connected to MongoDB...");

    // Run the Python script
    runPythonChunking(srtFilePath);

    // Optional: Fetch processed results from MongoDB
    const chunks = await FileModel.find({ filePath: srtFilePath });
    console.log("Processed Chunks:", chunks);
  } catch (error) {
    console.error("Error processing file:", error.message);
  }
};

processFile();
