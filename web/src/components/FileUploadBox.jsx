import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { generateUniqueFileName, getUserId } from "../config/utils";

const FileUploadBox = ({ onFilesAdded }) => {
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log("files", files);
    if (files.length > 0) {
      // Pass files to the parent via callback
      const fileArray = files.map((e) => {
        return {
          id: `${uuidv4()}_New_File`,
          fileName: generateUniqueFileName(e.name.trim(), getUserId()),
          uploadStatus: "Pending",
          transcriptionStatus: "Pending",
          fileType: e.type,
          file: e,
          fileSize: e.size,
        };
      });
      onFilesAdded(fileArray);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    onFilesAdded(files); // Pass files to the parent via callback
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-muted hover:bg-accent cursor-pointer transition-colors duration-150 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p className="text-white text-lg">Upload your documents</p>

      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleFileUpload}
        accept=".mp3, .wav, .ogg, .mp4"
        multiple
      />

      <UploadCloud className="h-10 w-10 text-gray-500 mb-3" />
      <p className="text-sm text-gray-700">
        <strong className="text-primary">Click to upload</strong> or drag and
        drop
      </p>
      <p className="text-xs text-gray-500 mt-1">PDF only</p>
    </div>
  );
};

export default FileUploadBox;
