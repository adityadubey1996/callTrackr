import { Checkbox } from "@/components/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/components/ui/select";
import { Label } from "@/components/components/ui/label";
import { sampleFiles, sourceOptions } from "./SampleData";

export default function SelectFiles({ selectedFiles, setSelectedFiles }) {
  const handleFileSelect = (file) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.id === file.id)
        ? prev.filter((f) => f.id !== file.id)
        : [...prev, { ...file, source: file.type }]
    );
  };

  const handleSourceChange = (fileId, source) => {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, source } : f))
    );
  };

  return (
    <div className="space-y-4">
      {sampleFiles.map((file) => (
        <div key={file.id} className="flex items-center space-x-4">
          <Checkbox
            id={`file-${file.id}`}
            checked={selectedFiles.some((f) => f.id === file.id)}
            onCheckedChange={() => handleFileSelect(file)}
          />
          <Label htmlFor={`file-${file.id}`}>{file.name}</Label>
          {selectedFiles.some((f) => f.id === file.id) && (
            <Select
              value={
                selectedFiles.find((f) => f.id === file.id)?.source || file.type
              }
              onValueChange={(value) => handleSourceChange(file.id, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  );
}
