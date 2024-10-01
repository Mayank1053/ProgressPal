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
  const { title, level, goal, dailyStudyTime } = req.body;

  if (!title || !level || !goal || !dailyStudyTime) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  const prompt = `I want to learn: ${title} to the: ${level} level, my goal is to: ${goal}, and I can spend daily: ${dailyStudyTime} on learning it.`;

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

  const lesson = await Course.create({
    title: FinalPlan.Title,
    user: req.user._id,
    level,
    goal,
    daily_study_time: dailyStudyTime,
    lessonPlan: lessonPlan._id,
    start_date: startDate,
  });

  const user = await User.findById(req.user._id);
  user.Courses.current_courses.push(lesson._id);
  await user.save();

  lessonPlan.planText = JSON.stringify(FinalPlan);

  // Add dates to all the subtopics for a daily reminder
  let currentDate = new Date(startDate);
  lessonPlan.topics.forEach((topic) => {
    topic.subtopics.forEach((subtopic) => {
      subtopic.date = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    });
  });

  // Mark the subtopics as modified
  lessonPlan.markModified("topics");

  await lessonPlan.save();

  // Add userId & courseId to progress model
  await Progress.create({
    user: req.user._id,
    course: lesson._id,
  });

  // Generate the content for the first subtopic
  await generateContent(lessonPlan._id, new Date());

  return res
    .status(200)
    .json(new ApiResponse(200, lesson, "Course started successfully"));
});

const getLessons = asyncHandler(async (req, res) => {
  // Get all the lessons of the user
  const user = await User.findById(req.user._id).populate("lessons");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const lessons = user.lessons;

  // Error handling
  if (!lessons) {
    throw new ApiError(404, "No lessons found for the user");
  }

  // Empty lessons
  if (lessons.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No lessons found for the user"));
  }

  // Send the lessons in the response
  return res
    .status(200)
    .json(new ApiResponse(200, lessons, "Lessons fetched successfully"));
});

const getLessonPlan = asyncHandler(async (req, res) => {
  // Get the lesson plan id from the request
  const lessonPlanId = req.params.id;

  // Get the lesson plan from the database
  const lessonPlan = await LessonPlan.findById(lessonPlanId);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson plan not found");
  }

  // Send the lesson plan in the response
  return res
    .status(200)
    .json(new ApiResponse(200, lessonPlan, "Lesson plan fetched successfully"));
});

const getLessonContent = asyncHandler(async (req, res) => {
  // Get the lesson plan id and Subtopic from the request
  const { lessonPlanId, subtopic } = req.params;
  
  // Get the lesson plan from the database
  const lessonPlan = await LessonPlan.findById(lessonPlanId);
  
  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson plan not found");
  }

  // Get the contents, objectives, and content of the subtopic
  const { contents, objectives, content } = lessonPlan.topics
    .map((topic) => topic.subtopics)
    .flat()
    .find((sub) => sub.title === subtopic).lessonContent;

  // Send the content in the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, { contents, objectives, content }, "Content fetched successfully")
    );
});

export {
  createLessonPlans,
  startCourse,
  getLessons,
  getLessonPlan,
  getLessonContent,
};
