const TranscriptionLog = require("../models/transcriptionLogModel");

const getLogsByFileId = async (req, res) => {
  try {
    console.log("req.body from getLogsByFileId", req.body);
    const { _id: fileId } = req.body;
    if (!fileId) {
      throw Error("FileId is required to fetch logs");
    }

    const logs = await TranscriptionLog.find({ fileId }).sort({ timestamp: 1 });

    if (!logs || logs.length === 0) {
      return res
        .status(404)
        .json({ message: "No logs found for the specified file." });
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getLogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const logs = await TranscriptionLog.find({ userId }).sort({
      timestamp: -1,
    });

    if (!logs || logs.length === 0) {
      return res
        .status(404)
        .json({ message: "No logs found for the specified user." });
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getLogsByFileId,
  getLogsByUserId,
};
