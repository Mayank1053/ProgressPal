import { React } from "react";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

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
      <div className="prose max-w-none p-4 border rounded bg-white h-[calc(100vh-200px)] overflow-auto">
        <ReactMarkdown>{reviewContent}</ReactMarkdown>
      </div>
    </div>
  );
}
