"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import EditMetrics from "./EditMetrics"; // Assume this is the updated component for editing metrics
import { Button } from "@/components/components/ui/button";
import { updateMetric } from "../../config/api";

const EditMetricDialog = ({ metricList, isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(metricList?.metrics || []);
  const [validationState, setValidationState] = useState({});
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [updatingMetric, setUpdatedingMetric] = useState(false);
  useEffect(() => {
    if (metricList) {
      setMetrics(metricList.metrics);
    }
  }, [metricList]);

  const handleSave = async () => {
    try {
      setUpdatedingMetric(true);
      await updateMetric({ metrics, metricId: metricList.id });
      onClose();
    } catch (e) {
      console.error("error from hadnleSave", e);
    } finally {
      setUpdatedingMetric(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Edit Metrics for {metricList?.id}</DialogTitle>
        </DialogHeader>
        {updatingMetric ? (
          <>Updating Metrics...</>
        ) : (
          <EditMetrics
            metrics={metrics}
            setMetrics={setMetrics}
            validationState={validationState}
            setValidationState={setValidationState}
            validationOnProgress={validationInProgress}
            setValidationInProgress={setValidationInProgress}
            onSave={async () => {
              await handleSave();
            }}
          />
        )}
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMetricDialog;
