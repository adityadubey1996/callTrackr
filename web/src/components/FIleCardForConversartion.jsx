"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, FileText, MoreVertical, AlertCircle } from "lucide-react";
import { destructureUniqueFileName } from "../config/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { bulkTranscribeFile, getFileViewURL } from "../config/api";
import { Button } from "@/components/components/ui/button";
import FilePreviewModal from "../pages/FileUpload/filePreviewModal";
import { useWebSocket } from "../hooks/useWebsocket";
import { toast } from "@/components/hooks/use-toast";

const FileCardForConversation = ({
  file,
  selected = false,
  onClick,
  onDelete,
}) => {
  const {
    fileName,
    transcriptionStatus,
    createdAt,
    fileSize,
    isFileReadyForChat,
  } = file;
  const [previewFile, setPreviewFile] = useState(null);

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handlePreview = async (file) => {
    // call getFileViewURL
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

  const handleConversationReady = async (file) => {
    try {
      if (!file) {
        throw Error("file Not Found");
      }
      const { fileName, fileType, fileSize, userId } = file;

      const response = await bulkTranscribeFile({
        fileName,
        fileType,
        fileSize,
        userId,
      });
      toast({
        title: response.message,

        variant: "success",
      });
    } catch (e) {
      console.error("error while transcribing File", e);
      toast({
        title: "Error",
        description: e,

        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 border rounded-lg shadow-md cursor-pointer ${
        selected ? "bg-primary text-background" : "bg-grey text-white-800"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText
            className={`h-6 w-6 ${
              selected ? "text-background" : "text-primary"
            }`}
          />
          <h3 className="font-semibold truncate">
            {destructureUniqueFileName(fileName).originalFileName}
          </h3>
          {transcriptionStatus && isFileReadyForChat ? (
            <CheckCircle
              className="h-4 w-4 mr-1 text-green-500"
              title="Ready for Chat"
            />
          ) : (
            <AlertCircle
              className="h-4 w-4 mr-1 text-red-500"
              title="Not Ready for Chat"
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-2 m-2">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handlePreview(file)}>
              Preview File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(file)}>
              delete File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleConversationReady(file)}>
              Process For Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 text-sm">
        <p className="truncate">
          transcriptionStatus Status: {transcriptionStatus}
        </p>
        <p className="truncate">
          EmbeddingStatus Status: {isFileReadyForChat ? "Completed" : "Pending"}
        </p>
        <div className="flex items-center"></div>
        <p>Size: {formatFileSize(fileSize)}</p>
        <p>Created: {new Date(createdAt).toLocaleString()}</p>
      </div>
      {previewFile && (
        <FilePreviewModal
          files={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </motion.div>
  );
};

export default FileCardForConversation;
