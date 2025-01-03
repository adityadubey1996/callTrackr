"use client";

import React, { useState, useEffect } from "react";
import {
  getConversationFiles,
  getAvailableFiles,
  createConversation,
  getFileViewURL,
  deleteFile,
  getMetricListsByUserId,
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
import MetricsWizard from "./MetricWizard";
import MetricListView from "./MetricList";
import EditMetricDialog from "./EditMetricDialog";

const MetricList = () => {
  const {
    refreshFileList: isStaleData,
    setRefreshFileList: isDataUpdated,
    setMetricSuggestionsResponse,
    setMetricProcessing,
  } = useWebSocket();
  const navigate = useNavigate();

  const [metricLists, setMetricList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [refreshAvailableFiles, setRefrshAvailablFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [createWizard, setCreateWizard] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMetricList, setSelectedMetricList] = useState(null);

  const handleAddFileClick = async () => {
    setCreateWizard(true);
  };

  useEffect(() => {
    const fetchMetricDetails = async () => {
      console.log("from fetchMetricDetails");
      try {
        setLoading(true);
        const response = await getMetricListsByUserId(); // API call for completed transcription files
        console.log("response", response);
        setMetricList(response || []);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetricDetails();
  }, [showModal, showUploadModal, editModalOpen, createWizard]);

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
  }, [showUploadModal, refreshAvailableFiles, createWizard]);

  const handleEditMetricList = (metricList) => {
    setSelectedMetricList(metricList);
    setEditModalOpen(true);
  };

  return (
    <div className="h-full w-full">
      <div className="container mx-auto p-4 ">
        <h1 className="text-xl font-bold mb-4">Metric</h1>
        <Button onClick={handleAddFileClick}>Create Metric</Button>

        {loading ? (
          <p>Loading files...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <MetricListView
            metricLists={metricLists}
            onEditMetricList={handleEditMetricList}
          />
        )}

        {previewFile && (
          <FilePreviewModal
            files={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}

        <Dialog open={createWizard} onOpenChange={setCreateWizard}>
          <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-lg max-h-screen-lg">
            <main className="container mx-auto">
              <MetricsWizard setCreateWizard={setCreateWizard} />
            </main>
          </DialogContent>
        </Dialog>

        <EditMetricDialog
          metricList={selectedMetricList}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default MetricList;
