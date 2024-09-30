import ApiError from "../utils/ApiError.js";
import Course from "../models/course.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateLessonContent } from "../services/generativeAI.service.js";

const generateContent = async (lessonPlanId, date) => {
  // Get the title, level, goal, and daily study time from the course object based on the lesson plan id
  console.log("lessonPlanId: ", lessonPlanId); // lessonPlanId:  new ObjectId('66f9962bd60e6f8e395a816f')
  console.log("date: ", date); // date:  2024-09-29T18:02:19.453Z
  new Date(date.setDate(date.getDate() + 1));
  

  // Find the course based on the lesson plan id
  const course = await Course.findOne({
    lessonPlan: lessonPlanId,
  });

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
    .find(
      (subtopic) =>
        new Date(subtopic.date).toDateString() === date.toDateString()
    );

  console.log("subtopic: ", subtopic);

  // Error handling
  if (!subtopic) {
    throw new ApiError(404, "Subtopic not found");
  }

  // Get lessonPlan from lessonContent

  // Get the topics title and subtopics title from the lesson plan object and store them in a lesson_Plan(systemPrompt) object with proper structure for the generative AI service
  const systemPrompt = {
    Title: title,
    level,
    goal,
    daily_study_time,
    Plan: lessonPlan.planText,
  };

  // Stringify the system prompt
  const stringifySystemPrompt = JSON.stringify(systemPrompt);

  console.log("systemPrompt: ", systemPrompt);

  // Generate the prompt for the generative AI service based on the subtopic
  const prompt = `Generate content for the subtopic: ${subtopic.title} based on the lessonPlan`;

  // Generate the lesson content based on the lesson plan and course data
  const lessonContent = await generateLessonContent(
    stringifySystemPrompt,
    prompt
  );

  console.log("lessonContent: ", lessonContent);

  // Update the subtopic content object with the generated content
  subtopic.lessonContent = lessonContent;

  lessonPlan.markModified("topics");

  // Save the updated lesson plan
  await lessonPlan.save();

  return lessonContent;
};

export { generateContent };
