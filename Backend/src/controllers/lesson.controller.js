import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Lesson from "../models/lesson.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateLessonPlan } from "../services/generativeAI.service.js";

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
  // Get the Final edited plan and start data from req.body, save the plan in database then create a lesson and also add lesson to user model
  // 1. Get Final & edited Plan and start data from body
  const { FinalPlan, startDate, level, goal, dailyStudyTime } = req.body;

  // 2. Create a lesson object with the data
  const lessonPlan = await LessonPlan.create({
    topics: FinalPlan.Plan,
    subtopics: [FinalPlan.Plan.subtopics],
  });

  // 3. Create a lesson object with the data
  const lesson = await Lesson.create({
    title: FinalPlan.Title,
    user: req.user._id,
    level,
    goal,
    daily_study_time: dailyStudyTime,
    lessonPlan: lessonPlan._id,
    start_date: startDate,
    progress: 0,
  });

  // 4. Add the lesson to the user model
  const user = await User.findById(req.user._id);
  user.lessons.current_lessons.push(lesson._id);
  await user.save();

  // 5. Send the lesson object in the response
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

const getLesson = asyncHandler(async (req, res) => {
  // Get the lesson id from the request
  const { lessonId } = req.params;

  // Get the lesson from the database
  const lesson = await Lesson.findById(lessonId);

  // Error handling
  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  // Send the lesson in the response
  return res
    .status(200)
    .json(new ApiResponse(200, lesson, "Lesson fetched successfully"));
});

export { createLessonPlans, startCourse, getLessons, getLesson };
