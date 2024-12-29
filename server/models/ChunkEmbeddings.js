const mongoose = require("mongoose");

const chunkEmbeddingSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File", // Reference to the File model
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    text: { type: String, required: true },
    summary: { type: String, required: true },
    embedding: { type: [Number], required: true }, // Storing vector embeddings
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChunkEmbedding", chunkEmbeddingSchema);
