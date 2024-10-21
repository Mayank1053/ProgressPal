import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const PlanSelectorDialog = ({
  isOpen,
  onClose,
  onBack,
  onEdit,
  onSelect,
  lessonPlans,
  isStartingCourse,
}) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [editingPlanIndex, setEditingPlanIndex] = useState(null);
  const [editedPlan, setEditedPlan] = useState(null);

  const handleSelectPlan = () => {
    if (selectedPlanIndex !== null) {
      onSelect(lessonPlans[selectedPlanIndex]);
    }
  };

  const handleEditPlan = (index) => {
    setEditingPlanIndex(index);
    setEditedPlan(JSON.parse(JSON.stringify(lessonPlans[index])));
  };

  const handleSaveEdit = () => {
    onEdit(editingPlanIndex, editedPlan);
    setEditingPlanIndex(null);
    setEditedPlan(null);
  };

  const handleCancelEdit = () => {
    setEditingPlanIndex(null);
    setEditedPlan(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogDescription></DialogDescription>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Select a Lesson Plan</DialogTitle>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-180px)] pr-4">
          <RadioGroup
            onValueChange={(value) => setSelectedPlanIndex(Number(value))}
            className="space-y-4"
          >
            {lessonPlans.map((plan, index) => (
              <Card
                key={index}
                className={selectedPlanIndex === index ? "border-primary" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`plan-${index}`}
                    />
                    <div className="flex items-center space-x-2">
                      {editingPlanIndex === index ? (
                        <Input
                          value={editedPlan.Title}
                          onChange={(e) =>
                            setEditedPlan({
                              ...editedPlan,
                              Title: e.target.value,
                            })
                          }
                          className="w-full sm:w-auto mt-2 sm:mt-0"
                        />
                      ) : (
                        <Label htmlFor={`plan-${index}`}>{plan.Title}</Label>
                      )}
                    </div>
                    {editingPlanIndex === index ? (
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="w-full sm:w-auto"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPlan(index)}
                        className="mt-2 sm:mt-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingPlanIndex === index ? (
                    <Textarea
                      value={JSON.stringify(editedPlan.Plan, null, 2)}
                      onChange={(e) =>
                        setEditedPlan({
                          ...editedPlan,
                          Plan: JSON.parse(e.target.value),
                        })
                      }
                      rows={10}
                    />
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {plan.Plan.map((day, dayIndex) => (
                        <li key={dayIndex}>{day.topic}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={handleSelectPlan}
            disabled={selectedPlanIndex === null || isStartingCourse}
          >
            {isStartingCourse ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isStartingCourse ? "Starting Course..." : "Select a Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectorDialog;
