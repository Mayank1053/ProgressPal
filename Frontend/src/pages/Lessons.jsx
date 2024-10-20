import { useMemo, useCallback } from "react";
import { Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";

const Lessons = () => {
  const location = useLocation();
  const lessonsData = location.state?.courseData;
  console.log("Lessons data:", lessonsData);

  const lessonPlan = useMemo(() => lessonsData.lessonPlan, [lessonsData]);
  const title = useMemo(() => lessonsData.title, [lessonsData]);

  const totalLessons = useMemo(() => {
    return lessonPlan.topics.reduce(
      (acc, topic) => acc + topic.subtopics.length,
      0
    );
  }, [lessonPlan]);

  const completedLessons = useMemo(() => {
    return lessonPlan.topics.reduce(
      (acc, topic) => acc + topic.subtopics.filter((st) => st.completed).length,
      0
    );
  }, [lessonPlan]);

  const progressPercentage = useMemo(() => {
    return (completedLessons / totalLessons) * 100;
  }, [completedLessons, totalLessons]);

  const isLocked = useCallback((date) => {
    return new Date(date) > new Date();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg font-semibold">
              {title}
            </CardTitle>
            {/* <Button variant="outline" size="sm">
              Show Revision
            </Button> */}
          </div>
          <div className="flex justify-between items-center mb-2">
            <div>
              Progress: {completedLessons}/{totalLessons}
            </div>
            <div>{progressPercentage.toFixed(0)}% complete</div>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardContent>
      </Card>
      <Accordion type="multiple" className="space-y-4">
        {lessonPlan.topics.map((topic, index) => {
          const topicCompletedCount = topic.subtopics.filter(
            (st) => st.completed
          ).length;
          const isTopicCompleted =
            topicCompletedCount === topic.subtopics.length;
          return (
            <AccordionItem
              value={`topic-${index}`}
              key={index}
              className={`border rounded-lg ${
                isTopicCompleted ? "border-gray-600" : ""
              }`}
            >
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold flex items-center gap-2">
                    {topic.topic}
                    {isTopicCompleted && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {topicCompletedCount}/{topic.subtopics.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 p-2">
                  {topic.subtopics.map((subtopic, subIndex) => {
                    const locked = isLocked(subtopic.date);
                    return (
                      <Card
                        key={subIndex}
                        className={`bg-muted/50 ${locked ? "opacity-50" : ""} ${
                          subtopic.completed ? "border border-gray-400" : ""
                        }`}
                      >
                        <CardHeader className="p-2">
                          <CardTitle className="text-sm flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              {subtopic.title}
                              {locked && <Lock className="h-4 w-4" />}
                              {subtopic.completed && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </span>
                            <Badge
                              variant={
                                subtopic.completed ? "default" : "outline"
                              }
                            >
                              {subtopic.completed ? "Completed" : "Incomplete"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Lessons;
