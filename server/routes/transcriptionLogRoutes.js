const express = require("express");
const {
  getLogsByFileId,
  getLogsByUserId,
} = require("../controllers/logController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// Get logs by file ID
router.post("/file", authenticate, getLogsByFileId);

// Get logs by user ID
router.get("/user/:userId", authenticate, getLogsByUserId);

module.exports = router;
