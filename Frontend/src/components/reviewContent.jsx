import { React, Fragment } from "react";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Markdown from "markdown-to-jsx";

export function ReviewContentComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const reviewContent = location.state.reviewContent;

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>
      </div>
      <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
        {reviewContent.split("\n\n").map((paragraph, index) => (
          <Fragment key={index}>
            {paragraph.startsWith("##") ? (
              <h2 className="text-xl font-semibold mt-4 mb-2">
                {paragraph.replace(/^##\s/, "")}
              </h2>
            ) : paragraph.startsWith("###") ? (
              <h3 className="text-lg font-semibold mt-4 mb-2">
                {paragraph.replace(/^###\s/, "")} // Remove the '###' from the
                beginning of the paragraph
              </h3>
            ) : paragraph.startsWith("```") ? (
              <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
                <code>
                  {paragraph.replace(/```\w*\n?/, "").replace(/```$/, "")}
                </code>
              </pre>
            ) : (
              <p className="mb-4">{paragraph}</p>
            )}
          </Fragment>
        ))}
      </ScrollArea>
    </div>
  );
}
