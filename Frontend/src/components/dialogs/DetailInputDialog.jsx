import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Forward } from "lucide-react";

export const DetailInputDialog = ({
  isOpen,
  onClose,
  onGeneratePlan,
  onForward: GotoPlanSelector,
  isGeneratingPlan,
  createLessonPlansMutation,
  isCreatingLessonPlan,
  level,
  setLevel,
  goal,
  setGoal,
  dailyStudyTime,
  setDailyStudyTime,
}) => {
  const [topic, setTopic] = useState("");

  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!topic) newErrors.topic = "Topic is required";
    if (!goal) newErrors.goal = "Goal is required";
    if (!dailyStudyTime)
      newErrors.dailyStudyTime = "Daily Study Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    onGeneratePlan();
    createLessonPlansMutation({
      topic,
      level,
      goal,
      dailyStudyTime,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>What do you want to learn?</DialogTitle>
          <DialogDescription>
            Fill in the details about your learning goals.
            <Button variant="ghost" size="icon" onClick={GotoPlanSelector}>
              <Forward className="h-4 w-4" />
            </Button>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Topic
              </Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="col-span-3"
              />
              {errors.topic && (
                <p className="col-span-4 text-red-500">{errors.topic}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Level
              </Label>
              <div className="col-span-3">
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal
              </Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="col-span-3"
              />
              {errors.goal && (
                <p className="col-span-4 text-red-500">{errors.goal}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dailyStudyTime" className="text-right">
                Daily Study Time
              </Label>
              <Input
                id="dailyStudyTime"
                value={dailyStudyTime}
                onChange={(e) => setDailyStudyTime(e.target.value)}
                placeholder="e.g., 1 hr"
                className="col-span-3"
              />
              {errors.dailyStudyTime && (
                <p className="col-span-4 text-red-500">
                  {errors.dailyStudyTime}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isGeneratingPlan || isCreatingLessonPlan}
            >
              {isGeneratingPlan || isCreatingLessonPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
