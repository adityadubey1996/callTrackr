const StorageSingleton = require("../utils/storageSingleton");
const File = require("../models/fileModel");
const { addFileToQueue } = require("../services/transcriptionService");

const generateUploadSignedUrl = async (req, res) => {
  try {
    const { fileName } = req.body;
    const signedUrl = await StorageSingleton.generateSignedUrl(
      fileName,
      "write"
    );
    res.status(200).json({ signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateViewSignedUrl = async (req, res) => {
  try {
    const { fileName } = req.body;
    const signedUrl = await StorageSingleton.generateSignedUrl(
      fileName,
      "read"
    );
    res.status(200).json({ signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("req.params", req.params);
    const file = await File.findById(id);

    const { fileName } = file;
    await StorageSingleton.deleteFile(fileName);
    await File.deleteOne({ fileName }); // Delete metadata from MongoDB
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Creates or updates the status of the file after upload.
 */
const createOrUpdateFileStatus = async (req, res) => {
  try {
    const { fileName, fileType, fileSize, uploadStatus } = req.body;

    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find the file by fileName and update if it exists, otherwise create a new one
    const file = await File.findOneAndUpdate(
      { fileName },
      { fileType, fileSize, uploadStatus, userId },
      { new: true, upsert: true, setDefaultsOnInsert: true } // Create if not exists
    );

    res
      .status(200)
      .json({ message: "File status updated successfully.", file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetch files for a specific user.
 */
const fetchFilesByUser = async (req, res) => {
  console.log("from fetchFilesByUser");
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch files from the database for the given userId
    const files = await File.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ error: "Failed to fetch files for the user." });
  }
};

/**
 * Gets metadata for a specific file.
 */
const getFileMetadata = async (req, res) => {
  try {
    console.log("from getFileMetadata");

    const { fileName } = req.params;

    const file = await File.findOne({ fileName });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates the transcription status of a file.
 */
const updateTranscriptionStatus = async (req, res) => {
  try {
    const { fileName, transcriptionStatus } = req.body;

    const file = await File.findOneAndUpdate(
      { fileName },
      { transcriptionStatus },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lists all files with optional filters.
 */
const listFiles = async (req, res) => {
  try {
    const { uploadStatus, transcriptionStatus } = req.query;

    // Filter by uploadStatus or transcriptionStatus if provided
    const filter = {};
    if (uploadStatus) filter.uploadStatus = uploadStatus;
    if (transcriptionStatus) filter.transcriptionStatus = transcriptionStatus;

    const files = await File.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const queueTranscription = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const file = await File.findOne({ fileName: fileName });
    if (!file) {
      return res.status(400).json({ message: "File not found" });
    }
    // Add file to transcription queue
    await addFileToQueue({ ...file.toObject() });

    res
      .status(201)
      .json({ message: "File added to transcription queue.", file });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file." });
  }
};

module.exports = {
  generateUploadSignedUrl,
  generateViewSignedUrl,
  deleteFile,
  createOrUpdateFileStatus,
  getFileMetadata,
  updateTranscriptionStatus,
  listFiles,
  fetchFilesByUser,
  queueTranscription,
};
