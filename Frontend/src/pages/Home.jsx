import { useEffect, useState } from "react";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { DetailInputDialog } from "@/components/dialogs/DetailInputDialog";
import { PlanSelectorDialog } from "@/components/dialogs/PlanSelectorDialog";
import { useMutation } from "@tanstack/react-query";
import { startCourse, createLessonPlans } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const HomePage = () => {
  const { user } = useAuth();
  const { isLearning } = user;
  const [isLearningDialogOpen, setIsLearningDialogOpen] = useState(false);
  const [isLessonPlanDialogOpen, setIsLessonPlanDialogOpen] = useState(false);
  const [generatedLessonPlans, setGeneratedLessonPlans] = useState([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState("");
  const [dailyStudyTime, setDailyStudyTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLearning) {
      navigate("/courses");
    }
  }, [isLearning, navigate]);

  const handleStartLearning = () => {
    setIsLearningDialogOpen(true);
  };

  const handleLearningSubmit = (data) => {
    setGeneratedLessonPlans((prevPlans) => [...prevPlans, data]);
    setIsGeneratingPlan(false);
    setIsLearningDialogOpen(false);
    setIsLessonPlanDialogOpen(true);
  };

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
  };

  const { mutate: startCourseMutation, isPending: isStartingCourse } =
    useMutation({
      mutationFn: startCourse,
      onSuccess: (data) => {
        console.log("Course started:", data);
        navigate("/courses");
      },
    });

  const { mutate: createLessonPlansMutation} =
    useMutation({
      mutationFn: createLessonPlans,
      onSuccess: (data) => {
        handleLearningSubmit(data.data);
      },
    });

  const startCourseButton = (plan) => {
    startCourseMutation({
      FinalPlan: plan,
      startDate: new Date().toISOString(),
      level,
      goal,
      dailyStudyTime,
    });
  };

  const handleEditPlan = (index, updatedPlan) => {
    setGeneratedLessonPlans((prevPlans) =>
      prevPlans.map((plan, i) => (i === index ? updatedPlan : plan))
    );
  };

  return (
    <div className="pt-8 bg-background">
      <WelcomeCard onStartLearning={handleStartLearning} />

      <DetailInputDialog
        isOpen={isLearningDialogOpen}
        onClose={() => setIsLearningDialogOpen(false)}
        onSubmit={handleLearningSubmit}
        onGeneratePlan={handleGeneratePlan}
        onForward={() => {
          setIsLearningDialogOpen(false);
          setIsLessonPlanDialogOpen(true);
        }}
        isGeneratingPlan={isGeneratingPlan}
        createLessonPlansMutation={createLessonPlansMutation}
        level={level}
        setLevel={setLevel}
        goal={goal}
        setGoal={setGoal}
        dailyStudyTime={dailyStudyTime}
        setDailyStudyTime={setDailyStudyTime}
      />

      <PlanSelectorDialog
        isOpen={isLessonPlanDialogOpen}
        onClose={() => setIsLessonPlanDialogOpen(false)}
        onBack={() => {
          setIsLessonPlanDialogOpen(false);
          setIsLearningDialogOpen(true);
        }}
        onEdit={handleEditPlan}
        onSelect={startCourseButton}
        lessonPlans={generatedLessonPlans}
        isStartingCourse={isStartingCourse}
      />
    </div>
  );
};

export default HomePage;
