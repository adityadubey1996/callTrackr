"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/components/ui/dialog";

import FileUploadBox from "@/components/FileUploadBox";
import { FileCardForUploadModal } from "@/components/FileCardForUploadModal";
import useFileUploader from "../hooks/useFileUpload";

export const FileUploadModal = ({ open, onOpenChange }) => {
  const [fileSelectedForUpload, setFileSelectedForUpload] = useState([]);
  const { uploadFiles, uploadProgress, uploadStatus } = useFileUploader();

  // Start upload handler
  const handleStartUpload = () => {
    uploadFiles(
      fileSelectedForUpload,
      (file) => {
        console.log(`Upload started for ${file.name}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "In_Progress" } : f
          )
        );
      },
      (file, progress) => {
        console.log(`Progress for ${file.name}: ${progress}%`);
      },
      (file) => {
        console.log(`Upload completed for ${file.name}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "Completed" } : f
          )
        );
      },
      (file, error) => {
        console.error(`Upload failed for ${file.name}: ${error}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "Failed" } : f))
        );
      }
    );
  };

  // Retry upload handler
  const handleRetry = (index) => {
    const fileToRetry = fileSelectedForUpload[index];
    uploadFiles(
      [fileToRetry],
      (file) => {
        console.log(`Retrying upload for ${file.name}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "In_Progress" } : f
          )
        );
      },
      (file, progress) => {
        console.log(`Progress for ${file.name}: ${progress}%`);
      },
      (file) => {
        console.log(`Upload completed for ${file.name}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "Completed" } : f
          )
        );
      },
      (file, error) => {
        console.error(`Upload failed for ${file.name}: ${error}`);
        setFileSelectedForUpload((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "Failed" } : f))
        );
      }
    );
  };

  const handleRemoveFile = (index) => {
    setFileSelectedForUpload((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Upload Files
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-lg max-h-screen">
        <DialogHeader>
          <DialogTitle>Upload Your Files</DialogTitle>
          <DialogDescription>
            Use the box below to upload your files. Scroll down to see the files
            you've selected.
          </DialogDescription>
        </DialogHeader>

        {/* File Upload Box */}
        <div
          className="mt-4 flex justify-center items-center bg-transparent rounded-lg"
          style={{
            width: "60%",
            height: "40%",
            minWidth: "300px",
            minHeight: "200px",
            margin: "0 auto",
          }}
        >
          <FileUploadBox
            onFilesAdded={(files) => {
              setFileSelectedForUpload((prev) => [...prev, ...files]);
            }}
          />
        </div>

        {/* Files List with Scrollbar */}
        {fileSelectedForUpload.length > 0 && (
          <div
            className="mt-6 flex-1 overflow-y-auto p-4 border border-gray-300 rounded-lg"
            style={{
              maxHeight: "calc(100vh - 60%)",
            }}
          >
            <div className="flex flex-wrap gap-4">
              {fileSelectedForUpload.map((file, index) => (
                <FileCardForUploadModal
                  key={index}
                  file={file}
                  progress={uploadProgress[file.id] || 0}
                  status={uploadStatus[file.id] || "Pending"}
                  onRetry={() => handleRetry(index)}
                  onRemove={() => handleRemoveFile(index)}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleStartUpload}
              className="mt-4"
            >
              Start Upload
            </Button>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
