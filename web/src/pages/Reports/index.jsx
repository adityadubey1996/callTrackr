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

  function transformMetricResults(
    metricResults,
    metrics,
    availableFiles,
    destructureUniqueFileName
  ) {
    // 1. Group metricResults by resultId using a Map
    const resultByResultIdMap = new Map();

    metricResults.forEach((result) => {
      // If the map already has an entry for this resultId, push onto it; otherwise, create a new array
      if (!resultByResultIdMap.has(result.resultId)) {
        resultByResultIdMap.set(result.resultId, []);
      }
      resultByResultIdMap.get(result.resultId).push(result);
    });

    // This will be our final returned value
    let transformedData = [];

    // 2. Iterate over each group of results that share the same resultId
    resultByResultIdMap.forEach((resultsInGroup) => {
      // We assume all entries in this group share the same metricListId
      const metricListId = resultsInGroup[0].metricListId;
      const foundMetricList = metrics.find((m) => m.id === metricListId);

      // If we cannot find the corresponding metric list, skip it
      if (!foundMetricList) return;

      // Create an object to hold data for this metric list
      let metricListObject = {
        metricListId: foundMetricList.id,
        metricListName: `Metric List ${foundMetricList.id}`,
        fileResults: [],
      };

      // 3. Identify unique file IDs from these results
      const fileIdsInGroup = resultsInGroup.map((r) => r.fileId);

      // Filter the availableFiles to only those used by this group
      const relevantFiles = availableFiles.filter((file) =>
        fileIdsInGroup.includes(file._id)
      );

      // 4. Build the file-level results array
      const fileResults = relevantFiles.map((file) => {
        // Filter the metric results specific to this file
        const resultsForFile = resultsInGroup.filter(
          (res) => res.fileId === file._id
        );

        // Map over the resultsForFile to extract the needed details
        const metricResultsForFile = resultsForFile.map((res) => {
          // Find metric details within foundMetricList
          const metricDetail = foundMetricList.metrics.find(
            (md) => md.id === res.metricId
          );

          return {
            metricId: metricDetail?.id,
            name: metricDetail?.name,
            result: res.result,
            error: res.error,
            context: res.context,
          };
        });

        // Return a single object for this file
        return {
          fileId: file._id,
          fileName: destructureUniqueFileName(file.fileName)?.originalFileName,
          metricResults: metricResultsForFile,
        };
      });

      // Attach file-level info to our metric list object
      metricListObject.fileResults = fileResults;

      // Finally, push this object into our aggregated list
      transformedData.push(metricListObject);
    });

    return transformedData;
  }

  const groupedResults = useMemo(() => {
    if (!availableFiles || !metricResults || !Array.isArray(metricResults)) {
      return [];
    }
    return transformMetricResults(
      metricResults,
      metrics,
      availableFiles,
      destructureUniqueFileName
    );
  }, [metricResults, availableFiles, metrics]);
  // console.log("groupedResults from index", groupedResults);

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
              showDialog={showDialog}
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
