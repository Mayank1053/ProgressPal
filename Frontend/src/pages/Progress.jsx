import {React, useState, useEffect }from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getProgress } from "@/lib/api";


// Mock data for the chart
const mockDailyProgress = [
  { day: 1, score: 3 },
  { day: 2, score: 4 },
  { day: 3, score: 2 },
  { day: 4, score: 5 },
  { day: 5, score: 1 },
  { day: 6, score: 4 },
  { day: 7, score: 3 },
];

const ProgressPage = () => {

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [dailyProgress, setDailyProgress] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getProgress();
        console.log("Progress data:", response.data);
        setProgressPercentage(response.data.overall_progress);
        setDailyProgress(response.data.daily_progress);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="bg-background text-foreground p-4">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl mb-2">
            You've completed {progressPercentage}% of the course
          </h2>
          <Progress value={progressPercentage} className="h-2 mb-4" />
          <p className="text-muted-foreground">
            Keep it up! You're making great progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily test results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;