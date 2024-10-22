import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
// import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateContent } from "../services/generateContent.js";

const markTopicComplete = asyncHandler(async (req, res) => {
  // Get the subtopic(string) from the request
  const data = req.body;
  const { lessonPlanId, subtopicIndex } = data;
  /*
  subtopicIndex: [0,1] => [topicIndex, subtopicIndex]
  */

  // Get the lesson plan from the database
  const lessonPlan = await LessonPlan.findById(lessonPlanId);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson Plan not found");
  }

  // Find the subtopic in the lesson plan and mark it as completed
  const [index, subIndex] = subtopicIndex;

  // check if the subtopic is already completed
  if (lessonPlan.topics[index].subtopics[subIndex].completed) {
    // Skip if the subtopic is already completed
    return res.json(new ApiResponse(200, {}, "Subtopic already completed"));
  } else {
    // Mark the subtopic as completed
    lessonPlan.topics[index].subtopics[subIndex].completed = true;

    // Save the lesson plan
    await LessonPlan.findByIdAndUpdate(lessonPlanId, lessonPlan);

    // Get the total number of subtopics
    const totalSubtopics = lessonPlan.topics
      .map((topic) => topic.subtopics)
      .flat().length;

    // Get the number of completed subtopics
    const completedSubtopics = lessonPlan.topics
      .map((topic) => topic.subtopics)
      .flat()
      .filter((subtopic) => subtopic.completed).length;

    // Calculate the progress percentage
    const progressPercentage =
      Math.round((completedSubtopics / totalSubtopics) * 1000) / 10;

    // Get the next indexes with checking if the subtopic is the last subtopic in any topic or the last subtopic in the last topic.
    // If the subtopic is the last subtopic in any topic, then the next subtopic will be the first subtopic of the next topic
    // If the subtopic is the last subtopic in the last topic, then the course is completed
    if (subIndex === lessonPlan.topics[index].subtopics.length - 1) {
      if (index === lessonPlan.topics.length - 1) {
        // If the subtopic is the last subtopic in the last topic, then the course is completed
        await Progress.findOneAndUpdate(
          { lessonPlan: lessonPlanId },
          { progress: 100 }
        );

        // Update the progress in the course model
        await Course.findOneAndUpdate(
          { lessonPlan: lessonPlanId },
          { progress: 100 }
        );

        return res.json(
          new ApiResponse(200, lessonPlan, "Course marked as completed")
        );
      } else {
        // Move to the first subtopic of the next topic
        await generateContent(lessonPlanId, [index + 1, 0]);
      }
    } else {
      // Generate the content for the next subtopic by calling the generateContent service function by passing the lessonPlan id and the next subtopic index
      await generateContent(lessonPlanId, [index, subIndex + 1]);
    }

    await Progress.findOneAndUpdate(
      {
        lessonPlan: lessonPlanId,
      },
      {
        progress: progressPercentage,
      }
    );

    // update the progress in the course model
    await Course.findOneAndUpdate(
      { lessonPlan: lessonPlanId },
      {
        progress: progressPercentage,
      }
    );

    res.json(new ApiResponse(200, lessonPlan, "Subtopic marked as completed"));
  }
});

const getProgress = asyncHandler(async (req, res) => {
  // Get the user id from the request
  const userId = req.user._id;

  // Get the progress from the database
  const progress = await Progress.findOne({ user: userId });

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
