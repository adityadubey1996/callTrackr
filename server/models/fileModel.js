const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    uploadStatus: {
      type: String,
      enum: ["Uploaded", "Failed", "In_Progress"],
      default: "Uploaded",
    },
    transcriptionStatus: {
      type: String,
      enum: ["Pending", "Completed", "In_Progress", "Failed"],
      default: "Pending",
    },
    transcriptionFileName: { type: String },
    createdAt: { type: Date, default: Date.now },
    isFileReadyForChat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
