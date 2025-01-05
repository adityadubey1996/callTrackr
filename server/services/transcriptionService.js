const Queue = require("bull");
const { fork } = require("child_process");
const fs = require("fs");
const axios = require("axios");
const File = require("../models/fileModel"); // File model
const StorageSingleton = require("../utils/storageSingleton"); // StorageSingleton class
const path = require("path");
const { destructureUniqueFileName } = require("../config/utils");
const transcriptionLogModel = require("../models/transcriptionLogModel");
const { notifyUser } = require("./websocketService");
const embeddingQueue = require("./embeddingService");

// Initialize the transcription queue
const transcriptionQueue = new Queue("transcriptionQueue");

// Generate signed URL for upload
const generateUploadSignedUrl = async (fileName) => {
  try {
    if (!fileName) {
      throw new Error("FileName is required");
    }
    return await StorageSingleton.generateSignedUrl(fileName, "write");
  } catch (error) {
    console.error("Error generating upload signed URL:", error.message);
    throw error;
  }
};

// Generate signed URL for download
const generateDownloadSignedUrl = async (fileName) => {
  try {
    if (!fileName) {
      throw new Error("FileName is required");
    }
    return await StorageSingleton.generateSignedUrl(fileName, "read");
  } catch (error) {
    console.error("Error generating download signed URL:", error.message);
    throw error;
  }
};

// Determine destination path
const getDestinationPath = (fileName) => {
  if (!fileName) {
    throw new Error("FileName is required to generate destination path");
  }
  const parentDirectory = path.join(__dirname, "..");
  const transcriptionFolder = path.join(parentDirectory, "audio-or-video-file");

  if (!fs.existsSync(transcriptionFolder)) {
    fs.mkdirSync(transcriptionFolder);
  }

  const { originalFileName } = destructureUniqueFileName(fileName);
  return path.join(transcriptionFolder, originalFileName);
};

// Download file using signed URL
const downloadFileUsingSignedUrl = async (signedUrl, destinationPath) => {
  try {
    const response = await axios.get(signedUrl, { responseType: "stream" });
    if (response.status === 200) {
      const writer = fs.createWriteStream(destinationPath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve({ destinationPath }));
        writer.on("error", (error) => reject(error));
      });
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error downloading file:", error.message);
    throw error;
  }
};

