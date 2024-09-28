import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateContent } from "./course.controller.js";

const markTopicComplete = asyncHandler(async (req, res) => {
  // Get the subtopic(string) from the request
  const { lessonPlanId, subtopic } = req.params;

  // Get the lesson plan from the database
  const lessonPlan = await LessonPlan.findById(lessonPlanId);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson Plan not found");
  }

  // Find the topic that contains the subtopic
  let subtopicIndex = -1;
  let topicIndex = -1;

  for (let i = 0; i < lessonPlan.topics.length; i++) {
    const subtopics = lessonPlan.topics[i].subtopics;
    const index = subtopics.findIndex((sub) => sub.title === subtopic);
    if (index !== -1) {
      subtopicIndex = index;
      topicIndex = i;
      break;
    }
  }

  // Error handling
  if (topicIndex === -1) {
    console.error("Topic containing the subtopic not found");
    throw new ApiError(404, "Topic containing the subtopic not found");
  }

  // Error handling
  if (subtopicIndex === -1) {
    console.error("Subtopic not found");
    throw new ApiError(404, "Subtopic not found");
  }

  // Mark the subtopic as completed
  lessonPlan.topics[topicIndex].subtopics[subtopicIndex].completed = true;
  // // Update the start date of the subtopic
  // lessonPlan.topics[topicIndex].subtopics[subtopicIndex].start_date = new Date();
  // Update the end date of the subtopic
  lessonPlan.topics[topicIndex].subtopics[subtopicIndex].end_date = new Date();

  // Save the lesson plan
  await LessonPlan.findByIdAndUpdate(lessonPlanId, lessonPlan);

  // Generate the content for the next subtopic by calling the generateContent service function by passing the lessonPlan id and the next days date
  await generateContent(lessonPlanId, new Date() + 1);

  res.json(new ApiResponse(200, lessonPlan, "Subtopic marked as completed"));
});

const getProgress = asyncHandler(async (req, res) => {
  // Get the user id from the request
  const userId = req.user._id;

  // Get the user from the database
  const user = await User.findById(userId);

  // Error handling
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get progress from the user model
  const userProgress = user.progress;

  // Return the response
  res.json(new ApiResponse(200, userProgress, "User Progress"));
});

const getLessonProgress = asyncHandler(async (req, res) => {
  // Get the lesson id from the request
  const { lessonId } = req.params;

  // Get the lesson from the database
  const lesson = await Course.findById(lessonId);

  // Error handling
  if (!lesson) {
    throw new ApiError(404, "Course Not found");
  }

  // Get the progress from the lesson
  const progress = lesson.progress;

  // Return the response
  res.json(new ApiResponse(200, progress, "Lesson Progress"));
});

export { markTopicComplete, getProgress, getLessonProgress };
