import { useState, useCallback } from "react";
import axios from "axios";
import { getFileUploadURL } from "../config/api";
import { createOrUpdateFileStatus } from "../config/api";

const useFileUploader = () => {
  const [uploadProgress, setUploadProgress] = useState({}); // Tracks progress for each file
  const [uploadStatus, setUploadStatus] = useState({}); // Tracks status for each file

  const uploadFiles = useCallback(
    async (
      files,
      onUploadStart,
      onProgress,
      onUploadComplete,
      onUploadFailed
    ) => {
      console.log("files", files);
      const promises = files.map(async (file) => {
        console.log("file", file);
        const { fileName, fileType, fileSize, file: actualFile } = file;

        if (!fileName || !fileType || !fileSize || !actualFile) {
          throw new Error(
            `Invalid file object: Missing required fields. fileName : ${fileName},fileType : ${fileType}  , fileSize : ${fileSize}, actualFile : ${actualFile}`
          );
        }
        try {
          // Notify upload start
          if (onUploadStart) onUploadStart(file);

          // Get upload URL from backend
          const response = await getFileUploadURL({
            fileName,
          });
          const signedUrl = response.signedUrl;

          // Upload file using XMLHttpRequest to track progress
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.onprogress = async (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.id]: progress,
                }));
                if (onProgress) onProgress(file, progress);
              }
            };

            // Handle upload success
            xhr.onload = async () => {
              if (xhr.status === 200 || xhr.status === 201) {
                setUploadStatus((prev) => ({
                  ...prev,
                  [file.id]: "Uploaded",
                }));
                if (onUploadComplete) onUploadComplete(file);
                await createOrUpdateFileStatus({
                  fileName,
                  fileType,
                  fileSize,
                  uploadStatus: "Uploaded",
                });

                resolve();
              } else {
                setUploadStatus((prev) => ({
                  ...prev,
                  [file.id]: "Failed",
                }));
                if (onUploadFailed) onUploadFailed(file, xhr.statusText);
                // Update file status to Failed in the backend
                await createOrUpdateFileStatus({
                  fileName,
                  fileType,
                  fileSize,
                  uploadStatus: "Failed",
                });
                reject(new Error(xhr.statusText));
              }
            };

            // Handle upload failure
            xhr.onerror = async () => {
              setUploadStatus((prev) => ({
                ...prev,
                [file.id]: "Failed",
              }));
              if (onUploadFailed) onUploadFailed(file, xhr.statusText);
              // Update file status to Failed in the backend
              await createOrUpdateFileStatus({
                fileName,
                fileType,
                fileSize,
                uploadStatus: "Failed",
              });

              reject(new Error(xhr.statusText));
            };

            xhr.open("PUT", signedUrl);
            xhr.setRequestHeader("Content-Type", file.fileType);
            xhr.send(actualFile);

            // Mark as in progress
            setUploadStatus((prev) => ({
              ...prev,
              [file.id]: "In_Progress",
            }));
          });
        } catch (error) {
          setUploadStatus((prev) => ({
            ...prev,
            [file.id]: "Failed",
          }));
          if (onUploadFailed) onUploadFailed(file, error.message);

          // Update file status to Failed in the backend (if applicable)
          if (fileName && fileType && fileSize) {
            await createOrUpdateFileStatus({
              fileName,
              fileType,
              fileSize,
              uploadStatus: "Failed",
            });
          }
        }
      });

      await Promise.all(promises);
    },
    []
  );

  return {
    uploadFiles,
    uploadProgress,
    uploadStatus,
  };
};

export default useFileUploader;
