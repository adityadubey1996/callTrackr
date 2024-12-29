"use client";

import React, { useState, useEffect } from "react";
import useMediaQuery from "../../hooks/useMediaQuery"; // Custom hook to detect screen size
import { deleteConversation } from "../../config/api";
import DataGridFrorConversation from "./DataGridForConversation";
import FileCardComponentForMobileView from "./FileCardComponentForMobileView";

const FileListForConversations = ({
  files,
  setFiles,
  handlePreview,
  handleStartConversation,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      setFiles((prev) =>
        prev.filter((conversation) => conversation._id !== conversationId)
      );
    } catch (error) {
      console.error("Error deleting conversation:", error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mt-6">
        {isMobile ? (
          <div className="grid gap-4 grid-cols-1">
            {files.map((conversation) => (
              <FileCardComponentForMobileView
                key={conversation._id}
                conversation={conversation}
                onDelete={handleDeleteConversation}
                onPreview={handlePreview}
                handleStartConversation={handleStartConversation}
              />
            ))}
          </div>
        ) : (
          <DataGridFrorConversation
            conversations={files}
            onDelete={handleDeleteConversation}
            onPreview={handlePreview}
            handleStartConversation={handleStartConversation}
          />
        )}
      </div>
    </div>
  );
};

export default FileListForConversations;
