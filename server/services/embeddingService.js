const Queue = require("bull");
const { fork } = require("child_process");
const FileModel = require("../models/fileModel");
const { notifyUser } = require("./websocketService");
const transcriptionLogModel = require("../models/transcriptionLogModel");

const embeddingQueue = new Queue("embeddingQueue");

const logTranscriptionUpdate = async (fileId, userId, status, message) => {
  try {
    await transcriptionLogModel.create({ fileId, userId, status, message });
    console.log(`[Log] ${status}: ${message}`);
  } catch (error) {
    console.error("[Log] Error saving transcription log:", error.message);
  }
};

embeddingQueue.process(async (job) => {
  const { fileId, filePath, userId, fileName } = job.data;

  if (!fileId || !filePath || !userId || !fileName) {
    console.error(
      "[Embedding Queue] Missing required properties: fileId, filePath, userId, or fileName."
    );
    throw new Error("Missing required properties for embedding job.");
  }
  console.log(
    `[Embedding Queue] Processing file: ${filePath} with ID: ${fileId}`
  );

  try {
    notifyUser(userId, {
      action: "embeddings_update",
      type: "update",
      status: "In_progress",
      message: `Embeddings for file ${fileName} are in progress.`,
    });

    const child = fork("../server/worker/embeddingWorker.js");

    // Send data to the worker process
    child.send({ fileId, filePath, userId, fileName });

    child.on("message", async (result) => {
      if (result.status === "success") {
        // Update the file status to ready for chat
        await FileModel.findByIdAndUpdate(fileId, {
          isFileReadyForChat: true,
        });

        await logTranscriptionUpdate(
          fileId,
          userId,
          "Completed",
          `Embedding completed for file ${fileName}, with details ${JSON.stringify(
            result
          )}`
        );

        notifyUser(userId, {
          action: "embeddings_update",
          type: "update",
          status: "Completed",
          message: `Embeddings for file ${fileName} have been completed and are ready for chat.`,
        });

        console.log(
          `[Embedding Queue] File ${fileName} embeddings completed successfully.`
        );
      } else {
        throw new Error(
          result.error || "Embedding worker failed unexpectedly."
        );
      }
    });

    child.on("error", async (error) => {
      console.error(
        `[Embedding Queue] Error in worker process: ${error.message}`
      );

      // Update the file status to not ready for chat
      await FileModel.findByIdAndUpdate(fileId, {
        isFileReadyForChat: false,
      });

      await logTranscriptionUpdate(
        fileId,
        userId,
        "Failed",
        `Embedding failed for file ${fileName}, with error: ${error.message}`
      );

      notifyUser(userId, {
        action: "embeddings_update",
        type: "update",
        status: "Failed",
        message: `Embeddings for file ${fileName} have failed.`,
      });

      child.kill();
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        console.error(`[Embedding Queue] Worker exited with code ${code}`);
      }
    });
  } catch (error) {
    console.error(
      `[Embedding Queue] Error processing file ${fileName}:`,
      error.message
    );

    // Update the file status to not ready for chat
    await FileModel.findByIdAndUpdate(fileId, {
      isFileReadyForChat: false,
    });

    await logTranscriptionUpdate(
      fileId,
      userId,
      "Failed",
      `Embedding failed for file ${fileName}, with error: ${error.message}`
    );

    notifyUser(userId, {
      action: "embeddings_update",
      type: "update",
      status: "Failed",
      message: `Embeddings for file ${fileName} have failed.`,
    });
  }
});

module.exports = embeddingQueue;
