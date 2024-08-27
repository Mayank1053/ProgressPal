import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Lesson from "../models/lesson.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import LessonContent from "../models/lessonContent.model.js";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      Title: {
        type: "string",
      },
      Plan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topic: {
              type: "string",
            },
            subtopics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                },
                required: ["title"],
              },
            },
          },
          required: ["topic", "subtopics"],
        },
      },
    },
    required: ["Title", "Plan"],
  },
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-exp-0801",
  generationConfig,
  safetySettings,
  systemInstruction:
    "As an expert in educational content creation, your assignment is to craft three structured lesson plans in JSON format tailored to the user's specifications. The user will specify a learning topic, their target proficiency level (Beginner, Moderate, Advanced), the goal they want to achieve, and the amount of time they can allocate daily for study. /n Each lesson plan must encompass: /n - A 'Topic' field detailing the primary focus for the day. /n - A 'Subtopics' field listing the particular subtopics to be addressed. /n *Keep the daily 'study-time' in mind when structuring the daily topics and subtopics to ensure the lesson plan fits within the allocated time.* /n Every lesson plan should commence with foundational knowledge of the subject, irrespective of the proficiency level. The Beginner plan should offer a succinct introduction, the Moderate plan a more comprehensive guide, and the Advanced plan an in-depth analysis of the subject. The complexity and detail of each plan should correspond to the user's desired level of mastery. **IMPORTANT NOTE:** /n - Beginner-level plans must be structured for more than 7 days with daily time in mind. /n - Moderate-level plans must be structured for more than 10 days with daily time in mind. /n - Advanced-level plans must be structured for more than 14 days with daily time in mind.",
});

const generatePlan = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new GoogleGenerativeAIError(error.message);
  }
};

const createLessonPlans = asyncHandler(async (req, res) => {
  // 1. Get the topic, level & daily study time from the request
  const { title, level, goal, dailyStudyTime } = req.body;

  if (!title || !level || !goal || !dailyStudyTime) {
    throw new ApiError(400, "Please fill in all the required fields");
  }

  // 2. Generate the lesson plan using the Google Generative AI
  const prompt = `I want to learn: ${title} to the: ${level} level, my goal is to: ${goal}, and I can spend daily: ${dailyStudyTime} on learning it.`;

  // Generate the lesson plan
  const GenAIPlan = await generatePlan(prompt);

  // // 3. Create the lesson plan object with the data
  // const newLessonPlan = await LessonPlan.create({
  //   title: GenAIPlan.Title,
  //   level,
  //   goal,
  //   daily_study_time: dailyStudyTime,
  //   topics: GenAIPlan.Plan,
  // });

  //Send the lesson plan object in the response
  return res
    .status(201)
    .json(
      new ApiResponse(201, GenAIPlan , "Lesson plan created successfully")
    );
});

const startCourse = asyncHandler(async (req, res) => {
  // Get the Final edited plan and start data from req.body, save the plan in database then create a lesson and also add lesson to user model
  // 1. Get Final & edited Plan and start data from body
  const { FinalPlan, startDate, level, goal, dailyStudyTime } = req.body;

  // 2. Create a lesson object with the data
  const lessonPlan =  await LessonPlan.create({
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
  user.lessons.push(lesson._id);
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

export {
  createLessonPlans,
  startCourse,
  getLessons,
  getLesson,
};
