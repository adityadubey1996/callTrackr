"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";

const FinalReport = ({
  selectedFiles,
  metrics,
  selectedMetricList,
  availableFiles,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Selected Files</h3>
      <ul>
        {selectedFiles.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
      <h3 className="text-xl font-bold">Metrics</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric Name</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.id}>
              <TableCell>{metric.name}</TableCell>
              <TableCell>{metric.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinalReport;
