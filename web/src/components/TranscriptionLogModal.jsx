import React, { useState, useEffect } from "react";
import { getTranscriptionLogs } from "../config/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/components/ui/dialog";
import { Button } from "@/components/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/components/ui/card";
import AnimatedLoader from "@/components/loader"; // Assuming you have a loader component

export const TranscriptionLogs = ({
  showUploadModal,
  setShowUploadModal,
  fileDetails,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogsForFile = async () => {
      try {
        setIsLoading(true);
        const response = await getTranscriptionLogs(fileDetails);
        setLogs(response); // Assuming the response is an array of logs
      } catch (e) {
        console.error("Error fetching logs:", e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileDetails) {
      fetchLogsForFile();
    }
  }, [fileDetails]);

  return (
    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
      <DialogTrigger asChild>
        <Button variant="primary">Transcription Logs</Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col p-6 rounded-lg shadow-lg max-w-screen-lg max-h-screen">
        <DialogHeader>
          <DialogTitle>Transcription Logs</DialogTitle>
          <DialogDescription>
            View the status and updates for your transcription process.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <AnimatedLoader /> {/* Replace this with your loader component */}
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-y-auto max-h-96 mt-4 space-y-4">
            {logs.map((log, index) => (
              <Card key={log._id || index} className="bg-grey shadow-md">
                <CardHeader>
                  <p className="font-medium text-white-900">{log.status}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-white-600">{log.message}</p>
                  <p className="text-sm text-white-500 mt-10">
                    TimeStamp - {new Date(log.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">
            No logs available for this file.
          </p>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
