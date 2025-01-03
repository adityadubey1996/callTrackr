"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import { Button } from "@/components/components/ui/button";

const ProcessingDialog = ({
  processing,
  loadingMessages,
  onClose,
  onSave,
  metricProcessionResult,
}) => {
  return (
    <Dialog open={processing} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Processing</DialogTitle>
        </DialogHeader>
        <div
          style={{ height: "100px" }}
          className="flex-1 overflow-y-auto border rounded-md p-2 bg-gray-900"
        >
          <div className="flex flex-col space-y-2">
            {loadingMessages && loadingMessages.length > 0 ? (
              loadingMessages.map((message, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 text-sm text-gray-300"
                >
                  <span>{message}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet...</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-5">
          <Button onClick={onClose}>Close</Button>
          <Button
            disabled={!(metricProcessionResult.length > 0)}
            onClick={onSave}
          >
            Save (Do Not Click till processing is Done)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingDialog;
