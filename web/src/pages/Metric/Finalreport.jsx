import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import { Button } from "@/components/components/ui/button";
import FileCardForConversation from "@/components/FIleCardForConversartion";
import { destructureUniqueFileName } from "../../config/utils";

export default function FinalReport({
  selectedFiles,
  metrics,
  results,
  availableFiles,
}) {
  const fileResults = availableFiles
    .filter((fi) => selectedFiles.includes(fi._id))
    .map((file) => {
      const fileId = file._id;
      const fileMetrics = metrics.map((metric) => {
        const resultEntry = results.find(
          (res) => res.fileId === fileId && res.name === metric.name
        );
        if (resultEntry && resultEntry.result !== undefined) {
          return resultEntry.result;
        } else if (resultEntry && resultEntry.error) {
          return resultEntry.error;
        } else {
          return "N/A";
        }
      });
      return {
        fileName: destructureUniqueFileName(file.fileName).originalFileName,
        fileMetrics,
      };
    });
  return (
    <div className="space-y-6">
      {/* Accordion for Final Report Table */}
      <Accordion type="single" collapsible>
        <AccordionItem value="report-table">
          <AccordionTrigger>Final Report</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  {metrics.map((metric) => (
                    <TableHead key={metric.id}>{metric.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileResults.map((fileResult, fileIndex) => (
                  <TableRow key={fileIndex}>
                    <TableCell>{fileResult.fileName}</TableCell>
                    {fileResult.fileMetrics.map((metricResult, metricIndex) => (
                      <TableCell key={metricIndex}>{metricResult}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Accordion for Metrics Details */}
      <Accordion type="single" collapsible>
        <AccordionItem value="metrics-details">
          <AccordionTrigger>Metrics Details</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="p-4 border rounded-lg shadow-sm bg-gray-800 mt-5"
                >
                  <h3 className="font-semibold text-xl text-white-800">
                    {metric.name}
                  </h3>
                  {metric.description && (
                    <p className="mt-2 text-white-600">
                      <span className="font-medium">Description: </span>
                      {metric.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-white-500">
                    <span className="font-medium">Type: </span>
                    {metric.type}
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Accordion for Selected Files */}
      <Accordion type="single" collapsible>
        <AccordionItem value="available-files">
          <AccordionTrigger>Available Files</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-64 overflow-y-auto space-y-4 flex flex-wrap gap-4">
              {availableFiles
                .filter((fi) => selectedFiles.includes(fi._id))
                .map((file) => (
                  <FileCardForConversation
                    key={file._id}
                    file={file}
                    doNotShowFileOption={true}
                  />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
