import { useState, useEffect } from "react";
import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import { Label } from "@/components/components/ui/label";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/components/ui/select";
import { Progress } from "@/components/components/ui/progress";
import { sampleMetrics } from "./SampleData";
import {
  getMetricSuggestions,
  processMetric,
  verifyMetric,
} from "../../config/api";
import { useWebSocket } from "../../hooks/useWebsocket";
import { Loader, Info } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import MetricsDataTable from "./DataGridForMetric";
import Banner from "../Conversation/Banner";

export default function DefineMetrics({
  selectedFiles,
  metricProcessionResult,
  setMetricProcessinResult,
  validationOnProgress,
  setValidationInProgress,
  validationState,
  setValidationState,
  metrics,
  setMetrics,
  loadingMessages,
  setLoadingMessages,
}) {
  const { metricSuggestion, metricProcessing, connectionError } =
    useWebSocket();
  const [suggestedMetrics, setSuggestedMetrics] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fetchingMetricSuggestion, setFetchingMetricSuggestion] =
    useState(false);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);

  // Fetch metric suggestions on component mount
  useEffect(() => {
    fetchSuggestedMetrics();
  }, [selectedFiles]);

  useEffect(() => {
    if (!metricSuggestion) {
      return;
    }
    const { data } = metricSuggestion;
    setFetchingMetricSuggestion(false);
    switch (metricSuggestion.status) {
      case "In_Progress":
        setFetchingMetricSuggestion(true);
        break;
      case "Completed":
        setFetchingMetricSuggestion(false);
        if (data && Array.isArray(data) && data.length > 0)
          setSuggestedMetrics(data);
        break;
      case "Failed":
        setFetchingMetricSuggestion(false);
        break;
      default:
        break;
    }
  }, [metricSuggestion, setFetchingMetricSuggestion, setSuggestedMetrics]);

  useEffect(() => {
    if (!metricProcessing) {
      return;
    }
    const { data, action, metric, message, status } = metricProcessing;

    switch (status) {
      case "In_Progress":
        setProcessing(true);
        setLoadingMessages((prev) => [...prev, message]);
        break;

      case "Completed":
        console.log("data from COmpleted from metricProcessing", data);
        setProcessing(false);
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

  const fetchSuggestedMetrics = async () => {
    try {
      setFetchingMetricSuggestion(true);
      const fileId = selectedFiles[0];
      const response = await getMetricSuggestions({ fileId });
      if (!response.ok) throw new Error("Failed to fetch metric suggestions");

      const data = await response.json();
      setSuggestedMetrics(data);
      toast.success("Metric suggestions loaded successfully!");
    } catch (err) {
      setError("Failed to fetch metric suggestions. Please retry.");
    } finally {
      setFetchingMetricSuggestion(false);
    }
  };

  const validateMetric = async (metric) => {
    try {
      setValidationInProgress(true);

      if (
        metrics.map((e) => e.type).filter((e1) => e1).length !== metrics.length
      ) {
        throw Error("Type Missing for Metric");
      }

      const response = await verifyMetric(metrics); // Send the entire list of metrics for validation

      // Iterate over the response and update the validation state using metric IDs
      response.forEach((result) => {
        setValidationState((prev) => ({
          ...prev,
          [result.id]: {
            result: result.valid ? "valid" : "invalid",
            message: result.message,
          }, // Use `id` to map the validation result
        }));
      });
    } catch (err) {
      console.error("Validation error:", err);

      // Mark all metrics as invalid in case of an error
      metrics.forEach((metric) => {
        setValidationState((prev) => ({
          ...prev,
          [metric.id]: { result: "invalid", message: err.message },
        }));
      });
    } finally {
      setValidationInProgress(false);
    }
  };
  const validateAllMetrics = async () => {
    await validateMetric(metrics); // Validate each metric one by one
  };

  const deleteMetric = (metricId) => {
    setMetrics((prev) => prev.filter((metric) => metric.id !== metricId));
    setValidationState((prev) => {
      const updatedState = { ...prev };
      delete updatedState[metricId];
      return updatedState;
    });
  };

  const processMetrics = async () => {
    try {
      setLoadingMessages([]);
      setProcessing(true);
      setProgress({});
      let isError = false;
      const validationValue = Object.values(validationState);
      if (validationValue.length !== metrics.length) {
        throw Error("Validation Failed");
      }
      console.log("validationValue", validationValue);
      if (
        validationValue
          .map((e) => e.result)
          .map((e1) => e1.includes("invalid"))
          .find((e2) => e2)
      ) {
        isError = true;
        setProcessing(false);
        toast({
          title: "Kindly rectify the metrics",
          variant: "destructive",
        });
        return;
      }

      if (isError) {
        throw Error("Validation Failed");
      }

      await processMetric({ fileIds: selectedFiles, metrics });
    } catch (err) {
      toast({
        title: `Failed to process metrics with error ${err}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="space-y-5">
        {!!connectionError && (
          <Banner
            visible={true}
            message={connectionError}
            variant="error"
            dismissible={true}
          />
        )}
        <Accordion type="single" collapsible>
          <AccordionItem value="defineMetrics">
            <AccordionTrigger>Define Metrics</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {/* Metric List */}
                <div className="space-y-4 mt-5">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex space-x-4 items-center"
                    >
                      <Input
                        placeholder="Metric name"
                        value={metric.name}
                        onChange={(e) =>
                          setMetrics((prev) =>
                            prev.map((m) =>
                              m.id === metric.id
                                ? { ...m, name: e.target.value }
                                : m
                            )
                          )
                        }
                        className={`border ${
                          validationState[metric.id] &&
                          validationState[metric.id].result === "valid"
                            ? "border-green-500"
                            : validationState[metric.id] &&
                              validationState[metric.id].result === "invalid"
                            ? "border-red-500"
                            : "border-yellow-500"
                        }`}
                      />
                      {validationState[metric.id] &&
                        validationState[metric.id].message && (
                          <div className="relative flex items-center">
                            <div className="group cursor-pointer">
                              <Info className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                              {/* Hover text */}
                              <div
                                style={{ width: "300px" }}
                                className="absolute left-0 top-full mt-2 hidden w-max rounded-md bg-gray-800 px-2 py-1 text-sm text-white shadow-lg group-hover:block"
                              >
                                {validationState[metric.id].message}
                              </div>
                            </div>
                          </div>
                        )}
                      <span> = </span>
                      <Select
                        value={metric.type}
                        onValueChange={(value) => {
                          setMetrics((prev) =>
                            prev.map((m) =>
                              m.id === metric.id ? { ...m, type: value } : m
                            )
                          );
                          setValidationState((prev) => {
                            console.log(prev);
                            const updatedMetric = { ...prev };
                            if (updatedMetric[metric.id]) {
                              delete updatedMetric[metric.id];
                            }
                            return updatedMetric;
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Metric type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes/No">Yes/No</SelectItem>
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Numeric">Numeric</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMetric(metric.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Add Metric */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() =>
                      setMetrics([
                        ...metrics,
                        { id: Date.now(), name: "", type: "" },
                      ])
                    }
                  >
                    Add Metric
                  </Button>

                  <Button
                    onClick={validateAllMetrics}
                    disabled={metrics.length === 0 || validationOnProgress} // Disable the button when loading or no metrics
                  >
                    {validationOnProgress ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="animate-spin" size={16} />{" "}
                        {/* Spinning loader */}
                        <span>Validating...</span>
                      </div>
                    ) : (
                      "Validate All"
                    )}
                  </Button>
                </div>
                {/* Suggested Metrics */}
                <div className="space-y-2">
                  <Label>Suggested Metrics:</Label>
                  {fetchingMetricSuggestion && (
                    <span className="text-gray-500 ml-2">
                      Loading Suggestions...
                    </span>
                  )}
                  {!fetchingMetricSuggestion &&
                    suggestedMetrics.map((metric) => (
                      <Button
                        key={metric.id}
                        variant="outline"
                        onClick={() =>
                          setMetrics((prev) => [
                            ...prev,
                            { ...metric, id: Date.now() },
                          ])
                        }
                      >
                        {metric.name} ({metric.type})
                      </Button>
                    ))}
                </div>
                {/* Process Metrics */}
                <Button
                  onClick={processMetrics}
                  disabled={processing || metrics.length === 0}
                >
                  Process Now
                </Button>

                {loadingMessages && (
                  <div className="h-30 overflow-y-auto border rounded-md p-2">
                    <div className="flex flex-col space-y-2">
                      {loadingMessages.map((message, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <span>{message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible>
          <AccordionItem value="results">
            <AccordionTrigger>Metric Results</AccordionTrigger>
            <AccordionContent>
              <MetricsDataTable
                metricProcessionResult={metricProcessionResult}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
