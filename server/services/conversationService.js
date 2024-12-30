const Chat = require("../models/ChatModel");
const Queue = require("bull");
const { exec } = require("child_process");
const { notifyUser } = require("./websocketService");
const chatQueue = new Queue("chatQueue");
// Process chat queue
chatQueue.process(async (job) => {
  const { chatId, conversationId, query, userId } = job.data;

  try {
    // Validation
    if (!chatId || !conversationId || !query || !userId) {
      const missingFields = [];
      if (!chatId) missingFields.push("chatId");
      if (!conversationId) missingFields.push("conversationId");
      if (!query) missingFields.push("query");
      if (!userId) missingFields.push("userId");

      const errorMessage = `Missing required fields: ${missingFields.join(
        ", "
      )}`;
      console.error(`[Chat Queue] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    // Update chat status
    await Chat.findByIdAndUpdate(chatId, { status: "In_Progress" });

    // Notify user
    notifyUser(userId, {
      action: "chat_update",
      status: "In_Progress",
      message: "Processing your query.",
    });
    // Execute Python script
    exec(
      `python3 main.py --query "${query}" --conversation_id "${conversationId}"`,
      async (error, stdout, stderr) => {
        if (error) {
          console.error("Error processing chat:", error.message);

          // Update chat status to failed
          await Chat.findByIdAndUpdate(chatId, { status: "Failed" });

          // Notify user
          notifyUser(userId, {
            action: "chat_update",
            status: "Failed",
            message: "An error occurred while processing your query.",
            data: { error, chatId },
          });

          return;
        }
        const match = stdout.match(/^AI_RESPONSE:(.*)$/m); // Regex to find the response line
        const aiResponse = match
          ? match[1].trim()
          : "Could not parse AI response.";

        const { answer, references } = aiResponse;
        console.log("answer", answer);
        console.log("references", references);

        const responseToSend = aiResponse;
        console.log("responseToSend", responseToSend);
        // Update chat with AI response
        await Chat.findByIdAndUpdate(chatId, {
          status: "Completed",
          aiResponse: responseToSend,
        });

        // Notify user
        notifyUser(userId, {
          action: "chat_update",
          status: "Completed",
          message: "Your query has been processed successfully.",
          data: { aiResponse: responseToSend, chatId },
        });
      }
    );
  } catch (error) {
    console.error("Error processing chat in worker:", error.message);
    await Chat.findByIdAndUpdate(chatId, { status: "Failed" });

    notifyUser(userId, {
      action: "chat_update",
      status: "Failed",
      message: `An error occurred while processing your query error ${error}`,
      data: { error, chatId },
    });
  }
});

module.exports = { chatQueue };
