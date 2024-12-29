const express = require("express");
const {
  getEligibleFiles,
  getUserConversations,
  createConversation,
  getChatsForConversation,
  addChatMessage,
  deleteConversation,
  getConverstationById,
} = require("../controllers/conversationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Fetch eligible files for conversations
router.get("/eligible-files", authMiddleware, getEligibleFiles);

// Fetch all conversations for a user
router.get("/", authMiddleware, getUserConversations);

// Create a new conversation
router.post("/", authMiddleware, createConversation);

// Fetch all chats for a conversation
router.get("/:conversationId/chats", authMiddleware, getChatsForConversation);

// Add a chat message to a conversation
router.post("/:conversationId/chats", authMiddleware, addChatMessage);

router.delete("/:conversationId", authMiddleware, deleteConversation);

router.get("/:conversationId", authMiddleware, getConverstationById);

module.exports = router;
