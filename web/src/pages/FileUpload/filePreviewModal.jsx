"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import { destructureUniqueFileName } from "../../config/utils";
import MediaPlayer from "../../components/MedioPlayer";

export default function FilePreviewModal({
  files,
  title = "Preview Files",
  onClose,
}) {
  console.log("files", files);
  const [selectedFile, setSelectedFile] = useState(files[0]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 mt-4">
          {/* File List */}
          <div className="flex-shrink-0 w-1/3 overflow-y-auto border-r pr-4 m-5">
            {files.map((file, index) => (
              <div
                key={file._id || index}
                className={`p-2 rounded-lg cursor-pointer m-2 ${
                  selectedFile === file
                    ? "bg-primary text-background"
                    : "bg-muted hover:bg-muted-hover"
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {destructureUniqueFileName(file.fileName).originalFileName}
              </div>
            ))}
          </div>

          {/* Media Player */}
          <div className="flex-1">
            {selectedFile ? (
              <MediaPlayer
                src={selectedFile.url}
                fileType={selectedFile.fileType}
                startTime={selectedFile.startTime} // Pass start time
                endTime={selectedFile.endTime} // Pass end time
              />
            ) : (
              <p className="text-center">Select a file to preview</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
