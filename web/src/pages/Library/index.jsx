"use client";

import React, { useState, useEffect } from "react";
import {
  getConversationFiles,
  getAvailableFiles,
  createConversation,
  getFileViewURL,
  deleteFile,
} from "../../config/api";
import { Button } from "@/components/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import FileCardForConversation from "@/components/FIleCardForConversartion"; // A generalized FileCard component
import FileListForConversations from "./FileListForConversations";
import FilePreviewModal from "../FileUpload/filePreviewModal";
import { useNavigate } from "react-router-dom";
import { FileCardForUploadModal } from "@/components/FileCardForUploadModal";
import { FileUploadModal } from "@/components/FileUploadModal";
import { useWebSocket } from "../../hooks/useWebsocket";
import { toast } from "@/components/hooks/use-toast";

const ConversationFiles = () => {
  const { refreshFileList: isStaleData, setRefreshFileList: isDataUpdated } =
    useWebSocket();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [refreshAvailableFiles, setRefrshAvailablFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);

  const handleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleAddFileClick = async () => {
    setShowModal(true);
    try {
      const response = await getAvailableFiles(); // API call for available files
      setAvailableFiles(response.files || []);
    } catch (err) {
      console.error("Error loading available files:", err);
      toast({
        title: "Error",
        variant: "destructive",
        description: err.message,
      });
    }
  };

  const handleAddSelectedFiles = async () => {
    console.log("Selected files:", selectedFiles);
    try {
      const fileIds = [...selectedFiles];
      const title = new Date().toString();
      const response = await createConversation({ title, fileIds });
    } catch (err) {
      console.error("error", err);
      toast({
        title: "Error",
        variant: "destructive",
        description: err.message,
      });
    }
    setShowModal(false);
  };

  const handleFileDelete = async (file) => {
    try {
      const { fileName, _id: id } = file;
      await deleteFile(id);
      setAvailableFiles((prev) => {
        const filteredItem = prev.filter((file) => file.fileName !== fileName);

        return filteredItem;
      });
    } catch (e) {
      console.error("error while delteing file", e);
    }
  };

  const handlePreview = async (conversation) => {
    // support for multiple file is provided
    try {
      const { fileIds } = conversation;
      if (!(fileIds && Array.isArray(fileIds) && fileIds.length > 0)) {
      }
      const fileListWithSignedUrl = await Promise.all(
        fileIds.map(async (file) => {
          const { fileName } = file;

          if (!fileName) {
            throw Error("fileName not found");
          }
          const url = await getFileViewURL({ fileName });

          return { ...file, url: url.signedUrl };
        })
      );

      console.log("fileListWithSignedUrl", fileListWithSignedUrl);

      setPreviewFile([...fileListWithSignedUrl]);
    } catch (e) {
      console.error("error while fetching view URl", e);
    }
  };

  const handleStartConversation = (conversation) => {
    console.log("conversation Details", conversation);
    navigate(`/conversation/${conversation._id}`);
  };

  useEffect(() => {
    const fetchConversationFiles = async () => {
      try {
        setLoading(true);
        const response = await getConversationFiles(); // API call for completed transcription files
        setFiles(response.conversations || []);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversationFiles();
  }, [showModal, showUploadModal]);

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await getAvailableFiles(); // API call for available files
        setAvailableFiles(response.files || []);
      } catch (err) {
        console.error("Error loading available files:", err);
      }
    };
    getFiles();
  }, [showUploadModal, refreshAvailableFiles]);

  return (
    <div className="h-full w-full">
      <div className="container mx-auto p-4 ">
        <h1 className="text-xl font-bold mb-4">Conversations</h1>
        <Button onClick={handleAddFileClick}>Create Conversation</Button>

        {loading ? (
          <p>Loading files...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <FileListForConversations
            files={files}
            setFiles={setFiles}
            handlePreview={handlePreview}
            handleStartConversation={handleStartConversation}
          />
        )}

        {previewFile && (
          <FilePreviewModal
            files={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-lg max-h-screen">
            <DialogHeader>
              <DialogTitle>Select Files to Add</DialogTitle>
            </DialogHeader>
            <div className="flex-col flex-wrap gap-4 mt-4">
              {isStaleData > 0 && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-500 rounded-lg shadow-md flex justify-between items-center">
                  <span className="text-yellow-800 font-medium">
                    New changes are available. Refresh to load the latest data.
                  </span>
                  <Button
                    onClick={() => {
                      isDataUpdated(0);
                      setRefrshAvailablFiles((prev) => !prev);
                    }}
                    variant="outline"
                    // className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300"
                  >
                    Refresh
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-4">
                {availableFiles.map((file) => (
                  <FileCardForConversation
                    key={file._id}
                    file={file}
                    selected={selectedFiles.includes(file._id)}
                    onClick={() => handleFileSelection(file._id)}
                    onDelete={async () => await handleFileDelete(file)}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSelectedFiles} variant="primary">
                Add Selected Files
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(true)}
              >
                Add File
              </Button>
            </div>
            {showUploadModal && (
              <FileUploadModal
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConversationFiles;
