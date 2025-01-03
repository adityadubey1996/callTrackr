"use client";

import React, { useState } from "react";
import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import { Label } from "@/components/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/components/ui/select";
import { Loader, Info } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import {
  getMetricSuggestions,
  processMetric,
  verifyMetric,
} from "../../config/api";

const EditMetrics = ({
  metrics,
  setMetrics,
  validationState,
  setValidationState,
  onSave,
}) => {
  const [validationInProgress, setValidationInProgress] = useState(false);

  const validateAllMetrics = async () => {
    try {
      setValidationInProgress(true);

      if (metrics.some((metric) => !metric.type || !metric.name.trim())) {
        throw new Error("All metrics must have a type and name.");
      }

      const response = await verifyMetric(metrics);

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
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setValidationInProgress(false);
    }
  };

  const handleSave = async () => {
    if (
      metrics.some(
        (metric) => validationState[metric.id]?.result !== "valid"
      ) ||
      Object.values(validationState).length !== metrics.length
    ) {
      toast({
        title: "Please fix invalid metrics before saving.",
        variant: "destructive",
      });
      return;
    }

    await onSave(metrics);
  };

  const deleteMetric = (metricId) => {
    setMetrics((prev) => prev.filter((metric) => metric.id !== metricId));
    setValidationState((prev) => {
      const updatedState = { ...prev };
      delete updatedState[metricId];
      return updatedState;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 mt-5">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex space-x-4 items-center">
            <Input
              placeholder="Metric name"
              value={metric.name}
              onChange={(e) => {
                setValidationState((prev) => {
                  console.log("prev", prev);
                });
                setMetrics((prev) =>
                  prev.map((m) =>
                    m.id === metric.id ? { ...m, name: e.target.value } : m
                  )
                );
              }}
              className={`border ${
                validationState &&
                validationState[metric.id] &&
                validationState[metric.id]?.result === "valid"
                  ? "border-green-500"
                  : validationState &&
                    validationState[metric.id] &&
                    validationState[metric.id]?.result === "invalid"
                  ? "border-red-500"
                  : "border-yellow-500"
              }`}
            />
            {validationState &&
              validationState[metric.id] &&
              validationState[metric.id]?.message && (
                <div className="relative flex items-center">
                  <div className="group cursor-pointer">
                    <Info className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                    <div
                      style={{ width: "300px" }}
                      className="absolute left-0 top-full mt-2 hidden w-max rounded-md bg-gray-800 px-2 py-1 text-sm text-white shadow-lg group-hover:block"
                    >
                      {validationState[metric.id].message}
                    </div>
                  </div>
                </div>
              )}
            <span>=</span>
            <Select
              value={metric.type}
              onValueChange={(value) => {
                setValidationState((prev) => {
                  console.log("prev", prev);
                });
                setMetrics((prev) =>
                  prev.map((m) =>
                    m.id === metric.id ? { ...m, type: value } : m
                  )
                );
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
      <div className="flex space-x-4">
        <Button
          onClick={() =>
            setMetrics([...metrics, { id: Date.now(), name: "", type: "" }])
          }
        >
          Add Metric
        </Button>
        <Button
          onClick={validateAllMetrics}
          disabled={metrics.length === 0 || validationInProgress}
        >
          {validationInProgress ? (
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin" size={16} />
              <span>Validating...</span>
            </div>
          ) : (
            "Validate All"
          )}
        </Button>
        <Button onClick={handleSave} variant="primary">
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditMetrics;
