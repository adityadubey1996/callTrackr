import React, { useState, useEffect } from "react";
import { Button } from "@/components/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import MetricsWizard from "./MetricWizard";
import {
  getMetricResultsByUserId,
  getMetricListsByUserId,
  getAvailableFiles,
} from "../../config/api";
import { useMemo } from "react";
import { destructureUniqueFileName } from "../../config/utils";
import MetricAccordion from "./MetricAccordian";

const Reports = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [metricResults, setMetricResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  useEffect(() => {
    const fetchMetricDetails = async () => {
      try {
        setLoading(true);
        const response = await getMetricListsByUserId(); // API call for completed transcription files
        setMetrics(response || []);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetricDetails();
  }, [showDialog, editModalOpen]);

  useEffect(() => {
    const fetchMetricResultDetails = async () => {
      try {
        setLoading(true);
        const response = await getMetricResultsByUserId(); // API call for completed transcription files
        console.log("response from fetchMetricResultDetails", response);
        setMetricResults(response);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetricResultDetails();
  }, [showDialog]);

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
  }, []);

  const getSetArrayOfFileIds = (metricResultsParams) =>
    Array.from(new Set(metricResultsParams.map((e) => e.fileId)));

  const groupedResults = useMemo(() => {
    if (!availableFiles || !metricResults || !Array.isArray(metricResults)) {
      return [];
    }

    return metrics.map((metricList) => {
      // Group files and their corresponding metric results for this metric list
      const fileResults = availableFiles
        .filter((file) => metricList.fileIds.includes(file._id))
        .map((file) => {
          // Get metric results for this file and metric list
          const metricResultsForFile = metricList.metrics.map((metric) => {
            const resultEntry = metricResults.find(
              (res) => res.fileId === file._id && res.metricId === metric.id
            );

            return {
              metricId: metric.id,
              name: metric.name,
              result: resultEntry?.result ?? "N/A",
              error: resultEntry?.error ?? null,
              context: resultEntry?.context || [],
            };
          });

          return {
            fileId: file._id,
            fileName: destructureUniqueFileName(file.fileName).originalFileName,
            metricResults: metricResultsForFile,
          };
        });

      return {
        metricListId: metricList.id,
        metricListName: `Metric List ${metricList.id}`, // Optional name
        fileResults,
      };
    });
  }, [metricResults, availableFiles, metrics]);
  console.log("groupedResults from index", groupedResults);

  return (
    <div className="h-full w-full">
      <div className="container mx-auto p-4 ">
        <h1 className="text-xl font-bold mb-4">Reports</h1>
        <Button
          onClick={() => {
            openDialog();
          }}
        >
          Create Dashboard
        </Button>
        {loading ? (
          <p>Loading files...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <MetricAccordion
            metrics={metrics}
            availableFiles={availableFiles}
            metricResults={metricResults}
            groupedResults={groupedResults}
          />
        )}
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-lg max-h-screen-lg">
            <DialogHeader>
              <DialogTitle>Create Dashboard</DialogTitle>
            </DialogHeader>
            <MetricsWizard
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              metrics={metrics}
              setMetrics={setMetrics}
              metricResults={metricResults}
              setMetricResults={setMetricResults}
              onClose={closeDialog}
              editModalOpen={editModalOpen}
              setEditModalOpen={setEditModalOpen}
              setAvailableFiles={setAvailableFiles}
              availableFiles={availableFiles}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reports;
