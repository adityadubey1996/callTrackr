const Queue = require("bull");
const { exec } = require("child_process");
const { notifyUser } = require("./websocketService");

const metricQueue = new Queue("metricQueue");

metricQueue.process(async (job) => {
  const { fileIds, metric, userId } = job.data;

  try {
    notifyUser(userId, {
      action: "metric_processing",
      status: "In_Progress",
      metric,
      message: `Processing metric: ${metric.name}`,
    });
    console.log(
      `python3 main.py --process_metric '${JSON.stringify(
        metric
      )}' --fileId '${JSON.stringify(fileIds)}'`
    );
    exec(
      `python3 main.py --process_metric '${JSON.stringify(
        metric
      )}' --fileId '${JSON.stringify(fileIds)}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error processing metric:", error.message);
          notifyUser(userId, {
            action: "metric_processing",
            status: "Failed",
            metric,
            message: `Failed to process metric: ${metric.name}`,
          });
          return;
        }
        try {
          const regex = /PROCESS_METRIC_RESULT:\s*({[\s\S]*})/;
          const match = stdout.match(regex);

          if (match) {
            try {
              const parsedResult = JSON.parse(match[1]);
              console.log("Captured Metric Result:", parsedResult);
              console.log("[Process Metrics] Validation results:", match[1]);
              notifyUser(userId, {
                action: "metric_processing",
                status: "Completed",
                metric,
                message: `Metric processed successfully: ${metric.name}`,
                data: parsedResult,
              });
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          } else {
            console.log("No match found for PROCESS_METRIC_RESULT.");
            notifyUser(userId, {
              action: "metric_processing",
              status: "Failed",
              metric,
              message: `Metric processed Failed: ${metric.name}, could not parse result`,
            });
          }
        } catch (e) {
          console.error("e", e);
          notifyUser(userId, {
            action: "metric_processing",
            status: "Failed",
            metric,
            message: `Metric Failed successfully: ${metric.name}`,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error in worker metric processing:", error.message);
    notifyUser(userId, {
      action: "metric_processing",
      status: "Failed",
      metric,
      message: `Error occurred: ${error.message}`,
    });
  }
});

module.exports = { metricQueue };
