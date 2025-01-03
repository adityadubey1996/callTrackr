"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import { Button } from "@/components/components/ui/button";
import useMediaQuery from "../../hooks/useMediaQuery"; // Custom hook to detect screen size

const MetricListView = ({
  metricLists,
  onEditMetricList,
  setSelectedMetricList,
  selectedMetricList,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Detect mobile view

  const handleSelect = (metricListId) => {
    setSelectedMetricList((prev) =>
      prev === metricListId ? null : metricListId
    ); // Toggle selection
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">
        Metric Lists
      </h1>
      {metricLists && metricLists.length > 0 ? (
        <>
          {isMobile ? (
            <div className="flex flex-col gap-4">
              {metricLists.map((metricList) => (
                <div
                  key={metricList.id}
                  className={`p-4 border rounded-lg shadow-md ${
                    selectedMetricList === metricList.id
                      ? "bg-blue-800"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => handleSelect(metricList.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className=" font-semibold text-white">
                        Metric List ID: {metricList.id}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Created At:{" "}
                        {new Date(metricList.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                      onClick={() => onEditMetricList(metricList)}
                      disabled={selectedMetricList !== metricList.id}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-white mb-2">
                      Metrics
                    </h4>
                    <ul className="list-disc ml-4 text-gray-300">
                      {metricList.metrics.slice(0, 2).map((metric) => (
                        <li key={metric.id}>
                          <strong>{metric.name}</strong>: {metric.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible>
              {metricLists.map((metricList) => (
                <AccordionItem key={metricList.id} value={metricList.id}>
                  <AccordionTrigger
                    className={`p-4 rounded-lg shadow-md ${
                      selectedMetricList === metricList.id
                        ? "bg-blue-800"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => handleSelect(metricList.id)}
                  >
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Metric List ID: {metricList.id}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">
                          Created At:{" "}
                          {new Date(metricList.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                          Files: {metricList.fileIds.length} file(s)
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 text-gray-300 hover:text-white"
                          onClick={() => onEditMetricList(metricList)}
                          disabled={selectedMetricList !== metricList.id}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-gray-900">
                    <h4 className="text-md font-semibold text-white mb-2">
                      Metrics
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white text-left">
                            Metric ID
                          </TableHead>
                          <TableHead className="text-white text-left">
                            Name
                          </TableHead>
                          <TableHead className="text-white text-left">
                            Type
                          </TableHead>
                          <TableHead className="text-white text-left">
                            Description
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metricList.metrics.map((metric) => (
                          <TableRow key={metric.id}>
                            <TableCell>{metric.id}</TableCell>
                            <TableCell>{metric.name}</TableCell>
                            <TableCell>{metric.type}</TableCell>
                            <TableCell>{metric.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-center">No Metric Lists Available</p>
      )}
    </div>
  );
};

export default MetricListView;
