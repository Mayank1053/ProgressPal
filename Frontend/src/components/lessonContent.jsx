import { React, useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { markComplete } from "@/lib/api";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  const markdown = `# Hello, Markdown!
  ## Lists

  ### Ordered List
 1. Item 1
 2. Item 2
 3. Item 3

 ### Unordered List
 - Bullet 1
 - Bullet 2
   - Sub-bullet A
   - Sub-bullet B
 - Bullet 3`;

  return (
    <div className="min-h-screen bg-background text-foreground p-2 md:p-4">
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center text-xs md:text-base"
        >
          <ArrowLeft className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4" />
          Back to Lessons
        </Button>
        <Button
          size="sm"
          variant={isCompleted ? "solid" : "outline"}
          onClick={handleMarkAsComplete}
          className={`${
            isCompleted ? "bg-gray-900 text-white" : ""
          } disabled:opacity-100 flex items-center text-xs md:text-base`}
          disabled={isCompleted || isMarkingComplete}
        >
          {isMarkingComplete ? (
            <Loader2 className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4 animate-spin" />
          ) : isCompleted ? (
            "Completed"
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </div>
      <h1 className="md:text-sm font-bold mb-2 md:mb-4">{subtopic.title}</h1>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 text-xs md:text-base">
          <TabsTrigger value="overview" size="sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="objectives" size="sm">
            Objectives
          </TabsTrigger>
          <TabsTrigger value="content" size="sm">
            Lesson Content
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 text-xs md:text-base">
                {lessonContent.overview.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="objectives">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <ul className="space-y-1 md:space-y-2 text-xs md:text-base">
                {lessonContent.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-1 md:mr-2 h-4 md:h-5 w-4 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <div className="prose max-w-none p-4 border rounded bg-white h-[calc(100vh-200px)] overflow-auto">
            <ReactMarkdown>{lessonContent.content}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
