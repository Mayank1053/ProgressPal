import { React, useState, Fragment } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { markComplete } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Markdown from "markdown-to-jsx";

export function LessonContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const subtopic = location.state.subtopic;
  const lessonPlanId = location.state.lessonPlanId;
  const subtopicIndex = location.state.subtopicIndex;

  const lessonContent = subtopic.lessonContent;
  const [isCompleted, setIsCompleted] = useState(subtopic.completed);
  /*
  {
    "content": "##  Understanding the Elements of Fantasy\n\nWelcome to the Beginner's Guide to Fantasy Novel Writing! In this first section, we'll explore the fundamental elements that make fantasy so captivating.\n\n### Introduction\n\nFantasy, at its heart, is a genre fueled by imagination. It invites us to step into worlds beyond our own, filled with magic, mythical creatures, and epic adventures. But what exactly makes a story ",
    "objectives": [
        "Define the fantasy genre and its key characteristics.",
        "Identify common elements found in fantasy literature.",
        "Understand how these elements work together to create immersive stories."
    ],
    "overview": [
        "Fantasy is a genre of speculative fiction involving magical elements, typically set in a fictional universe.",
        "Key elements often include magic systems, mythical creatures, fantastical races, and epic battles between good and evil."
    ]
}
  */

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const { mutate: markCompleteMutation, isPending: isMarkingComplete } =
    useMutation({
      mutationFn: markComplete,
      onSuccess: (data) => {
        console.log("Lesson marked as complete:", data);
        setIsCompleted(true);
      },
    });

  const handleMarkAsComplete = () => {
    // Mark the lesson as complete
    markCompleteMutation({
      lessonPlanId,
      subtopicIndex,
    });
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
        <Button
          variant={isCompleted ? "solid" : "outline"}
          onClick={handleMarkAsComplete}
          className={`${
            isCompleted ? "bg-gray-900 text-white" : ""
          } disabled:opacity-100 flex items-center`}
          disabled={isCompleted || isMarkingComplete}
        >
          {isMarkingComplete ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isCompleted ? (
            "Completed"
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{subtopic.title}</h1>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="content">Lesson Content</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <ul className="list-disc pl-5 space-y-2">
                {lessonContent.overview.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="objectives">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {lessonContent.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            {lessonContent.content.split("\n\n").map((paragraph, index) => (
              <Fragment key={index}>
                {paragraph.startsWith("##") ? (
                  <h2 className="text-xl font-semibold mt-4 mb-2">
                    {paragraph.replace(/^##\s/, "")}
                  </h2>
                ) : paragraph.startsWith("###") ? (
                  <h3 className="text-lg font-semibold mt-4 mb-2">
                    {paragraph.replace(/^###\s/, "")} // Remove the '###' from
                    the beginning of the paragraph
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
