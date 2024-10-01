import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateContent } from "../services/generateContent.js";

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
  // check if the subtopic is already completed
  if (lessonPlan.topics[topicIndex].subtopics[subtopicIndex].completed) {
    // Skip if the subtopic is already completed
    return res.json(new ApiResponse(200, {}, "Subtopic already completed"));
  } else {
    // Mark the subtopic as completed
    lessonPlan.topics[topicIndex].subtopics[subtopicIndex].completed = true;

    // Save the lesson plan
    await LessonPlan.findByIdAndUpdate(lessonPlanId, lessonPlan);

    // Generate the content for the next subtopic by calling the generateContent service function by passing the lessonPlan id and the next days date
    await generateContent(lessonPlanId, new Date());

    // Set the overall progress of the user
    await setOverallProgress(req.user._id, lessonPlanId);

    res.json(new ApiResponse(200, lessonPlan, "Subtopic marked as completed"));
  }
});

const setOverallProgress = async (userId, lessonPlanId) => {
  // Get the user from the database
  const user = await User.findById(userId);

  // Error handling
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get the progress from the progress model
  const progress = await Progress.findOne({ user: userId });

  // Error handling
  if (!progress) {
    throw new ApiError(404, "Progress not found");
  }

  // Get the lesson plan from the database
  const lessonPlan = await LessonPlan.findById(lessonPlanId);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson Plan not found");
  }

  // Get the total number of subtopics
  const totalSubtopics = lessonPlan.topics
    .map((topic) => topic.subtopics)
    .flat().length;

  // Get the number of completed subtopics
  const completedSubtopics = lessonPlan.topics
    .map((topic) => topic.subtopics)
    .flat()
    .filter((subtopic) => subtopic.completed).length;

  // Calculate & update the overall progress 
  progress.overall_progress = (completedSubtopics / totalSubtopics) * 100;

  // markModified
  progress.markModified("overall_progress");

  // if the overall progress is 100% then move the course to the completed courses array in the user model
  if (progress.overall_progress === 100) {
    // Remove the course from the current_courses array
    user.Courses.current_courses = user.Courses.current_courses.filter(
      (course) => course !== lessonPlanId
    );

    // Add the course to the completed courses array
    user.Courses.completed_courses.push(lessonPlanId);

    // markModified
    user.markModified("User.Courses");
    
    // Save the user
    await user.save();
  }

  // Save the progress
  await progress.save();
};

const getProgress = asyncHandler(async (req, res) => {
  // Get the user id from the request
  const userId = req.user._id;

  // Get the progress from the database
  const progress = await Progress.findOne({ user : userId });

  // Error handling
  if (!progress) {
    throw new ApiError(404, "Progress not found");
  }

  // Get the user daily progress, overall progress and return it
  const userProgress = {
    course: progress.course,
    daily_progress: progress.daily_progress,
    overall_progress: progress.overall_progress,
  };

  console.log(userProgress);
  

  // Return the response
  res.json(new ApiResponse(200, userProgress, "User Progress Data"));
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
