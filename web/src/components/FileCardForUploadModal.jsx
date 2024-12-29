import React from "react";
import { File, X, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/components/ui/progress";
import { Button } from "@/components/components/ui/button";
import { destructureUniqueFileName } from "../config/utils";

export const FileCardForUploadModal = ({
  file,
  progress,
  status,
  onRetry,
  onRemove,
}) => {
  return (
    <div
      key={file.id}
      className="bg-card text-card-foreground rounded-lg p-4 shadow-sm border"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <File className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium truncate max-w-[200px]">
            {destructureUniqueFileName(file.fileName).originalFileName}
          </span>
        </div>
        {status === "Pending" && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {status === "In_Progress" && (
        <Progress
          value={progress}
          // value={50}
          className="h-2 mb-2"
        />
      )}
      <div className="flex items-center justify-between text-sm">
        {status === "Pending" && (
          <span className="text-muted-foreground">Ready to upload</span>
        )}
        {status === "In_Progress" && (
          <span className="text-muted-foreground">{progress}% uploaded</span>
        )}
        {status === "Uploaded" && (
          <span className="text-green-500 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" /> Uploaded
          </span>
        )}
        {status === "Failed" && (
          <span className="text-destructive flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> Failed
          </span>
        )}
        {status === "Failed" && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </Button>
        )}
      </div>
    </div>
  );
};
