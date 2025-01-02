import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import { Button } from "@/components/components/ui/button";
import { ScrollArea } from "@/components/components/ui/scroll-area"; // Import ScrollArea
import { useState, useEffect } from "react";
import { getFileViewURL } from "../../config/api";

export default function PreviewData({ selectedFiles, availableFiles }) {
  const [loading, setLoading] = useState(false);
  const [transcriptionFileList, setTranscriptionFileList] = useState([]);
  const [expandedCards, setExpandedCards] = useState({}); // Track expanded cards

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        setLoading(true);

        const fileDetails = availableFiles.filter((fe) =>
          selectedFiles.includes(fe._id)
        );

        const fileListWithSignedUrl = await Promise.all(
          fileDetails.map(async (file) => {
            const { transcriptionFileName } = file;

            if (!transcriptionFileName) {
              throw Error("transcriptionFileName not found");
            }

            const url = await getFileViewURL({
              fileName: transcriptionFileName,
            });

            return { ...file, transcriptionFileUrl: url.signedUrl };
          })
        );

        setTranscriptionFileList(fileListWithSignedUrl);
      } catch (e) {
        console.error("Error while fetching view URL", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscription();
  }, [selectedFiles, availableFiles]);

  const fetchFileDetails = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error fetching file details:", error);
      return "Error fetching file content.";
    }
  };

  const parseSRT = (srtContent) => {
    const subtitles = srtContent
      .trim()
      .split("\n\n")
      .map((block) => {
        const [index, timing, ...textLines] = block.split("\n");
        return {
          index: parseInt(index, 10),
          timing,
          text: textLines.join(" "),
        };
      });
    return subtitles;
  };

  const toggleReadMore = async (id, url) => {
    if (expandedCards[id]) {
      setExpandedCards((prev) => ({ ...prev, [id]: null }));
    } else {
      const content = await fetchFileDetails(url);
      const parsedContent = parseSRT(content);
      setExpandedCards((prev) => ({ ...prev, [id]: parsedContent }));
    }
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {loading && <p>Loading...</p>}
      {!loading &&
        transcriptionFileList.map((file) => (
          <Card key={file._id}>
            <CardHeader>
              <CardTitle>{file.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                {" "}
                {/* Wrap content in ScrollArea */}
                {expandedCards[file._id] ? (
                  <div>
                    {expandedCards[file._id].map((subtitle) => (
                      <div key={subtitle.index} className="mb-2">
                        <p className="text-sm font-semibold">
                          {subtitle.timing}
                        </p>
                        <p className="text-sm">{subtitle.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Show the initial line if available
                  <p className="truncate">{"Subtitle file content..."}</p>
                )}
              </ScrollArea>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() =>
                  toggleReadMore(file._id, file.transcriptionFileUrl)
                }
              >
                {expandedCards[file._id] ? "Read Less" : "Read More"}
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
