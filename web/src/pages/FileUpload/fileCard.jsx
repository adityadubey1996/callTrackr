import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import { Checkbox } from "@/components/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const FileCard = ({ file, isSelected, onSelect, onAction, onPreview }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{file.name}</CardTitle>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          {file.transcriptionStatus} • Uploaded 23 minutes ago
        </div>
        <div className="absolute bottom-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction("transcribe", file)}>
                Transcribe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("retry", file)}>
                Retry Upload
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("delete", file)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPreview}>Preview</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;
