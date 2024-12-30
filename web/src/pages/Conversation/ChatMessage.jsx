import React from "react";
import { RotateCw, Edit3 } from "lucide-react";
const ChatMessage = ({
  sender,
  text,
  timestamp,
  variant,
  onRetry,
  onEdit,
  chunkReferences = [],
  segmentReferences = [],
  onPlaySegment,
}) => {
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
        {/* References Section */}
        <div className="mt-2 text-xs">
          {/* Chunk References */}
          {chunkReferences.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Chunk References:</h4>
              <ul className="list-disc ml-4">
                {chunkReferences.map((ref, index) => (
                  <li key={index}>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        onPlaySegment &&
                        onPlaySegment({
                          startTime: ref.start_time,
                          endTime: ref.end_time,
                        })
                      }
                    >
                      {ref.chunk_text.slice(0, 50)}... ({ref.start_time} -{" "}
                      {ref.end_time})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Segment References */}
          {segmentReferences.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold mb-1">Segment References:</h4>
              <ul className="list-disc ml-4">
                {segmentReferences.map((ref, index) => (
                  <li key={index}>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        onPlaySegment &&
                        onPlaySegment({
                          startTime: ref.start_time,
                          endTime: ref.end_time,
                        })
                      }
                    >
                      {ref.segment_text} ({ref.start_time} - {ref.end_time})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
