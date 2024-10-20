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

  // Update the user's courses with the new course
  user.Courses.current_courses.push({
    courseId: lesson._id,
    title: lesson.title,
    progress: 0,
  });

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

const getLessonPlan = asyncHandler(async (req, res) => {
  // Get the Course id from the request
  const { courseId } = req.params;

  // Check if the course exists in the database
  const course = await Course.findById(courseId);

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
        progress: course.progress,
        lessonPlan,
      },
      "Lesson plan fetched successfully"
    )
  );
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
      new ApiResponse(
        200,
        { contents, objectives, content },
        "Content fetched successfully"
      )
    );
});

export {
  createLessonPlans,
  startCourse,
  getLessonPlan,
  getLessonContent,
};
