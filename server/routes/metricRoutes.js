const express = require("express");
const {
  getMetricSuggestions,
  processMetrics,
  validateMetric,
} = require("../controllers/metricController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/suggest-metrics", authenticate, getMetricSuggestions);

router.post("/process-metrics", authenticate, processMetrics);

router.post("/validate", authenticate, validateMetric);

module.exports = router;