// Upload file using signed URL
const uploadFileUsingSignedUrl = async (signedUrl, localFilePath) => {
  try {
    const fileStream = fs.createReadStream(localFilePath);
    const response = await axios.put(signedUrl, fileStream, {
      headers: { "Content-Type": "application/octet-stream" },
    });
    if (response.status !== 200) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
};

const logTranscriptionUpdate = async (fileId, userId, status, message) => {
  try {
    await transcriptionLogModel.create({ fileId, userId, status, message });
    console.log(`[Log] ${status}: ${message}`);
  } catch (error) {
    console.error("[Log] Error saving transcription log:", error.message);
  }
};

// Process transcription queue jobs
// transcriptionQueue.process(async (job) => {
//   const fileDetails = job.data;
//   console.log(`Processing transcription for file: ${fileDetails.fileName}`);

//   try {
//     await File.findByIdAndUpdate(fileDetails._id, {
//       transcriptionStatus: "In_Progress",
//     });
//     await logTranscriptionUpdate(
//       fileDetails._id,
//       fileDetails.userId,
//       "In_Progress",
//       `Transcription started for file ${fileDetails.fileName}.`
//     );
//     notifyUser(fileDetails.userId, {
//       action: "transcription_update",
//       type: "update",
//       status: "In_Progress",
//       message: `Your transcription for file ${fileDetails.fileName} is in progress.`,
//     });

//     const downloadUrl = await generateDownloadSignedUrl(fileDetails.fileName);
//     const destinationPath = getDestinationPath(fileDetails.fileName);
//     const { destinationPath: fileDownloadedPath } =
//       await downloadFileUsingSignedUrl(downloadUrl, destinationPath);

//     const child = fork("../server/worker/transcriptionWorker.js");
//     child.send({ ...fileDetails, fileDownloadedPath });

//     child.on("message", async (result) => {
//       if (result.status === "success") {
//         const { srtFilePath, transcriptionFileName } = result;

//         const uploadSignedUrl = await generateUploadSignedUrl(
//           transcriptionFileName
//         );
//         await uploadFileUsingSignedUrl(uploadSignedUrl, srtFilePath);

//         await File.findByIdAndUpdate(fileDetails._id, {
//           transcriptionStatus: "Completed",
//           transcriptionFileName: transcriptionFileName,
//         });
//         await logTranscriptionUpdate(
//           fileDetails._id,
//           fileDetails.userId,
//           "Completed",
//           `Transcription completed for file ${
//             fileDetails.fileName
//           }, with details ${JSON.stringify(result)}`
//         );
//         console.log(
//           `Transcription completed for file: ${fileDetails.fileName}`
//         );
//         notifyUser(fileDetails.userId, {
//           action: "transcription_update",

//           type: "update",
//           status: "Completed",
//           message: `Your transcription for file ${fileDetails.fileName} is completed.`,
//         });

//         // Enqueue the file for embedding processing
//         // embeddingQueue.add({
//         //   fileId: fileDetails._id,
//         //   filePath: srtFilePath,
//         //   userId: fileDetails.userId,
//         //   fileName: fileDetails.fileName,
//         // });
//       } else {
//         console.error(`Transcription failed for file: ${fileDetails.fileName}`);
//         await File.findByIdAndUpdate(fileDetails._id, {
//           transcriptionStatus: "Failed",
//         });
//         notifyUser(fileDetails.userId, {
//           action: "transcription_update",

//           type: "update",
//           status: "Failed",
//           message: `Your transcription for file ${fileDetails.fileName} has failed.`,
//         });
//         await logTranscriptionUpdate(
//           fileDetails._id,
//           fileDetails.userId,
//           "Failed",
//           `Transcription Failed for file ${
//             fileDetails.fileName
//           }, with details ${JSON.stringify(result)}`
//         );
//       }

//       child.kill();
//     });

//     child.on("error", async (error) => {
//       console.error("Error in child process:", error.message);
//       await File.findByIdAndUpdate(fileDetails._id, {
//         transcriptionStatus: "Failed",
//       });
//       child.kill();
//     });
//   } catch (error) {
//     console.error("Error during transcription processing:", error.message);
//     await File.findByIdAndUpdate(fileDetails._id, {
//       transcriptionStatus: "Failed",
//     });
//     await logTranscriptionUpdate(
//       fileDetails._id,
//       fileDetails.userId,
//       "Failed",
//       `Transcription failed for file ${fileDetails.fileName}, with error ${error}`
//     );

//     notifyUser(fileDetails.userId, {
//       action: "transcription_update",

//       type: "update",
//       status: "Failed",
//       message: `An error occurred during transcription for file ${fileDetails.fileName}.`,
//     });
//   }
// });

transcriptionQueue.process(async (job) => {
  const fileDetails = job.data;
  console.log(`Processing transcription for file: ${fileDetails.fileName}`);

  try {
    console.log(
      `[INFO] Marking transcription as "In_Progress" for file: ${fileDetails.fileName}`
    );
    await File.findByIdAndUpdate(fileDetails._id, {
      transcriptionStatus: "In_Progress",
    });

    console.log(
      `[INFO] Logging transcription update for file: ${fileDetails.fileName}`
    );
    await logTranscriptionUpdate(
      fileDetails._id,
      fileDetails.userId,
      "In_Progress",
      `Transcription started for file ${fileDetails.fileName}.`
    );

    console.log(
      `[INFO] Notifying user ${fileDetails.userId} about progress of file: ${fileDetails.fileName}`
    );
    notifyUser(fileDetails.userId, {
      action: "transcription_update",
      type: "update",
      status: "In_Progress",
      message: `Your transcription for file ${fileDetails.fileName} is in progress.`,
    });

    console.log(
      `[INFO] Generating signed download URL for file: ${fileDetails.fileName}`
    );
    const downloadUrl = await generateDownloadSignedUrl(fileDetails.fileName);

    console.log(
      `[INFO] Resolving destination path for file: ${fileDetails.fileName}`
    );
    const destinationPath = getDestinationPath(fileDetails.fileName);

    console.log(`[INFO] Downloading file: ${fileDetails.fileName}`);
    const { destinationPath: fileDownloadedPath } =
      await downloadFileUsingSignedUrl(downloadUrl, destinationPath);

    console.log(
      `[INFO] Forking child process for transcription of file: ${fileDetails.fileName}`
    );
    const child = fork("../server/worker/transcriptionWorker.js");
    child.send({ ...fileDetails, fileDownloadedPath });

    child.on("message", async (result) => {
      if (result.status === "success") {
        console.log(
          `[SUCCESS] Transcription successful for file: ${fileDetails.fileName}`
        );
        const { srtFilePath, transcriptionFileName } = result;

        console.log(
          `[INFO] Generating signed upload URL for transcription file: ${transcriptionFileName}`
        );
        const uploadSignedUrl = await generateUploadSignedUrl(
          transcriptionFileName
        );

        console.log(
          `[INFO] Uploading transcription file for file: ${fileDetails.fileName}`
        );
        await uploadFileUsingSignedUrl(uploadSignedUrl, srtFilePath);

        console.log(
          `[INFO] Updating file record as "Completed" for file: ${fileDetails.fileName}`
        );
        await File.findByIdAndUpdate(fileDetails._id, {
          transcriptionStatus: "Completed",
          transcriptionFileName: transcriptionFileName,
        });

        console.log(
          `[INFO] Logging transcription completion for file: ${fileDetails.fileName}`
        );
        await logTranscriptionUpdate(
          fileDetails._id,
          fileDetails.userId,
          "Completed",
          `Transcription completed for file ${
            fileDetails.fileName
          }, with details ${JSON.stringify(result)}`
        );

        console.log(
          `[INFO] Notifying user ${fileDetails.userId} about completion of file: ${fileDetails.fileName}`
        );
        notifyUser(fileDetails.userId, {
          action: "transcription_update",
          type: "update",
          status: "Completed",
          message: `Your transcription for file ${fileDetails.fileName} is completed.`,
        });

        // Uncomment the embedding queue logic if needed
        // console.log(`[INFO] Enqueuing file for embedding processing: ${fileDetails.fileName}`);
        // embeddingQueue.add({
        //   fileId: fileDetails._id,
        //   filePath: srtFilePath,
        //   userId: fileDetails.userId,
        //   fileName: fileDetails.fileName,
        // });
      } else {
        console.error(
          `[ERROR] Transcription failed for file: ${fileDetails.fileName}`
        );
        await File.findByIdAndUpdate(fileDetails._id, {
          transcriptionStatus: "Failed",
        });

        console.log(
          `[INFO] Notifying user ${fileDetails.userId} about failure of file: ${fileDetails.fileName}`
        );
        notifyUser(fileDetails.userId, {
          action: "transcription_update",
          type: "update",
          status: "Failed",
          message: `Your transcription for file ${fileDetails.fileName} has failed.`,
        });

        await logTranscriptionUpdate(
          fileDetails._id,
          fileDetails.userId,
          "Failed",
          `Transcription Failed for file ${
            fileDetails.fileName
          }, with details ${JSON.stringify(result)}`
        );
      }

      console.log(
        `[INFO] Terminating child process for file: ${fileDetails.fileName}`
      );
      child.kill();
    });

    child.on("error", async (error) => {
      console.error(
        `[ERROR] Child process error for file: ${fileDetails.fileName}: ${error.message}`
      );
      await File.findByIdAndUpdate(fileDetails._id, {
        transcriptionStatus: "Failed",
      });
      child.kill();
    });
  } catch (error) {
    console.error(
      `[ERROR] Error during transcription processing for file: ${fileDetails.fileName}: ${error.message}`
    );
    await File.findByIdAndUpdate(fileDetails._id, {
      transcriptionStatus: "Failed",
    });

    console.log(
      `[INFO] Logging failure update for file: ${fileDetails.fileName}`
    );
    await logTranscriptionUpdate(
      fileDetails._id,
      fileDetails.userId,
      "Failed",
      `Transcription failed for file ${fileDetails.fileName}, with error ${error}`
    );

    console.log(
      `[INFO] Notifying user ${fileDetails.userId} about failure of file: ${fileDetails.fileName}`
    );
    notifyUser(fileDetails.userId, {
      action: "transcription_update",
      type: "update",
      status: "Failed",
      message: `An error occurred during transcription for file ${fileDetails.fileName}.`,
    });
  }
});

// Add file to transcription queue
const addFileToQueue = async (fileDetails) => {
  try {
    await transcriptionQueue.add(fileDetails);
    console.log(`File added to transcription queue: ${fileDetails.fileName}`);
  } catch (error) {
    console.error("Error adding file to queue:", error.message);
    throw error;
  }
};

module.exports = { addFileToQueue };
