const mongoose = require("mongoose");

const MetricResultSchema = new mongoose.Schema(
  {
    metricListId: { type: String, required: true, ref: "MetricList" }, // Reference to the MetricList
    metricId: { type: Number, required: true }, // Metric ID
    name: { type: String, required: true }, // Metric name
    fileId: { type: String, required: true }, // Associated file ID
    result: { type: mongoose.Schema.Types.Mixed, default: null }, // Result value (e.g., Yes/No or Number), null if error
    resultId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    context: [
      {
        text: { type: String, required: false }, // Text content, optional for error cases
        fileId: { type: String, required: false }, // Context file ID, optional for error cases
        startTime: { type: String, required: false }, // Start time, optional for error cases
        endTime: { type: String, required: false }, // End time, optional for error cases
        sentiment: {
          label: { type: String, default: null }, // Sentiment label
          score: { type: Number, default: null }, // Sentiment score
        },
        keywords: [
          {
            keyword: { type: String }, // Keyword
            score: { type: Number }, // Relevance score
          },
        ],
      },
    ],
    error: { type: String, default: null }, // Error message, null if no error
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const MetricResult = mongoose.model("MetricResult", MetricResultSchema);

module.exports = MetricResult;
