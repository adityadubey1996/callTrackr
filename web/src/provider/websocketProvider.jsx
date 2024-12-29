import { toast } from "@/components/hooks/use-toast";
import React, { createContext, useState, useEffect, useCallback } from "react";

export const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children, token }) => {
  const [socket, setSocket] = useState(null);
  const [refreshFileList, setRefreshFileList] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

    ws.onopen = () => {
      console.log("[WebSocket] Connected to server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (
        data.type === "error" &&
        data.message === "Invalid or expired token"
      ) {
        console.log("[WebSocket] Token expired. Please log in again.");
        alert("Your session has expired. Please log in again.");
        // Add a callback or event to prompt the user to log in
      }
      console.log("message received", data);
      if (data.action) {
        const { status } = data;

        switch (data.action) {
          case "transcription_update":
            if (data.status === "Failed") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "Error",
                description: data.message,
                type: "destructuve",
              });
            } else if (data.status === "Completed") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "Completed",
                description: data.message,
                type: "destructuve",
              });
            } else if (data.status === "In_Progress") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "In_Progress",
                description: data.message,
                type: "destructuve",
              });
            }

            break;
          case "embeddings_update":
            if (status === "Failed") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "Failed",
                description: data.message,
                type: "destructuve",
              });
            } else if (status === "Completed") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "Completed",
                description: data.message,
                type: "destructuve",
              });
            } else if (status === "In_progress") {
              setRefreshFileList((prev) => prev + 1);
              toast({
                title: "In_Progress",
                description: data.message,
                type: "destructuve",
              });
            }

          case "chat_update":
            setChatResponse({ ...data });

          default:
            break;
        }
      }
    };

    ws.onclose = () => {
      console.log("[WebSocket] Connection closed");
      setConnectionError("WebSocket connection lost. Please try again later.");
    };

    ws.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
      setConnectionError("An error occurred with the WebSocket connection.");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn("[WebSocket] Connection is not open");
      }
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        sendMessage,
        refreshFileList,
        setRefreshFileList,
        connectionError,
        chatResponse,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
