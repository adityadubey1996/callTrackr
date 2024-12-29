const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const StorageSingleton = require("./utils/storageSingleton"); // Adjust the path to your singleton class

async function fetchDownloadURL(fileName) {
  try {
    console.log(`Generating signed URL for file: ${fileName}`);
    const signedUrl = await StorageSingleton.generateSignedUrl(
      fileName,
      "read"
    );
    console.log(`Signed URL generated: ${signedUrl}`);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

async function downloadFile(url, destination) {
  try {
    console.log(`Downloading file from URL: ${url}`);
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

function callTranscriber(localFilePath) {
  return new Promise((resolve, reject) => {
    console.log(`Calling Python transcriber with file: ${localFilePath}`);
    exec(
      `python3 main.py --transcribe "${localFilePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running transcription: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          reject(stderr);
          return;
        }
        console.log(`Transcription Output:\n${stdout}`);
        resolve(stdout);
      }
    );
  });
}

async function main(fileName) {
  try {
    // Step 1: Fetch download URL
    const signedUrl = await fetchDownloadURL(fileName);

    // Step 2: Download file locally
    const localFilePath = path.join(__dirname, fileName);
    await downloadFile(signedUrl, localFilePath);
    console.log(`File downloaded successfully to: ${localFilePath}`);

    // Step 3: Call transcriber
    const transcriptionResult = await callTranscriber(localFilePath);
    console.log("Transcription completed successfully:");
    console.log(transcriptionResult);
  } catch (error) {
    console.error("Error in process:", error);
  }
}

// Example usage
const fileName =
  "videoplayback.mp4-20241225T095533615Z-6769371bc33b9fc6fbe876a7"; // Replace with your actual file name in the bucket
main(fileName);
