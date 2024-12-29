const mongoose = require("mongoose");
const File = require("../models/fileModel");
const Conversation = require("../models/ConversationModel");
const Chat = require("../models/ChatModel");

// Fetch files eligible for conversations (transcription completed)
const getEligibleFiles = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      throw Error("userId required, but not found");
    }

    const files = await File.find({
      userId,
      // transcriptionStatus: "Completed",
      // isFileReadyForChat: true,
    });

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching eligible files:", error.message);
    res.status(500).json({ message: "Failed to fetch eligible files." });
  }
};

// Fetch all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      throw Error("userId required, but not found");
    }
    const conversations = await Conversation.find({ userId }).populate({
      path: "fileIds",
      select: "fileName fileType transcriptionStatus createdAt",
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error fetching user conversations:", error.message);
    res.status(500).json({ message: "Failed to fetch user conversations." });
  }
};

// Create a new conversation for a file
const createConversation = async (req, res) => {
  try {
    const { fileIds, title } = req.body;
    const { id: userId } = req.user;

    if (!userId) {
      throw Error("User ID is required, but not found.");
    }

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: "File IDs are required." });
    }

    // Ensure all files belong to the user and transcription is completed
    const files = await File.find({
      _id: { $in: fileIds },
      userId,
      transcriptionStatus: "Completed",
      isFileReadyForChat: true,
    });

    if (files.length !== fileIds.length) {
      return res.status(400).json({
        message: "Some files are invalid or ineligible for a conversation.",
      });
    }

    // Create a new conversation
    const newConversation = new Conversation({
      userId,
      fileIds,
      title,
    });
    await newConversation.save();

    res.status(201).json({ conversation: newConversation });
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({ message: "Failed to create conversation." });
  }
};

// Fetch all chats for a conversation
const getChatsForConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const chats = await Chat.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).json({ message: "Failed to fetch chats." });
  }
};

// Add a message to a conversation
const addChatMessage = async (req, res) => {
  try {
    const { conversationId, message, metadata } = req.body;
    const userId = req.user.id;

    const newChat = new Chat({ conversationId, userId, message, metadata });
    await newChat.save();

    res.status(201).json({ chat: newChat });
  } catch (error) {
    console.error("Error adding chat message:", error.message);
    res.status(500).json({ message: "Failed to add chat message." });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;

    if (!conversationId || !userId) {
      return res
        .status(400)
        .json({ message: "Conversation ID and user ID are required." });
    }

    // Find the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Conversation not found or unauthorized access." });
    }

    // Delete associated chats
    await Chat.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({
      message: "Conversation and associated chats deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error.message);
    res
      .status(500)
      .json({ message: "Failed to delete conversation. Try again later." });
  }
};

const getConverstationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    // Fetch the conversation
    const conversation = await Conversation.findById(conversationId).populate(
      "fileIds"
    );
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Fetch all chats for this conversation
    const chats = await Chat.find({ conversationId }).sort({ createdAt: 1 });

    // Extract associated files
    const fileIds = conversation.fileIds.map((file) => file._id);
    const files = await File.find({ _id: { $in: fileIds } });

    // Prepare the response
    const response = {
      conversation,
      chats,
      files,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getEligibleFiles,
  getUserConversations,
  createConversation,
  getChatsForConversation,
  addChatMessage,
  deleteConversation,
  getConverstationById,
};
