import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const LessonPlans = () => {
  const plans = [
    {
      title: "Daily Spanish Lessons",
      level: "Beginner",
      duration: "30 days",
      time: "10 minutes per day",
    },
    {
      title: "Art History 101",
      level: "Intermediate",
      duration: "15 days",
      time: "15 minutes per day",
    },
    {
      title: "Master Algebra in 20 Days",
      level: "Advanced",
      duration: "20 days",
      time: "20 minutes per day",
    },
  ];

  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Lesson Plans</h3>
      <div className="space-y-6">
        {plans.map((plan) => (
          <Card key={plan.title}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {plan.level}
                </p>
                <h4 className="text-xl font-semibold mb-2">{plan.title}</h4>
                <p className="text-muted-foreground">
                  Spend {plan.time} to improve your skills. In {plan.duration},
                  you will be able to have a basic understanding.
                </p>
              </div>
              <Button variant="outline">Select</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
