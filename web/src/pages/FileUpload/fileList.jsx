import React from "react";
import { Checkbox } from "@/components/components/ui/checkbox";
import { Button } from "@/components/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  FileAudio,
  FileVideo,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { DataTable } from "./dataTable";
import { destructureUniqueFileName } from "../../config/utils";

export default function FileList({
  files,
  selectedFiles,
  onSelectFile,
  onFileAction,
  onPreview,
  onTranscriptionLogs,
}) {
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="h-6 w-6 border-gray-400 text-blue-500 checked:bg-gray-200 dark:checked:bg-gray-800 dark:border-gray-600 checked:text-blue-500"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="h-6 w-6 border-gray-400 text-blue-500 checked:bg-gray-200 dark:checked:bg-gray-800 dark:border-gray-600 checked:text-blue-500"
        />
      ),
    },
    {
      accessorKey: "fileName",
      header: "File Name",
      cell: ({ row }) => {
        const file = row.original;
        return (
          <div className="flex items-center">
            {file.type === "audio" ? (
              <FileAudio className="mr-2 h-4 w-4" />
            ) : (
              <FileVideo className="mr-2 h-4 w-4" />
            )}
            <span
              className="truncate max-w-[150px] sm:max-w-[300px] md:max-w-[300px]"
              title={destructureUniqueFileName(file.fileName).originalFileName} // Tooltip to show full file name on hover
            >
              {destructureUniqueFileName(file.fileName).originalFileName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "fileType",
      header: "File Type",
    },
    {
      accessorKey: "uploadStatus",
      header: "Upload Status",
    },
    {
      accessorKey: "transcriptionStatus",
      header: "Transcription Status",
    },
    {
      accessorKey: "isFileReadyForChat",
      header: "File Chat Status",
      cell: ({ row }) => {
        const isReady = row.original.isFileReadyForChat;
        return (
          <div className="flex items-center">
            {isReady ? (
              <CheckCircle
                className="h-4 w-4 mr-1 text-green-500"
                title="Ready for Chat"
              />
            ) : (
              <AlertCircle
                className="h-4 w-4 mr-1 text-red-500"
                title="Not Ready for Chat"
              />
            )}
            <span>{isReady ? "Ready" : "Not Ready"}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const file = row.original;
        return (
          <FileOptions
            file={file}
            onFileAction={onFileAction}
            onPreview={onPreview}
            onTranscriptionLogs={onTranscriptionLogs}
          />
        );
      },
    },
  ];

  return (
    <div>
      {/* Desktop view */}
      <div className="hidden md:block">
        <DataTable columns={columns} data={files} />
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {files.map((file) => (
          <div key={file.id} className="bg-grey p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => onSelectFile(file.id)}
                  className="mr-2"
                />
                <span className="font-semibold truncate max-w-[150px] sm:max-w-[300px]">
                  {destructureUniqueFileName(file.fileName).originalFileName}
                </span>
              </div>
              <FileOptions
                file={file}
                onFileAction={onFileAction}
                onPreview={onPreview}
                onTranscriptionLogs={onTranscriptionLogs}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Type: {file.fileType}</p>
              <p>Upload Status: {file.uploadStatus}</p>
              <p>Transcription Status: {file.transcriptionStatus}</p>
              <p>Uploaded 23 minutes ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FileOptions = ({
  file,
  onFileAction,
  onPreview,
  onTranscriptionLogs,
}) => {
  const { uploadStatus, transcriptionStatus } = file;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Transcribe option: Disable if transcriptionStatus is not Pending */}
        <DropdownMenuItem
          onClick={() => onFileAction(file, "transcribe")}
          disabled={transcriptionStatus === "In_progress"}
        >
          Transcribe
        </DropdownMenuItem>

        {/* Retry Upload: Enable only if uploadStatus is Failed */}
        <DropdownMenuItem
          onClick={() => onFileAction(file, "retry")}
          disabled={uploadStatus !== "Failed"}
        >
          Retry Upload
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFileAction(file, "delete")}>
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPreview(file)}>
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTranscriptionLogs(file)}
          disabled={transcriptionStatus === "Pending"}
        >
          View Transcription Logs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
