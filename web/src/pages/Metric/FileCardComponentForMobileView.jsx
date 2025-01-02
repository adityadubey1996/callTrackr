"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Trash, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/components/ui/dropdown-menu";
import { Button } from "@/components/components/ui/button";
const FileCardComponentForMobileView = ({
  conversation,
  onDelete,
  onPreview,
  handleStartConversation,
}) => {
  const { title, createdAt, fileIds } = conversation;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 border rounded-lg shadow-md bg-dark-900 text-white"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h3 className="font-semibold truncate max-w-[150px] sm:max-w-[300px] md:max-w-[300px]">
            {title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDelete(conversation._id)}>
              Delete Conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreview(conversation)}>
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStartConversation(conversation)}
            >
              Start Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 text-sm">
        <p>Created: {new Date(createdAt).toLocaleString()}</p>
        <p>Files: {fileIds.length} file(s) associated</p>
      </div>
    </motion.div>
  );
};

export default FileCardComponentForMobileView;
