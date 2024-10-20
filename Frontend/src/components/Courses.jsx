import { React, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Book, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { getLessonPlan } from "@/lib/api"; // Updated to fetch multiple lesson plans

export function CoursesPage() {
  const { user } = useAuth();
  const { current_courses, completed_courses } = user.Courses;
  const [courseData, setCourseData] = useState(null);

  const { mutate: getLessonPlansMutation } = useMutation({
    mutationFn: getLessonPlan, // Updated to fetch multiple lesson plans
    onSuccess: (data) => {
      console.log("Course data:", data);
      setCourseData(data.data);
    },
  });

  const navigate = useNavigate();

  const loadCourses = useCallback(
    (courseIds) => {
      getLessonPlansMutation(courseIds);
    },
    [getLessonPlansMutation]
  );

  useEffect(() => {
    if (courseData) {
      navigate(`/courses/${courseData._id}`, { state: { courseData } });
    }
  }, [courseData, navigate]);

  const CourseCard = ({ course, isCompleted }) => (
    <Card
      className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => loadCourses([course.courseId])} // Updated to handle multiple course IDs
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            {course.title}
          </span>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className=" bg-background text-foreground p-4">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="current">Current Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          {current_courses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              isCompleted={false}
            />
          ))}
        </TabsContent>
        <TabsContent value="completed">
          {completed_courses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              isCompleted={true}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
