"use client";

import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import { getFileById } from "../../config/api";
import DataTable from "./DataTable"; // The data table component
import MetricDetailsModal from "./MetricDetailsModal"; // The modal component

const MetricAccordion = ({
  metrics,
  availableFiles,
  metricResults,
  groupedResults,
}) => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Handle View More action
  const handleViewMore = (metric, fileId) => {
    console.log("metric", metric);
    console.log("fileId", fileId);

    setSelectedMetric({ metric, fileId });
    setOpenModal(true);
  };

  const handlePreview = async (fileId, startTime, endTime) => {
    try {
      // Validate the required parameters
      if (!fileId || !startTime || !endTime) {
        throw new Error(
          "fileId, startTime, and endTime are required parameters."
        );
      }

      const file = await getFileById(fileId);

      if (!file) {
        throw new Error(`File with ID ${fileId} not found.`);
      }

      const { fileName } = file;

      if (!fileName) {
        throw new Error("File name not found for the provided file.");
      }

      const url = await getFileViewURL({ fileName });

      if (!url || !url.signedUrl) {
        throw new Error("Failed to fetch signed URL for the file.");
      }

      setPreviewFile({ ...file, url: url.signedUrl, startTime, endTime });
    } catch (error) {
      console.error("Error in handlePreview:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  console.log("groupedResults", groupedResults);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">
        Metric Lists
      </h1>
      <Accordion type="multiple" collapsible>
        {groupedResults.map((group, index) => {
          // Check if fileResults exist and if metricResults contain valid names
          const metricConcatinatedText =
            group.fileResults?.length > 0
              ? group.fileResults[0].metricResults
                  ?.map((e) => e.name || "Unnamed Metric") // Handle missing names
                  .filter(Boolean) // Remove undefined or null names
                  .join(", ")
              : null;

          return (
            <AccordionItem key={index} value={`metric-${index}`}>
              <AccordionTrigger className="p-4 rounded-lg shadow-md bg-gray-800 hover:bg-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Metrics: {metricConcatinatedText || "No metrics available"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-gray-900">
                {metricConcatinatedText ? (
                  <DataTable
                    data={group.fileResults}
                    metrics={metrics}
                    onViewMore={handleViewMore}
                  />
                ) : (
                  <div className="text-red-600 bg-red-100 p-4 rounded-md">
                    <p className="font-semibold">Error:</p>
                    <p>
                      No valid metrics or file results available for this group.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {selectedMetric && (
        <MetricDetailsModal
          selectedMetric={selectedMetric}
          openModal={openModal}
          setOpenModal={setOpenModal}
          handlePreview={handlePreview}
        />
      )}
      {previewFile && (
        <FilePreviewModal
          files={[previewFile]}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default MetricAccordion;
