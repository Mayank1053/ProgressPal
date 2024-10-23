import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";
import { getCourses } from "@/lib/api";
/*
getCourses req.body: ["6714f0693b12dd76946322cd","67150987dc4f77b5336ecd75","67156eebbaf9b72288af766c"]
getCourses Response: {
    "statusCode": 200,
    "data": [
        {
            "isCompleted": false,
            "progress": 0,
            "_id": "6714f0693b12dd76946322cd",
            "title": "Beginner's Guide to Fantasy Novel Writing",
            "user": "66caf42f165e76696ef5c461",
            "level": "Beginner",
            "goal": "To become a better fantasy book writer",
            "daily_study_time": "1 hr",
            "lessonPlan": "6714f0683b12dd76946322cb",
            "start_date": "2024-10-20T11:58:32.914Z",
            "createdAt": "2024-10-20T11:58:33.019Z",
            "updatedAt": "2024-10-20T11:58:33.019Z",
            "__v": 0
        },
        {
            "isCompleted": false,
            "progress": 0,
            "_id": "67150987dc4f77b5336ecd75",
            "title": "Beginner's Guide to Fantasy Novel Writing",
            "user": "66caf42f165e76696ef5c461",
            "level": "Beginner",
            "goal": "To become a better fantasy book writer.",
            "daily_study_time": "1 hr",
            "lessonPlan": "67150987dc4f77b5336ecd73",
            "start_date": "2024-10-20T13:45:42.970Z",
            "createdAt": "2024-10-20T13:45:43.048Z",
            "updatedAt": "2024-10-20T13:45:43.048Z",
            "__v": 0
        },
        {
            "isCompleted": false,
            "_id": "67156eebbaf9b72288af766c",
            "title": "Beginner Novel Writing: Mythological Storytelling",
            "user": "66caf42f165e76696ef5c461",
            "level": "Beginner",
            "goal": "To become a better mythological writer.",
            "daily_study_time": "1 hr",
            "lessonPlan": "67156eeabaf9b72288af766a",
            "start_date": "2024-10-20T20:58:18.929Z",
            "progress": 0,
            "createdAt": "2024-10-20T20:58:19.016Z",
            "updatedAt": "2024-10-20T20:58:19.016Z",
            "__v": 0
        }
    ],
    "message": "Course fetched successfully",
    "success": true
}
*/

export function CoursesPage() {
  const { user } = useAuth();
  const courses = user.courses;
  /*
  User: {
    "_id": "66caf42f165e76696ef5c461",
    "fullName": "Mayank Sahu",
    "email": "thegod@gmail.com",
    "createdAt": "2024-08-25T09:06:55.286Z",
    "updatedAt": "2024-10-21T10:13:22.649Z",
    "__v": 43,
    "verified": false,
    "courses": [
        "671627060945f8e637bb512e",
        "671629420945f8e637bb513f"
    ]
}
  */
  const navigate = useNavigate();
  const [currentCourses, setCurrentCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses(courses);
        console.log("Courses:", response.data);
        setCurrentCourses(
          response.data.filter((course) => !course.isCompleted)
        );
        setCompletedCourses(
          response.data.filter((course) => course.isCompleted)
        );
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, [courses]);

  const loadCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const CourseCard = ({ course, isCompleted }) => (
    <Card
      className="mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => loadCourse(course._id)}
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
          <span className="text-sm font-medium">{course.lessonProgress}%</span>
        </div>
        <Progress value={course.lessonProgress} className="w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-background text-foreground p-4">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="current">Current Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          {currentCourses.map((course) => (
            <CourseCard key={course._id} course={course} isCompleted={false} />
          ))}
        </TabsContent>
        <TabsContent value="completed">
          {completedCourses.map((course) => (
            <CourseCard key={course._id} course={course} isCompleted={true} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
