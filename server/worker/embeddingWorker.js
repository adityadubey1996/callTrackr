const { exec } = require("child_process");

process.on("message", (data) => {
  const { fileId, filePath, userId, fileName } = data;

  console.log(`[Worker] Starting embedding process for file: ${fileName}`);

  exec(
    `python3 main.py --chunking "${filePath}" --fileId "${fileId}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[Worker] Embedding failed for file ${fileName}:`,
          error.message
        );
        process.send({ status: "failure", error: error.message });
        return;
      }

      if (stderr) {
        console.warn(`[Worker] Embedding process warnings: ${stderr}`);
      }

      console.log(`[Worker] Embedding completed for file ${fileName}.`);
      process.send({ status: "success", output: stdout.trim() });
    }
  );
});
