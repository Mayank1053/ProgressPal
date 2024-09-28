import ApiError from "../utils/ApiError.js";
import Course from "../models/course.model";
import LessonPlan from "../models/LessonPlan.model.js";
import LessonContent from "../models/LessonContent.model";
import { generateLessonContent } from "../services/generativeAI.service.js";

const generateContent = async (lessonPlanId, date) => {
  // Get the title, level, goal, and daily study time from the course object based on the lesson plan id
  const course = await Course.findOne({ lessonPlan: lessonPlanId });

  // Error handling
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Get the title, level, goal, and daily study time from the course object
  const { title, level, goal, daily_study_time } = course;

  // Get the topics title and subtopics title from the lesson plan object
  const lessonPlan = await LessonPlan.findById(lessonPlanId);

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson plan not found");
  }

  // Get the subtopic title based on the date provided
  const subtopic = lessonPlan.topics
    .map((topic) => topic.subtopics)
    .flat()
    .find((subtopic) => subtopic.date === date);

  // Error handling
  if (!subtopic) {
    throw new ApiError(404, "Subtopic not found");
  }

  // Get the topics title and subtopics title from the lesson plan object and store them in a lesson_Plan(systemPrompt) object with proper structure for the generative AI service
  const systemPrompt = {
    Title: title,
    level,
    goal,
    daily_study_time,
    Plan: lessonPlan.topics.map((topic) => ({
      topic: topic.title,
      subtopics: topic.subtopics.map((subtopic) => ({
        title: subtopic.title,
      })),
    })),
  };

  // Stringify the system prompt
  const stringifySystemPrompt = JSON.stringify(systemPrompt);

  // Create a new lesson content object
  const newLessonContent = new LessonContent({
    lessonPlan: stringifySystemPrompt,
  });

  console.log(systemPrompt);

  // Generate the prompt for the generative AI service based on the subtopic
  const prompt = `Generate content for the subtopic: ${subtopic} based on the lessonPlan`;

  // Generate the lesson content based on the lesson plan and course data
  const lessonContent = await generateLessonContent(systemPrompt, prompt);

  // Update the lesson content object with the generated content
  newLessonContent.content = lessonContent;

  // Save the updated lesson content object
  await newLessonContent.save();

  return newLessonContent;
};

export { generateContent };

