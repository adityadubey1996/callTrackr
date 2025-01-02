const express = require("express");

const {
  getMetricListById,
  addResultsToMetricList,
  createMetricList,
  getMetricResultsByUserIdAndMetricListId,
  getMetricListsByUserId,
} = require("../controllers/metricResultController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// Route for creating a metric with or without results
router.post("/create", authenticate, createMetricList);

// Route for adding results to an existing MetricList
router.post("/add-results", authenticate, addResultsToMetricList);

router.get("/metric-lists", authenticate, getMetricListsByUserId);

// Route for fetching a metric by ID (with results)
router.get("/:id", authenticate, getMetricListById);

router.get(
  "/:userId/:metricListId",
  authenticate,
  getMetricResultsByUserIdAndMetricListId
);

module.exports = router;
