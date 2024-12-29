import React from "react";
import { RotateCw, Edit3 } from "lucide-react";
const ChatMessage = ({ sender, text, timestamp, variant, onRetry, onEdit }) => {
  return (
    <div
      className={`flex flex-col ${
        sender === "user" ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          variant === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <p>{text}</p>
      </div>
      <div className="flex items-center mt-1 space-x-2 text-muted-foreground text-xs">
        <span className="text-xs text-muted-foreground mt-1">{timestamp}</span>
        {sender === "user" && (
          <div className="flex space-x-2">
            <RotateCw
              className="w-3 h-3 cursor-pointer hover:text-primary"
              onClick={onRetry}
              title="Retry"
              aria-label="Retry Message"
            />
            <Edit3
              className="w-3 h-3 cursor-pointer hover:text-primary"
              onClick={onEdit}
              title="Edit"
              aria-label="Edit Message"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
