"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import { Button } from "@/components/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const DataTable = ({ data, onViewMore, metrics }) => {
  // Dynamically generate columns
  const columns = useMemo(() => {
    if (!data.length) return [];

    // Extract unique metric names for dynamic column generation
    const metrics = data[0]?.metricResults.map((metric) => metric.name) || [];

    return ["File Name", ...metrics];
  }, [data]);
  return (
    <div className="rounded-md border overflow-x-auto max-w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length ? (
            data.map((fileResult, fileIndex) => (
              <TableRow key={fileIndex}>
                {/* File Name */}
                <TableCell>{fileResult.fileName}</TableCell>

                {/* Metric Results */}
                {fileResult.metricResults.map((metricResult, metricIndex) => (
                  <TableCell key={metricIndex}>
                    <div className="flex items-center justify-between">
                      <span>
                        {metricResult.error ? (
                          <span className="text-red-600">Error</span>
                        ) : metricResult.result.length > 150 ? (
                          <span>
                            {metricResult.result.slice(0, 150)}...
                            <Button
                              variant="link"
                              size="sm"
                              className="ml-1 text-blue-500"
                              onClick={() =>
                                onViewMore(metricResult, fileResult.fileId)
                              }
                            >
                              View More
                            </Button>
                          </span>
                        ) : (
                          metricResult.result
                        )}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              onViewMore(metricResult, fileResult.fileId)
                            }
                          >
                            View More
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
