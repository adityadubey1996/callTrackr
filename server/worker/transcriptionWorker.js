const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const embeddingQueue = require("../services/embeddingService"); // Create an embedding queue module

process.on("message", (fileDetails) => {
  console.log("[Worker] Received file details:", fileDetails);

  const { filePath, fileName, fileDownloadedPath, _id: fileId } = fileDetails;

  // Ensure the 'transcriptions' folder exists
  const transcriptionFolder = path.join(__dirname, "transcriptions");
  if (!fs.existsSync(transcriptionFolder)) {
    fs.mkdirSync(transcriptionFolder);
  }

  // Execute the transcription command
  console.log("[Worker] Starting transcription using Python script...");
  exec(
    `python3 main.py --transcribe "${fileDownloadedPath}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("[Worker] Transcription failed:", error.message);
        process.send({ status: "failure", error: error.message });
        return;
      }

      if (stderr) {
        console.warn("[Worker] Transcription process warnings:", stderr);
      }

      console.log("[Worker] Transcription script output:", stdout);

      // Extract file paths from stdout
      const srtFilePathMatch = stdout.match(
        /Transcription saved to: (.+\.srt)/
      );
      const txtFilePathMatch = stdout.match(/Transcript saved to: (.+\.txt)/);
      const transcriptionFileNameMatch = stdout.match(
        /Transcription File Name: (.+)/
      );

      if (
        !srtFilePathMatch ||
        !txtFilePathMatch ||
        !transcriptionFileNameMatch
      ) {
        console.error("[Worker] Failed to parse transcription file details.");
        process.send({ status: "failure", error: "Invalid stdout format." });
        return;
      }

      const srtFilePath = srtFilePathMatch[1].trim();
      const txtFilePath = txtFilePathMatch[1].trim();
      const transcriptionFileName = transcriptionFileNameMatch[1].trim();

      console.log("[Worker] Transcription successful.");
      console.log("[Worker] SRT File Path:", srtFilePath);
      console.log("[Worker] TXT File Path:", txtFilePath);
      console.log("[Worker] Transcription File Name:", transcriptionFileName);

      console.log("[Worker] File added to embedding queue.");

      process.send({
        status: "success",
        srtFilePath,
        txtFilePath,
        transcriptionFileName,
      });
    }
  );
});
