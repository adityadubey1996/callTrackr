const express = require("express");
const {
  generateUploadSignedUrl,
  generateViewSignedUrl,
  deleteFile,
  createOrUpdateFileStatus,
  getFileMetadata,
  updateTranscriptionStatus,
  listFiles,
  fetchFilesByUser,
  queueTranscription,
  getFileById,
} = require("../controllers/fileController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/upload-signed-url", authenticate, generateUploadSignedUrl);
router.post("/view-signed-url", authenticate, generateViewSignedUrl);
router.post("/status", authenticate, createOrUpdateFileStatus); // Create or update file status
router.patch("/transcription-status", authenticate, updateTranscriptionStatus); // Update transcription status
router.get("/", authenticate, listFiles); // List files with optional filters
router.get("/getFileList", authenticate, fetchFilesByUser);
router.post("/start-transcription", authenticate, queueTranscription);
router.get("/:id", authenticate, getFileById);
router.get("/:fileName", authenticate, getFileMetadata); // Get file metadata
router.delete("/:id", authenticate, deleteFile);

module.exports = router;
