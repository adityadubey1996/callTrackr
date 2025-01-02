"use client";

import React from "react";
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

const MetricListView = ({ metricLists }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Detect mobile view

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">
        Metric Lists
      </h1>
      {metricLists && metricLists.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile View
            <div className="flex flex-col gap-4">
              {metricLists.map((metricList) => (
                <div
                  key={metricList.id}
                  className="p-4 border rounded-lg shadow-md bg-gray-800 hover:bg-gray-700"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      Metric List ID: {metricList.id}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Created At:{" "}
                      {new Date(metricList.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Files: {metricList.fileIds.length} file(s)
                    </p>
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
                    {metricList.metrics.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-gray-300 border-gray-500 hover:text-white hover:border-white"
                        onClick={() =>
                          alert("Navigate to detailed view for this MetricList")
                        }
                      >
                        View More
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop View
            <Accordion type="single" collapsible>
              {metricLists.map((metricList) => (
                <AccordionItem key={metricList.id} value={metricList.id}>
                  <AccordionTrigger className="p-4 rounded-lg shadow-md bg-gray-800 hover:bg-gray-700">
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
                      <div>
                        <p className="text-sm text-gray-400 text-right">
                          Files: {metricList.fileIds.length} file(s)
                        </p>
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
