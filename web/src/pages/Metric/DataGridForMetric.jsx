"use client";

import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/components/ui/dialog";
import { Button } from "@/components/components/ui/button";
import { MoreHorizontal, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import FilePreviewModal from "../FileUpload/filePreviewModal";
import { getFileById, getFileViewURL } from "../../config/api";

const MetricsDataTable = ({ metricProcessionResult }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [data, setData] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const handleViewMore = (metric) => {
    setSelectedMetric(metric);
    setOpenModal(true);
  };
  useEffect(() => {
    if (!metricProcessionResult) return;

    setData(metricProcessionResult);
  }, [metricProcessionResult]);

  const columns = [
    {
      accessorKey: "name",
      header: "Metric Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "fileId",
      header: "File ID",
      cell: ({ row }) => row.original.fileId,
    },
    {
      accessorKey: "result",
      header: "Result",
      cell: ({ row }) => {
        const metric = row.original;
        return metric.error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error
          </div>
        ) : (
          metric.result
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const metric = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleViewMore(metric)}>
                View More
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePreview = async (fileId, startTime, endTime) => {
    try {
      // Validate the required parameters
      if (!fileId || !startTime || !endTime) {
        throw new Error(
          "fileId, startTime, and endTime are required parameters."
        );
      }

      const file = await getFileById(fileId);

      if (!file) {
        throw new Error(`File with ID ${fileId} not found.`);
      }

      const { fileName } = file;

      if (!fileName) {
        throw new Error("File name not found for the provided file.");
      }

      const url = await getFileViewURL({ fileName });

      if (!url || !url.signedUrl) {
        throw new Error("Failed to fetch signed URL for the file.");
      }

      setPreviewFile({ ...file, url: url.signedUrl, startTime, endTime });
    } catch (error) {
      console.error("Error in handlePreview:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto max-w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No metrics found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {selectedMetric && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-screen-lg w-full h-full">
            <DialogHeader>
              <DialogTitle>{selectedMetric.name}</DialogTitle>
            </DialogHeader>
            {selectedMetric.error ? (
              <div className="text-red-600 bg-red-100 p-4 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{selectedMetric.error}</p>
              </div>
            ) : (
              <Accordion type="single" collapsible>
                <div style={{ height: "60vh" }} className="overflow-y-auto">
                  {selectedMetric.context &&
                    selectedMetric.context.map((context, index) => (
                      <AccordionItem key={index} value={`context-${index}`}>
                        <AccordionTrigger>
                          Start: {context.startTime} | End: {context.endTime}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {/* Text Content */}
                            <div>
                              <h4 className="text-lg font-semibold">Text:</h4>
                              <p className="text-white-700 bg-gray-700 p-4 rounded-md">
                                {context?.text}
                              </p>
                            </div>

                            {/* Keywords */}
                            <div>
                              <h4 className="text-lg font-semibold">
                                Keywords:
                              </h4>
                              <ul className="list-disc pl-6 bg-gray-700">
                                {context?.keywords?.map((keywordObj, idx) => (
                                  <li key={idx} className="text-white-700">
                                    <span className="font-semibold">
                                      {keywordObj.keyword}
                                    </span>
                                    :{" "}
                                    <span className="text-sm text-white-500">
                                      {keywordObj.score}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Sentiment */}
                            <div>
                              <h4 className="text-lg font-semibold ">
                                Sentiment:
                              </h4>
                              <p
                                className={`p-2 rounded-md ${
                                  context?.sentiment?.label === "POSITIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {context?.sentiment?.label} (Score:{" "}
                                {context?.sentiment?.score.toFixed(2)})
                              </p>
                            </div>

                            {/* File Preview Button */}
                            <div>
                              <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => {
                                  alert(`Previewing file: ${context.file_id}`);
                                  handlePreview(
                                    context.file_id,
                                    context.startTime,
                                    context.endTime
                                  );
                                }}
                              >
                                Preview File
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </div>
              </Accordion>
            )}
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {previewFile && (
        <FilePreviewModal
          files={[previewFile]}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default MetricsDataTable;
