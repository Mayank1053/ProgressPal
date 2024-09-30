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
  // check if the subtopic is already completed
  if (lessonPlan.topics[topicIndex].subtopics[subtopicIndex].completed) {
    // Skip the process if the subtopic is already completed
    return res.json(
      new ApiResponse(200, lessonPlan, "Subtopic already completed")
    );
  } else {
    lessonPlan.topics[topicIndex].subtopics[subtopicIndex].completed = true;
    // save the lesson plan
    await lessonPlan.findByIdAndUpdate(lessonPlanId, lessonPlan);

    // Generate the content for the next subtopic by calling the generateContent service function by passing the lessonPlan id and the next days date
    await generateContent(lessonPlanId, new Date());

    // Set the overall progress of the user
    await setOverallProgress(req.user._id);

    res.json(new ApiResponse(200, lessonPlan, "Subtopic marked as completed"));
  }
});

const setOverallProgress = async (userId) => {
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

  // Get the courses from the user model and the progress model and compare them to get the overall progress
  const userCourses = user.Courses.current_courses;
  const userProgress = progress.overall_progress;

  // Initialize the overall progress
  let overallProgress = [];

  // Loop through the courses and get the progress of each course
  for (let i = 0; i < userCourses.length; i++) {
    const course = userCourses[i];
    const courseProgress = userProgress[i];

    // Get the lesson plan from the database
    const lessonPlan = await LessonPlan.findById(course.lesson_plan);

    // Error handling
    if (!lessonPlan) {
      throw new ApiError(404, "Lesson Plan not found");
    }

    // Get the topics from the lesson plan
    const topics = lessonPlan.topics;

    // Initialize the total subtopics and completed subtopics
    let totalSubtopics = 0;
    let completedSubtopics = 0;

    // Loop through the topics and get the total and completed subtopics
    for (let j = 0; j < topics.length; j++) {
      const subtopics = topics[j].subtopics;
      totalSubtopics += subtopics.length;
      for (let k = 0; k < subtopics.length; k++) {
        if (subtopics[k].completed) {
          completedSubtopics++;
        }
      }
    }

    // Calculate the progress of the course
    courseProgress = (completedSubtopics / totalSubtopics) * 100;

    // Push the progress of the course to the overall progress array
    overallProgress.push(courseProgress);
  }

  // Update the overall progress in the progress model
  progress.overall_progress = overallProgress;

  // Save the progress
  await progress.save();
};

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
