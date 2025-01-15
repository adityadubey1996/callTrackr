"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/components/ui/breadcrumb";
import SelectFiles from "./SelectFiles";
import PreviewData from "./PreviewData";
import DefineMetrics from "./DefineMetrics";
import FinalReport from "./Finalreport";
import {
  getAvailableFiles,
  deleteFile,
  createMetricWithResult,
} from "../../config/api";
import FileCardForConversation from "@/components/FIleCardForConversartion";
import { useWebSocket } from "../../hooks/useWebsocket";
import { toast } from "@/components/hooks/use-toast";

const steps = [
  "Select Files",
  "Preview Data",
  "Define & Process Metrics",
  "Final Report",
];

export default function MetricsWizard({ setCreateWizard }) {
  const {
    refreshFileList: isStaleData,
    setRefreshFileList: isDataUpdated,
    setMetricSuggestionsResponse,
    setMetricProcessing,
  } = useWebSocket();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [availableFiles, setAvailableFiles] = useState([]);

  const [metrics, setMetrics] = useState([]);
  const [validationState, setValidationState] = useState({});
  const [validationOnProgress, setValidationInProgress] = useState(false);
  const [metricProcessionResult, setMetricProcessinResult] = useState([]); // Processed results grouped by file_id
  const [loadingMessages, setLoadingMessages] = useState([]);
  const [onFinishLoading, setOnFininshLoading] = useState(false);

  const onFinishClick = async () => {
    try {
      setOnFininshLoading(true);
      const response = await createMetricWithResult({
        metrics,
        fileIds: selectedFiles,
        results: metricProcessionResult,
      });
      console.log("response", response);
      toast({ description: "Successfully saved metric with reuslt" });
      setCreateWizard(false);
    } catch (e) {
      console.error("error while creating metric result", e);
      toast({ description: "Error", variant: "destructive" });
    } finally {
      setOnFininshLoading(false);
    }
  };

  const handleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
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

  const nextStep = () =>
    setCurrentStep((prev) => {
      const nextValue = Math.min(prev + 1, steps.length - 1);
      if (!validateDefineMetricScreen(prev, nextValue)) {
        return prev;
      }

      refreshStateForDefineMetric(prev, nextValue);
      return nextValue;
    });
  const prevStep = () =>
    setCurrentStep((prev) => {
      const nextValue = Math.max(prev - 1, 0);
      if (!validateDefineMetricScreen(prev, nextValue)) {
        return prev;
      }
      refreshStateForDefineMetric(prev, nextValue);
      return nextValue;
    });

  const validateDefineMetricScreen = (previousValue, nextValue) => {
    if (previousValue === 2 && nextValue === 3) {
      if (metrics.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "At Least one metric required",
        });
        return false;
      }
      console.log("metrics", metrics);
      if (
        metrics.map((e) => e.type).filter((e1) => e1).length !== metrics.length
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Kindly Validate the Metric, check if type is present",
        });
        return false;
      }
      // if (
      //   Object.entries(validationState).some(
      //     ([metricId, value]) => value.result === "invalid"
      //   )
      // ) {
      //   toast({
      //     variant: "destructive",
      //     title: "Error",
      //     description: "Kindly rectify the invalid metric",
      //   });
      //   return false;
      // }
    }
    return true;
  };
  const refreshStateForDefineMetric = (previousValue, nextValue) => {
    if (previousValue === 2 && nextValue !== 2) {
      setMetricSuggestionsResponse(null);
      setMetricProcessing(null);
      // setValidationState({});
      // setMetrics([]);
      setLoadingMessages([]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-wrap gap-4 overflow-auto h-full max-h-96">
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
        );
      case 1:
        return (
          <PreviewData
            selectedFiles={selectedFiles}
            availableFiles={availableFiles}
          />
        );
      case 2:
        return (
          <DefineMetrics
            selectedFiles={selectedFiles}
            metricProcessionResult={metricProcessionResult}
            setMetricProcessinResult={setMetricProcessinResult}
            validationOnProgress={validationOnProgress}
            setValidationInProgress={setValidationInProgress}
            validationState={validationState}
            setValidationState={setValidationState}
            metrics={metrics}
            setMetrics={setMetrics}
            loadingMessages={loadingMessages}
            setLoadingMessages={setLoadingMessages}
          />
        );
      case 3:
        return (
          <FinalReport
            selectedFiles={selectedFiles}
            metrics={metrics}
            results={metricProcessionResult}
            availableFiles={availableFiles}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Create Metrics - Step {currentStep + 1}: {steps[currentStep]}
        </CardTitle>
        <Breadcrumb>
          <BreadcrumbList>
            {steps.map((step, index) => (
              <BreadcrumbItem key={index}>
                {index < currentStep ? (
                  <BreadcrumbLink onClick={() => setCurrentStep(index)}>
                    {step}
                  </BreadcrumbLink>
                ) : index === currentStep ? (
                  <BreadcrumbPage>{step}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">{step}</span>
                )}
                {index < steps.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent style={{ maxHeight: "60vh" }} className="overflow-auto">
        {onFinishLoading ? "Creating Metric and Metadata" : renderStep()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </Button>

        <Button
          onClick={async () => {
            currentStep === steps.length - 1
              ? await onFinishClick()
              : nextStep();
          }}
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}
