"use client";

import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/components/ui/scroll-area";
import FileList from "./FileList";
import ChatMessage from "./ChatMessage";
import SuggestionBar from "./SuggestionBox";
import InputField from "./InputField";
import Banner from "./Banner";
import MessageLoader from "./MessageLoader";
import { useEffect } from "react";
import {
  getConversationDetails,
  sendChatMessage,
  getFileViewURL,
} from "../../config/api";
import { useWebSocket } from "../../hooks/useWebsocket";
import { toast } from "@/components/hooks/use-toast";
import FilePreviewModal from "../FileUpload/filePreviewModal";
import { Menu } from "lucide-react";
import json5 from "json5";
export default function Home() {
  const {
    refreshFileList: isStaleData,
    setRefreshFileList: isDataUpdated,
    connectionError,
    chatResponse,
  } = useWebSocket();
  console.log("connectionError", connectionError);

  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [files, setFiles] = useState([]);
  const [isError, setIsError] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isFileDrawerOpen, setFileDrawerOpen] = useState(false);
  const scrollAreaRef = useRef(null);

  const parseAiResponse = (aiResponse) => {
    try {
      const testing = json5.parse(aiResponse);

      const { answer, references } = testing;

      return {
        text: answer || "No Text Found",
        chunkReferences: references?.chunk_references || [],
        segmentReferences: references?.segment_references || [],
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        text: "Error parsing the response.",
        chunkReferences: [],
        segmentReferences: [],
      };
    }
  };
  // Fetch conversation details
  useEffect(() => {
    const fetchConversationById = async () => {
      try {
        const response = await getConversationDetails(id);
        console.log("Conversation Details:", response);

        // Set the messages using chats from the API response
        const formattedMessages = response.chats
          .map((chat) => [
            {
              sender: "user",
              text: chat.userQuery,
              timestamp: new Date(chat.createdAt).toLocaleTimeString(),
              chatId: chat._id,
            },

            chat.aiResponse && {
              ...parseAiResponse(chat.aiResponse),
              sender: "ai",
              // text: chat.aiResponse,
              timestamp: new Date(chat.updatedAt).toLocaleTimeString(),
              chatId: chat._id,
            },
          ])
          .flat()
          .filter(Boolean); // Flatten and remove null entries

        setConversation(response);
        setMessages(formattedMessages);

        if (response.files && response.files.length > 1) {
          throw Error("more than 1 file found");
        }
        setFiles(response.files);
      } catch (error) {
        console.error("Error fetching conversation details:", error);
        setIsError({
          message: `Failed to load conversation details. with error, ${error}`,
        });
      }
    };

    fetchConversationById();
  }, [id]);

  useEffect(() => {
    setIsError({ message: connectionError });
  }, [connectionError]);

  useEffect(() => {
    if (!chatResponse) return;

    const { action, status, message, data } = chatResponse;

    switch (status) {
      case "In_Progress":
        setIsLoading(true);

        break;

      case "Failed":
        setIsLoading(false);
        setIsError({ message });
        break;

      case "Completed":
        setIsLoading(false);
        const { chatId } = data;
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...parseAiResponse(data?.aiResponse),
            sender: "ai",
            // text: data?.aiResponse || "No response received.",
            timestamp: new Date().toLocaleTimeString(),
            chatId,
          },
        ]);
        break;

      default:
        break;
    }
  }, [chatResponse]);

  const suggestions = [
    "Summarize file",
    "What's the sentiment?",
    "Find mentions of 'climate change'",
  ];

  const handlePreview = async (file) => {
    // support for single file only
    try {
      const { fileName } = file;

      if (!fileName) {
        throw Error("fileName not found");
      }
      const url = await getFileViewURL({ fileName });
      console.log("url", url);
      setPreviewFile({ ...file, url: url.signedUrl });
    } catch (e) {
      console.error("error while fetching view URl", e);
    }
  };

  const handlePreviewWithStartAndEndTime = async ({
    file,
    startTime,
    endTime,
  }) => {
    // support for single file only
    try {
      const { fileName } = file;

      if (!fileName) {
        throw Error("fileName not found");
      }
      const url = await getFileViewURL({ fileName });
      console.log("url", url);
      setPreviewFile({ ...file, url: url.signedUrl, startTime, endTime });
    } catch (e) {
      console.error("error while fetching view URl", e);
    }
  };

  const openFilePreview = (file) => {
    console.log(`Opening preview for ${file}`);
    handlePreview(file);
  };

  const insertSuggestion = (suggestion) => {
    console.log(`Inserting suggestion: ${suggestion}`);
  };

  const sendMessage = async (message, isRetry, editChatId) => {
    if (!message.trim()) return;

    setIsLoading(true);

    if (isRetry || editChatId) {
      setMessages((prev) => {
        return prev.filter((pr) => pr.chatId !== editChatId);
      });
    }

    try {
      // Send the chat message to the server
      const response = await sendChatMessage({
        message,
        conversationId: id,
        isRetry,
        editChatId,
      });
      const userMessage = {
        sender: "user",
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        chatId: response.chat._id,
      };

      setMessages((prev) => [...prev, userMessage]);
      toast({
        title: response.message,
        variant: "Success",
      });
    } catch (error) {
      console.error("Error sending message:", error.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I could not process your request. Please try again.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (message) => {
    await sendMessage(message.text, true, message.chatId);
  };

  const handleEdit = async (message) => {
    setEditMessage(message);
  };

  useEffect(() => {
    console.log("message", messages);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [JSON.stringify(messages)]);

  return (
    <div className="flex flex-col h-screen mx-auto bg-background text-foreground">
      <header
        className="flex items-center justify-between p-4 bg-secondary"
        style={{ height: "70px" }}
      >
        <button
          onClick={() => setFileDrawerOpen(true)}
          className="flex items-center space-x-2 text-primary"
        >
          <Menu className="w-5 h-5" />
          <span>Files</span>
        </button>
      </header>
      <div
        className="flex h-full w-full"
        style={{
          height: "calc(100% - 70px)",
          disaply: "flex",
          justifyContent: "center",
        }}
      >
        <main className="flex-grow flex flex-col bg-background m-5 w-full max-w-screen-xl">
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  sender={message.sender}
                  text={message.text}
                  timestamp={message.timestamp}
                  variant={message.sender === "user" ? "primary" : "secondary"}
                  onRetry={
                    message.sender === "user"
                      ? () => handleRetry(message)
                      : null
                  }
                  onEdit={
                    message.sender === "user" ? () => handleEdit(message) : null
                  }
                  chunkReferences={message.chunkReferences}
                  segmentReferences={message.segmentReferences}
                  onPlaySegment={({ startTime, endTime }) => {
                    const file = files[0];
                    handlePreviewWithStartAndEndTime({
                      file,
                      startTime,
                      endTime,
                    });
                  }}
                />
              ))}
              {isLoading && <MessageLoader />}
            </div>
          </ScrollArea>
          <SuggestionBar
            className="p-2"
            suggestions={suggestions}
            onSuggestionClick={insertSuggestion}
          />
          {isError && isError.message && (
            <Banner
              visible={true}
              message={isError?.message}
              variant="error"
              dismissible={true}
            />
          )}
          <div className="p-4 bg-background">
            <InputField
              placeholder="Type your query..."
              editMessage={editMessage}
              button={{
                text: "Send",
                onClick: async (message, editMessageFromInputField) => {
                  if (editMessageFromInputField) {
                    await sendMessage(
                      message,
                      false,
                      editMessageFromInputField.chatId
                    );
                  } else {
                    await sendMessage(message);
                  }
                },
              }}
            />
          </div>
        </main>
      </div>
      {/* File Drawer (For mobile screens) */}
      {isFileDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 left-0 w-64 bg-secondary shadow-lg">
            <header className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-primary">Files</h3>
              <button
                onClick={() => setFileDrawerOpen(false)}
                className="text-primary"
              >
                Close
              </button>
            </header>
            <ScrollArea className="h-full">
              <div className="p-4">
                <FileList files={files} onClick={openFilePreview} />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      {previewFile && (
        <FilePreviewModal
          files={[previewFile]}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
