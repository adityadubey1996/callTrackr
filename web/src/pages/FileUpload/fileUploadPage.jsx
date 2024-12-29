"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import Header from "./header";
import FileList from "./fileList";
import FilePreviewModal from "./filePreviewModal";
import FileUploadBox from "@/components/FileUploadBox";
import { FileCardForUploadModal } from "@/components/FileCardForUploadModal";
import useFileUploader from "../../hooks/useFileUpload";
import {
  deleteFile,
  getFileViewURL,
  getFileList,
  bulkTranscribeFile,
} from "../../config/api";
import { toast } from "@/components/hooks/use-toast";
import { TranscriptionLogs } from "@/components/TranscriptionLogModal";
import { useWebSocket } from "../../hooks/useWebsocket";
import { FileUploadModal } from "@/components/FileUploadModal";

export default function FileUploadPage() {
  const { refreshFileList: isStaleData, setRefreshFileList: isDataUpdated } =
    useWebSocket();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [refreshFileList, setRefreshFileList] = useState(false);
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [fileForTranscription, setFileForTranscription] = useState(null);

  const handleSelectFile = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for files:`, selectedFiles);
    // Implement bulk action logic here
  };

  const handleFileAction = async (file, action) => {
    console.log(`${action} file:`, file);
    const { fileName, fileType, fileSize, userId, filePath, _id: id } = file;

    try {
      switch (action) {
        case "transcribe":
          // API call to start transcription
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
          break;

        case "delete":
          // Get file name and call delete file API
          await deleteFile(id);

          setFileList((prev) => {
            const filteredItem = prev.filter(
              (file) => file.fileName !== fileName
            );

            return filteredItem;
          });

          console.log("File deleted successfully.");
          break;

        default:
          console.error("Invalid action.");
          break;
      }
    } catch (error) {
      console.error(`Error handling file action (${action}):`, error.message);
    }
  };

  const handlePreview = async (file) => {
    // support for single file only
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

  const handleTranscriptionLogs = async (file) => {
    setShowTranscriptionModal(true);
    setFileForTranscription(file);
  };
  useEffect(() => {
    const fetchFileListForUser = async () => {
      try {
        setLoading(true);
        const response = await getFileList();
        if (response && response.files && Array.isArray(response.files)) {
          setFileList(response.files);
          isDataUpdated(0);
        }
      } catch (e) {
        console.error("error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFileListForUser();
  }, [showUploadModal, refreshFileList]);

  const handleRefresh = () => {
    setRefreshFileList((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <Header />
      {isStaleData > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-500 rounded-lg shadow-md flex justify-between items-center">
          <span className="text-yellow-800 font-medium">
            New changes are available. Refresh to load the latest data.
          </span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            // className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300"
          >
            Refresh
          </Button>
        </div>
      )}
      <div className="my-4 flex flex-wrap items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All Files</DropdownMenuItem>
            <DropdownMenuItem>Audio Files</DropdownMenuItem>
            <DropdownMenuItem>Video Files</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-wrap gap-2">
          {/* <Button
            variant="destructive"
            onClick={() => handleBulkAction("delete")}
            disabled={selectedFiles.length === 0}
          >
            Bulk Delete
          </Button>
          <Button
            onClick={() => handleBulkAction("transcribe")}
            disabled={selectedFiles.length === 0}
          >
            Bulk Transcribe
          </Button> */}
          <Button onClick={() => setShowUploadModal(true)}>Add File</Button>
        </div>
      </div>
      {loading ? (
        <>loading...</>
      ) : (
        <FileList
          files={fileList}
          selectedFiles={selectedFiles}
          onSelectFile={handleSelectFile}
          onFileAction={handleFileAction}
          onPreview={handlePreview}
          onTranscriptionLogs={handleTranscriptionLogs}
        />
      )}
      {previewFile && (
        <FilePreviewModal
          files={[previewFile]}
          onClose={() => setPreviewFile(null)}
        />
      )}
      {showUploadModal && (
        <FileUploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
        />
      )}
      {showTranscriptionModal && (
        <TranscriptionLogs
          showUploadModal={showTranscriptionModal}
          setShowUploadModal={setShowTranscriptionModal}
          fileDetails={fileForTranscription}
        />
      )}
    </div>
  );
}
