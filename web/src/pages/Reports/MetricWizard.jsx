"use client";

import React, { useState, useEffect } from "react";
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
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/components/ui/breadcrumb";
import { Button } from "@/components/components/ui/button";

import FileCardForConversation from "@/components/FIleCardForConversartion";
import MetricListView from "./MetricListView";
import FinalReport from "./FinalReport";
import {
  getAvailableFiles,
  processMetric,
  createMetricWithResultAndMetricId,
} from "../../config/api";
import EditMetricDialog from "../Metric/EditMetricDialog";
import { useWebSocket } from "../../hooks/useWebsocket";
import ProcessingDialog from "./ProcessingDialog";
import { toast } from "@/components/hooks/use-toast";
import Banner from "../Conversation/Banner";

const steps = ["Select Files", "Define Metrics"];

const MetricsWizard = ({
  showDialog,
  selectedFiles,
  setSelectedFiles,
  metrics,

  onClose,
  editModalOpen,
  setEditModalOpen,
  availableFiles,
  setAvailableFiles,
}) => {
  const { metricProcessing, connectionError } = useWebSocket();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMetricList, setSelectedMetricList] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [metricProcessionResult, setMetricProcessinResult] = useState([]);
  const [onFinishLoading, setOnFininshLoading] = useState(false);
  console.log("metricProcessionResult", metricProcessionResult);

  //   useEffect(() => {
  // if(!showDialog){

  // }
  //   },[showDialog])
  const handleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };
  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleEditMetricList = (metricList) => {
    setSelectedMetricList(metricList);
    setEditModalOpen(true);
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
          <MetricListView
            metricLists={metrics}
            setSelectedMetricList={setSelectedMetricList}
            selectedMetricList={selectedMetricList}
            onEditMetricList={handleEditMetricList}
          />
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    if (!metricProcessing) {
      return;
    }
    const { data, action, metric, message, status } = metricProcessing;
    console.log("metricProcessing from useEFfect", metricProcessing);
    switch (status) {
      case "In_Progress":
        setProcessing(true);
        setLoadingMessages((prev) => [...prev, message]);
        break;

      case "Completed":
        console.log("data from Completed from metricProcessing", data);
        setLoadingMessages((prev) => [...prev, message]);
        setMetricProcessinResult((prev) => {
          return [
            ...prev,
            ...Object.entries(data).map(([fileId, data]) => ({
              id: data.metricId,
              name: data.metric,
              fileId: fileId,
              result: data.result,
              context: data.context,
              error: data.error,
              metricId: data.metricId,
            })),
          ];
        });

        break;

      case "Failed":
        setProcessing(false);
        setLoadingMessages((prev) => [...prev, message]);

        break;

      default:
        break;
    }
  }, [metricProcessing]);

  const onProcessClick = async () => {
    try {
      if (!selectedMetricList) {
        throw Error("kindly Select a Metric for Processing");
      }
      setLoadingMessages([]);
      setProcessing(true);
      const selectedMetric = metrics.find((e) => e.id === selectedMetricList);
      await processMetric({
        fileIds: selectedFiles,
        metrics: [...selectedMetric.metrics],
      });
    } catch (err) {
      toast({
        title: `Failed to process metrics with error ${err}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }

    // onClose()
  };

  const onFinishClick = async () => {
    try {
      setOnFininshLoading(true);
      console.log("metricProcessionResult", metricProcessionResult);
      const response = await createMetricWithResultAndMetricId({
        metricListId: metrics.find((e) => e.id === selectedMetricList).id,

        results: metricProcessionResult,
      });
      console.log("response", response);
      toast({});
    } catch (e) {
      toast({});
    } finally {
      setOnFininshLoading(false);
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {!!connectionError && (
        <Banner
          visible={true}
          message={connectionError}
          variant="error"
          dismissible={true}
        />
      )}
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
              ? await onProcessClick()
              : nextStep();
          }}
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </CardFooter>

      <EditMetricDialog
        metricList={metrics.find((me) => me.id === selectedMetricList)}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      <ProcessingDialog
        processing={processing}
        loadingMessages={loadingMessages}
        onClose={() => setProcessing(false)}
        onSave={() => onFinishClick()}
        metricProcessionResult={metricProcessionResult}
      />
    </Card>
  );
};

export default MetricsWizard;
