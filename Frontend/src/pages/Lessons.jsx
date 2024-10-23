// React imports
import { useMemo, useState, useEffect } from "react";

// Third-party library imports
import { useParams, useNavigate } from "react-router-dom";
import { Check, BookOpen, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

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
import {
  getLessonPlan,
  getKnowledgeCheck,
  saveKnowledgeCheck,
} from "@/lib/api";

const Lessons = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await getLessonPlan(courseId);
        setCourseData(response.data);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const lessonPlan = courseData.lessonPlan || { topics: [] };
  const title = courseData.title || "";

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

  const isSubtopicLocked = (data) => {
    return new Date(data) > new Date();
  };

  // Check if the topic is locked based on the start date
  const isTopicLocked = (date) => {
    return new Date(date) > new Date();
  };

  const handleSubtopicClick = (index, subIndex) => {
    const subtopic = lessonPlan.topics[index].subtopics[subIndex];
    navigate(`/courses/content/${subtopic.title}`, {
      state: {
        subtopic,
        lessonPlanId: lessonPlan._id,
        subtopicIndex: [index, subIndex],
      },
    });
  };

  const { mutate: getKnowledgeCheckMutation } = useMutation({
    mutationFn: getKnowledgeCheck,
    onSuccess: (response) => {
      setQuizQuestions(response.data);
      setShowQuiz(true);
    },
    onError: (error) => {
      console.error("Failed to fetch knowledge check:", error);
    },
  });

  const handleKnowledgeCheck = (index) => {
    setCurrentTopicIndex(index);
    getKnowledgeCheckMutation({
      LessonPlanId: lessonPlan._id,
      topicIndex: index,
    });
  };

  const {
    mutate: saveKnowledgeCheckMutation,
    isPending: creatingReviewContent,
  } = useMutation({
    mutationFn: saveKnowledgeCheck,
    onSuccess: () => {
      console.log("Knowledge check saved successfully");
    },
    onError: (error) => {
      console.error("Failed to save knowledge check:", error);
    },
  });

  const handleQuizComplete = (score, wrongAnswered) => {
    // Here you would typically update the backend with the quiz results
    saveKnowledgeCheckMutation({
      lessonPlanId: lessonPlan._id,
      topicIndex: currentTopicIndex,
      knowledgeCheckId: lessonPlan.topics[currentTopicIndex].quiz,
      score,
      wrongAnswered,
    });
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
          const isLocked = isTopicLocked(topic.start_date);
          const topicCompletedCount = topic.subtopics.filter(
            (st) => st.completed
          ).length;
          const isTopicCompleted =
            topicCompletedCount === topic.subtopics.length;
          // Check if knowledge check is available for the topic and user has not completed it
          // why is the knowledge check shows up for all the topics when it is only available for the completed topic?
          const isKnowledgeCheckAvailable =
            isTopicCompleted && !topic.knowledgeCheckCompleted;
          return (
            <AccordionItem
              value={`topic-${index}`}
              key={index}
              // lock the trigger if the topic is locked
              className={`border rounded-lg ${
                isTopicCompleted ? "border-gray-600" : ""
              } ${isLocked ? "opacity-80" : ""}`}
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
                    const locked = isSubtopicLocked(topic.start_date);
                    return (
                      <Card
                        key={subIndex}
                        className={`bg-muted/50 ${locked ? "opacity-50" : ""} ${
                          subtopic.completed ? "border border-green-500" : ""
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
                          <CardTitle className="text-xs md:text-sm flex justify-between items-center">
                            {subtopic.title}
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
                  {/* Show knowledge check button if available */}
                  {isKnowledgeCheckAvailable && (
                    <Button
                      onClick={() => handleKnowledgeCheck(index)}
                      className="w-full mt-2"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Take Knowledge Check
                    </Button>
                  )}
                  {/* When the knowledgeCheckIsCompleted show the reviewContent in LessonContentPage with only content tab*/}
                  {topic.knowledgeCheckCompleted && (
                    <Button
                      onClick={() =>
                        navigate(`/courses/reviewContent`, {
                          state: {
                            reviewContent: topic.reviewContent,
                          },
                        })
                      }
                      className="w-full mt-2"
                    >
                      {creatingReviewContent ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <BookOpen className="mr-2 h-4 w-4" />
                      )}
                      Review Content
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
