const { metricQueue } = require("../services/metricService");
const { notifyUser } = require("../services/websocketService");
const { exec } = require("child_process");

const getMetricSuggestions = async (req, res) => {
  const { fileId } = req.body;
  const { id: userId } = req.user;

  console.log("[Metric Suggestion] Request received:", { fileId, userId });

  if (!fileId || !userId) {
    console.error("[Metric Suggestion] Missing fileId or userId");
    return res.status(400).json({ error: "Missing fileId or userId" });
  }

  try {
    console.log(
      "[Metric Suggestion] Sending in-progress notification to user:",
      userId
    );
    notifyUser(userId, {
      action: "metric_suggestion",
      status: "In_Progress",
      message: "Generating metric suggestions...",
    });

    console.log(
      `[Metric Suggestion] Executing Python script for fileId: ${fileId}`
    );
    exec(
      `python3 main.py --create_metric_suggestions ${fileId}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            "[Metric Suggestion] Error generating suggestions:",
            error.message
          );
          notifyUser(userId, {
            action: "metric_suggestion",
            status: "Failed",
            message: "Failed to generate metric suggestions.",
          });
          return res.status(500).json({ error: error.message });
        }

        const trimmedStdout = stdout.trim(); // Remove any leading/trailing whitespace
        const match = trimmedStdout.match(
          /METRIC_SUGGESTIONS:\s*(\[[\s\S]*?\])/
        ); // Updated regex

        if (match) {
          try {
            const suggestions = JSON.parse(match[1]);

            console.log(
              "[Metric Suggestion] Suggestions generated:",
              suggestions
            );
            notifyUser(userId, {
              action: "metric_suggestion",
              status: "Completed",
              message: "Metric suggestions generated successfully.",
              data: suggestions,
            });

            res.json(suggestions);
          } catch (error) {
            console.error(
              "[Metric Suggestion] Failed to parse suggestions:",
              error.message
            );
            notifyUser(userId, {
              action: "metric_suggestion",
              status: "Failed",
              message: "Failed to parse metric suggestions.",
            });
            res
              .status(500)
              .json({ error: "Failed to parse metric suggestions." });
          }
        } else {
          notifyUser(userId, {
            action: "metric_suggestion",
            status: "Failed",
            message: "Failed to parse metric suggestions.",
          });
          console.error("[Metric Suggestion] No match found in stdout.");
          res
            .status(500)
            .json({ error: "Failed to parse metric suggestions." });
        }
      }
    );
  } catch (error) {
    console.error("[Metric Suggestion] Error occurred:", error.message);
    notifyUser(userId, {
      action: "metric_suggestion",
      status: "Failed",
      message: `Error occurred: ${error.message}`,
    });
    res.status(500).json({ error: error.message });
  }
};

const processMetrics = async (req, res) => {
  const { fileIds, metrics } = req.body;
  const { id: userId } = req.user;

  console.log("[Process Metrics] Request received:", {
    fileIds,
    metrics,
    userId,
  });

  if (!fileIds || !metrics || !userId) {
    console.error("[Process Metrics] Missing fileId, metrics, or userId");
    return res
      .status(400)
      .json({ error: "Missing fileId, metrics, or userId" });
  }

  try {
    metrics.forEach((metric) => {
      console.log("[Process Metrics] Adding metric to queue:", {
        metric,
        fileIds,
        userId,
      });
      metricQueue.add({
        fileIds,
        metric,
        userId,
      });
    });

    console.log("[Process Metrics] Metric processing started for all metrics.");
    res.json({ message: "Metric processing started." });
  } catch (error) {
    console.error("[Process Metrics] Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const validateMetric = async (req, res) => {
  const { metrics } = req.body;

  console.log("[Validate Metrics] Request received:", metrics);

  if (!Array.isArray(metrics) || metrics.length === 0) {
    console.error("[Validate Metrics] Metrics array is required.");
    return res
      .status(400)
      .json({ error: "Metrics array is required for validation." });
  }

  try {
    console.log(
      "[Validate Metrics] Executing Python script for metrics:",
      metrics
    );

    exec(
      `python3 main.py --metric_verify '${JSON.stringify(metrics)}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            "[Validate Metrics] Error validating metrics:",
            error.message
          );
          console.error("[Validate Metrics] Python script errors:", stderr);
          return res.status(500).json({ error: error.message });
        }

        console.log("[Validate Metrics] Python script output:", stdout);

        const match = stdout.match(/VALIDATION_RESULT:\s*(\[[\s\S]*?\])/);

        if (match) {
          const validationResults = JSON.parse(match[1]);
          console.log(
            "[Validate Metrics] Validation results:",
            validationResults
          );
          res.json(validationResults);
        } else {
          console.error("[Validate Metrics] No match found in stdout.");
          res
            .status(500)
            .json({ error: "Failed to parse validation results." });
        }
      }
    );
  } catch (error) {
    console.error("[Validate Metrics] Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processMetrics,
  getMetricSuggestions,
  validateMetric,
};
