const mongoose = require("mongoose");

const MetricListSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // Unique ID for the metric list
    metrics: [
      {
        id: { type: Number, required: true }, // Metric ID
        name: { type: String, required: true }, // Metric name
        type: {
          type: String,
          required: true,
          enum: ["Yes/No", "Numeric", "Text"],
        }, // Metric type
        description: { type: String }, // Metric description
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    fileIds: [{ type: String, required: true }], // Associated file IDs
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const MetricList = mongoose.model("MetricList", MetricListSchema);

module.exports = MetricList;
