const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File", // Reference to the File model
        required: true,
      },
    ],
    title: { type: String, required: true }, // Title for the conversation
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
