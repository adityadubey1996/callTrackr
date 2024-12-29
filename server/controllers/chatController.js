const ChatModel = require("../models/ChatModel");
const { chatQueue } = require("../services/conversationService");

// Create a new chat and add to queue
const createChat = async (req, res) => {
  try {
    const { conversationId, query, isRetry, editChatId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!conversationId || !query) {
      return res
        .status(400)
        .json({ message: "Conversation ID and query are required." });
    }

    // If it's a retry or edit, delete the old chat entry
    if (isRetry || editChatId) {
      await ChatModel.findByIdAndDelete(editChatId);
    }

    // Save the new chat in database
    const chat = await ChatModel.create({
      userId,
      conversationId,
      userQuery: query,
      status: "Pending",
    });

    // Add job to queue
    chatQueue.add({
      chatId: chat._id,
      conversationId,
      query,
      userId,
    });

    res
      .status(201)
      .json({ message: "Chat created and queued successfully.", chat });
  } catch (error) {
    console.error("Error creating chat:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getSuggestions = async (req, res) => {};

module.exports = { createChat };
