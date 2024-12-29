import React from "react";
import { FileIcon, FileAudioIcon, FileVideoIcon } from "lucide-react";
import { destructureUniqueFileName } from "../../config/utils";

const FileList = ({ files, onClick }) => {
  const getIcon = (icon) => {
    if (icon.includes("audio")) {
      return <FileAudioIcon className="mr-2 h-4 w-4" />;
    } else if (icon.includes("video")) {
      return <FileVideoIcon className="mr-2 h-4 w-4" />;
    } else {
      return <FileIcon className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li
          key={file.fileName}
          className="flex items-center cursor-pointer hover:bg-primary hover:text-primary-foreground rounded p-2 transition-colors"
          onClick={() => onClick(file)}
        >
          {getIcon(file.fileType)}
          <span className="text-sm">
            {" "}
            {destructureUniqueFileName(file.fileName).originalFileName}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default FileList;
