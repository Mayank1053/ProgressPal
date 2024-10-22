import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateLessonPlan } from "../services/generativeAI.service.js";
import { generateContent } from "../services/generateContent.js";

const createLessonPlans = asyncHandler(async (req, res) => {
  const { topic, level, goal, dailyStudyTime } = req.body;

  if (!topic || !level || !goal || !dailyStudyTime) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  const prompt = `I want to learn: ${topic} to the: ${level} level, my goal is to: ${goal}, and I can spend daily: ${dailyStudyTime} on learning it.`;

  const GenAIPlan = await generateLessonPlan(prompt);

  return res
    .status(201)
    .json(new ApiResponse(201, GenAIPlan, "Lesson plan created successfully"));
});

const startCourse = asyncHandler(async (req, res) => {
  const { FinalPlan, startDate, level, goal, dailyStudyTime } = req.body;

  const lessonPlan = await LessonPlan.create({
    topics: FinalPlan.Plan,
    subtopics: [FinalPlan.Plan.subtopics],
  });

  const course = await Course.create({
    title: FinalPlan.Title,
    user: req.user._id,
    level,
    goal,
    daily_study_time: dailyStudyTime,
    isCompleted: false,
    lessonPlan: lessonPlan._id,
    progress: 0,
    start_date: startDate,
  });

  // Find the user and add the course to the user's courses
  await User.findByIdAndUpdate(req.user._id, {
    $push: { courses: course._id },
  });

  lessonPlan.planText = JSON.stringify(FinalPlan);

  // Add dates to all the subtopics for a daily reminder
  let currentDate = new Date(startDate);
  lessonPlan.topics.forEach((topic) => {
    topic.subtopics.forEach((subtopic) => {
      subtopic.date = new Date(currentDate.setHours(0, 0, 0, 0)); // Set time to 00:00:00
      currentDate.setDate(currentDate.getDate() + 1);
      subtopic.completed = false;
    });
  });

  // Mark the subtopics as modified
  lessonPlan.markModified("topics");

  await lessonPlan.save();

  // Add userId & courseId to progress model
  await Progress.create({
    user: req.user._id,
    lessonPlan: lessonPlan._id,
    overall_progress: 0,
  });

  // Generate the content for the first subtopic
  await generateContent(lessonPlan._id, [0, 0]);

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course started successfully"));
});

// Get course/courses data using courseId
const getCoursesData = asyncHandler(async (req, res) => {
  const courseIds = req.body;
  // console.log("courseIds: ",courseIds);
  //CourseIds: [
  //   "67150987dc4f77b5336ecd75",
  //   "67156eebbaf9b72288af766c",
  //   "6714f0693b12dd76946322cd",
  // ];
  if (!courseIds) {
    throw new ApiError(400, "Please provide course ids");
  }

  const courses = await Course.find({ _id: { $in: courseIds } });

  if (!courses) {
    throw new ApiError(404, "Courses not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Course fetched successfully"));
});

const getLessonPlan = asyncHandler(async (req, res) => {
  // Get the Course id from the request
  const { courseId } = req.params;

  // Check if the course exists in the database
  const course = await Course.findById(courseId);

  // Check if the course is accessible by the user
  if (!course.user.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to access this course");
  }

  // Error handling
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Get the lesson plan of the course
  const lessonPlan = await LessonPlan.findById(course.lessonPlan);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson plan not found");
  }

  // Send the lesson plan in the response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        title: course.title,
        lessonPlan,
      },
      "Lesson plan fetched successfully"
    )
  );
});

export { createLessonPlans, startCourse, getCoursesData, getLessonPlan };
