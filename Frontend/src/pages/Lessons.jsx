// React imports
import { useMemo, useCallback, useState, useEffect } from "react";

// Third-party library imports
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Check, BookOpen } from "lucide-react";

// Local component imports
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
import { Spinner } from "@/components/ui/spinner";
import Quiz from "@/components/Quiz";

// Utility function imports
import { getLessonPlan, getKnowledgeCheck } from "@/lib/api";

const Lessons = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);

  const lessonPlan = courseData.lessonPlan || { topics: [] };
  const title = courseData.title || "";

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await getLessonPlan(courseId);
        console.log("Course data:", response.data);
        setCourseData(response.data);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

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

  const handleSubtopicClick = (index, subIndex) => {
    const subtopic = lessonPlan.topics[index].subtopics[subIndex];
    console.log("Subtopic clicked:", subtopic);
    navigate(`/courses/content/${subtopic.title}`, {
      state: {
        subtopic,
        lessonPlanId: lessonPlan._id,
        subtopicIndex: [index, subIndex],
      },
    });
  };

  const handleKnowledgeCheck = async (topicIndex) => {
    try {
      const response = await getKnowledgeCheck(
        { lessonPlanId: lessonPlan._id },
        topicIndex
      );
      setQuizQuestions(response.data.questions);
      setCurrentTopicIndex(topicIndex);
      setShowQuiz(true);
    } catch (error) {
      console.error("Failed to fetch knowledge check:", error);
    }
  };

  const handleQuizComplete = (score) => {
    // Here you would typically update the backend with the quiz results
    console.log(
      `Quiz completed for topic ${currentTopicIndex}. Score: ${score}`
    );
    setShowQuiz(false);
    // You might want to update the local state to reflect the completed knowledge check
    const updatedTopics = [...lessonPlan.topics];
    updatedTopics[currentTopicIndex].knowledgeCheckCompleted = true;
    setCourseData({
      ...courseData,
      lessonPlan: { ...lessonPlan, topics: updatedTopics },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (showQuiz) {
    return <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <div className="flex justify-between items-center mb-2">
            <div>
              Progress: {completedLessons}/{totalLessons}
            </div>
            <div>{progressPercentage.toFixed(1)}% complete</div>
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
          const isKnowledgeCheckAvailable =
            isTopicCompleted && !topic.knowledgeCheckCompleted;
          return (
            <AccordionItem
              value={`topic-${index}`}
              key={index}
              className={`border rounded-lg ${
                isTopicCompleted ? "border-gray-600" : ""
              }`}
            >
              <AccordionTrigger className="px-2 py-2 hover:no-underline hover:bg-muted/50">
                <div className="flex justify-between items-center w-full text-left gap-2">
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
                        } text-left`}
                      >
                        <CardHeader
                          className={`p-2 cursor-pointer ${
                            locked ? "cursor-not-allowed" : ""
                          }`}
                          onClick={() =>
                            !locked && handleSubtopicClick(index, subIndex)
                          }
                        >
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
                  {isKnowledgeCheckAvailable && (
                    <Button
                      onClick={() => handleKnowledgeCheck(index)}
                      className="w-full mt-2"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Take Knowledge Check
                    </Button>
                  )}
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
