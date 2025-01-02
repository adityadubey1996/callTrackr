const MetricList = require("../models/MetricList");
const MetricResult = require("../models/MetricResultSchma");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// Create a MetricList and optionally add results
const createMetricList = async (req, res) => {
  try {
    const { metrics, fileIds, results } = req.body;
    const { id: userId } = req.user;
    if (!userId) {
      throw Error("userId required, but not found");
    }
    if (!metrics || !fileIds) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const id = uuidv4(); // Generate a unique ID

    const metricList = new MetricList({ id, metrics, fileIds, userId });
    await metricList.save();

    // Handle results if provided
    if (results && results.length > 0) {
      for (const result of results) {
        const metricResult = new MetricResult({
          userId,
          metricListId: metricList.id,
          metricId: result.id,
          ...result,
        });
        await metricResult.save();
      }
    }

    res.status(201).json({
      message: "MetricList created successfully",
      metricList,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

// Add results to an existing MetricList
const addResultsToMetricList = async (req, res) => {
  try {
    const { metricListId, results } = req.body;

    // Check if the MetricList exists
    const metricList = await MetricList.findById(metricListId);
    if (!metricList) {
      return res.status(404).json({ message: "MetricList not found" });
    }

    // Save each result
    for (const result of results) {
      const metricResult = new MetricResult({
        metricListId: metricListId,
        ...result,
      });
      await metricResult.save();
    }

    res.status(201).json({
      message: "Results added to MetricList successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a MetricList by ID (with or without results)
const getMetricListById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the MetricList and populate results
    const metricList = await MetricList.findById(id);
    if (!metricList) {
      return res.status(404).json({ message: "MetricList not found" });
    }
    const objectId = mongoose.Types.ObjectId(userId);
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid UserId format" });
    }

    // Find MetricLists for the user
    const metricLists = await MetricList.find({ userId: objectId });

    if (!metricLists || metricLists.length === 0) {
      return res
        .status(404)
        .json({ message: "No MetricLists found for this userId." });
    }
    res.status(200).json({ metricList, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMetricListsByUserId = async (req, res) => {
  try {
    const { id: userId } = req.user;
    if (!userId) {
      throw Error("userId required, but not found");
    }
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log("objectId from getMetricListsByUserId", objectId);
    // Find MetricLists that match the userId
    const metricLists = await MetricList.find({ userId });

    if (!metricLists || metricLists.length === 0) {
      return res
        .status(404)
        .json({ message: "No MetricLists found for this userId." });
    }

    res.status(200).json(metricLists);
  } catch (error) {
    console.error("Error fetching MetricLists by userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMetricResultsByUserIdAndMetricListId = async (req, res) => {
  try {
    const { userId, metricListId } = req.params;

    // Verify if the MetricList exists for the userId
    const metricList = await MetricList.findOne({
      _id: metricListId,
      "fileIds.userId": userId,
    });

    if (!metricList) {
      return res.status(404).json({
        message: "No MetricList found for this userId and metricListId.",
      });
    }

    // Fetch MetricResults associated with the MetricList
    const metricResults = await MetricResult.find({ metricListId });

    if (!metricResults || metricResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No MetricResults found for this MetricList." });
    }

    res.status(200).json(metricResults);
  } catch (error) {
    console.error(
      "Error fetching MetricResults by userId and metricListId:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMetricListById,
  addResultsToMetricList,
  createMetricList,
  getMetricListsByUserId,
  getMetricResultsByUserIdAndMetricListId,
};