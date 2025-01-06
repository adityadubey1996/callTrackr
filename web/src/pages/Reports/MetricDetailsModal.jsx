"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/components/ui/accordion";
import { Button } from "@/components/components/ui/button";

const MetricDetailsModal = ({
  selectedMetric,
  openModal,
  setOpenModal,
  handlePreview,
}) => {
  const { metric, fileId } = selectedMetric;
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-screen-lg w-full">
        <DialogHeader>
          <DialogTitle>{metric.name}</DialogTitle>
        </DialogHeader>
        {metric.error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{metric.error}</p>
          </div>
        ) : (
          <Accordion type="single" collapsible>
            <div style={{ height: "60vh" }} className="overflow-y-auto">
              {metric.result}
              {metric.context &&
                metric.context.map((context, index) => (
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
                          <h4 className="text-lg font-semibold">Keywords:</h4>
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
                          <h4 className="text-lg font-semibold ">Sentiment:</h4>
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
                        {console.log("context", context)}
                        {console.log("metric", metric)}
                        <div>
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => {
                              handlePreview(
                                fileId,
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
          //   <Accordion type="single" collapsible>
          //     {metric.context &&
          //       metric.context.map((context, index) => (
          //         <AccordionItem key={index} value={`context-${index}`}>
          //           <AccordionTrigger>
          //             Start: {context.startTime} | End: {context.endTime}
          //           </AccordionTrigger>
          //           <AccordionContent>
          //             <div className="space-y-4">
          //               <div>
          //                 <h4 className="text-lg font-semibold">Text:</h4>
          //                 <p className="bg-gray-700 p-4 rounded-md">
          //                   {context?.text}
          //                 </p>
          //               </div>
          //               <div>
          //                 <h4 className="text-lg font-semibold">Keywords:</h4>
          //                 <ul className="list-disc pl-6 bg-gray-700">
          //                   {context?.keywords?.map((keywordObj, idx) => (
          //                     <li key={idx}>
          //                       <span className="font-semibold">
          //                         {keywordObj.keyword}
          //                       </span>
          //                       : {keywordObj.score}
          //                     </li>
          //                   ))}
          //                 </ul>
          //               </div>
          //             </div>
          //           </AccordionContent>
          //         </AccordionItem>
          //       ))}
          //   </Accordion>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDetailsModal;
