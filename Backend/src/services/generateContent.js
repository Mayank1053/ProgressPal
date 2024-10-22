import ApiError from "../utils/ApiError.js";
import Course from "../models/course.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import { generateLessonContent } from "../services/generativeAI.service.js";
import KnowledgeCheck from "../models/knowledgeCheck.model.js";

const generateContent = async (lessonPlanId, Indexes) => {
  // Get the title, level, goal, and daily study time from the course object based on the lesson plan id
  console.log("lessonPlanId: ", lessonPlanId); // lessonPlanId:  new ObjectId('66f9962bd60e6f8e395a816f')
  console.log("subtopicIndex: ", Indexes); // [0 0] => [topicIndex, subtopicIndex]

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
  
  /*
  lessonPlan:
  {
  "topics": [
    {
      "subtopics": [
        {
          "title": "Basic Greetings & Introductions: Learn to say hello, goodbye, and introduce yourself in French.",
          "date": {
            "$date": "2024-10-20T18:30:00Z"
          },
          "completed": false,
        },
        {
          "title": "Numbers 1-10: Practice counting from one to ten in French.",
          "date": {
            "$date": "2024-10-21T18:30:00Z"
          },
          "completed": false
        },
        {
          "title": "Days of the Week: Recognize and pronounce the days of the week in French.",
          "date": {
            "$date": "2024-10-22T18:30:00Z"
          },
          "completed": false
        },
        {
          "title": "Simple Questions: Learn how to ask basic questions like 'How are you?' and 'What is your name?'",
          "date": {
            "$date": "2024-10-23T18:30:00Z"
          },
          "completed": false
        }
      ],
      "topic": "Getting Started with French: Essentials for Beginners"
    },
    {
      "subtopics": [
        {
          "title": "Basic Verbs: Learn common verbs like 'to be', 'to have', and 'to want' in present tense.",
          "date": {
            "$date": "2024-10-24T18:30:00Z"
          },
          "completed": false
        },
        {
          "title": "Simple Sentences: Construct basic sentences using the learned verbs and vocabulary.",
          "date": {
            "$date": "2024-10-25T18:30:00Z"
          },
          "completed": false
        },
        {
          "title": "Basic Colors: Learn the names of common colors in French.",
          "date": {
            "$date": "2024-10-26T18:30:00Z"
          },
          "completed": false
        },
        {
          "title": "Polite Expressions: Expand your vocabulary with polite phrases like 'thank you' and 'please'.",
          "date": {
            "$date": "2024-10-27T18:30:00Z"
          },
          "completed": false
        }
      ],
      "topic": "Building a Foundation: Basic Verbs, Sentences, and Vocabulary"
    },
  }
  */

  // Error handling
  if (!lessonPlan) {
    throw new ApiError(404, "Lesson plan not found");
  }

  // Get topic and subtopic titles from the indexes
  const [topicIndex, subtopicIndex] = Indexes;

  // Get the topic and subtopic based on the indexes
  const topic = lessonPlan.topics[topicIndex];
  const subtopic = topic.subtopics[subtopicIndex];

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

  console.log("systemPrompt: ", stringifySystemPrompt);

  // Generate the prompt for the generative AI service based on the subtopic
  const prompt = `Generate content for the subtopic: ${subtopic.title} based on the lessonPlan`;

  // Generate the lesson content based on the lesson plan and course data
  const { lessonContent, questions } = await generateLessonContent(
    stringifySystemPrompt,
    prompt
  );

  console.log("lessonContent: ", lessonContent);
  console.log("quiz: ", questions);

  // find if the knowledgeCheck exist for this topic
  const knowledgeCheck = await KnowledgeCheck.findOne({
    lessonPlan: lessonPlanId,
    topic: topicIndex,
  });

  // if knowledgeCheck exist, add the questions to the knowledgeCheck
  if (knowledgeCheck) {
    knowledgeCheck.questions = questions; // this will add the new questions to the existing questions array
    await knowledgeCheck.save();
  } else {
    // if knowledgeCheck does not exist, create a new knowledgeCheck
    const knowledgeCheck = await KnowledgeCheck.create({
      lessonPlan: lessonPlanId,
      topic: topicIndex,
      questions,
    });
    console.log("knowledgeCheck: ", knowledgeCheck);
  }

  // add the knowledge check id to the lesson plan
  topic.quiz = knowledgeCheck._id;

  // Update the subtopic content object with the generated content
  subtopic.lessonContent = lessonContent;

  lessonPlan.markModified("topics");

  // Save the updated lesson plan
  await lessonPlan.save();

  return { lessonContent, questions };
};

export { generateContent };
