import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const lessonPlanGenerationConfig = {
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
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
  },
  systemInstruction:
    "As an expert in educational content creation, your assignment is to craft structured lesson plans in JSON format tailored to the student's specifications. The student will specify a learning topic, their target proficiency level (Beginner, Moderate, Advanced), the goal they want to achieve, and the amount of time they can allocate daily for study. /n Each lesson plan must encompass: /n - A 'Topic' field detailing the primary focus for the day. /n - A 'Subtopics' field listing the particular subtopics to be addressed. /n *Keep the daily 'study-time' in mind when structuring the daily topics and subtopics to ensure the lesson plan fits within the allocated time.* /n Every lesson plan should commence with foundational knowledge of the subject, irrespective of the proficiency level. The Beginner plan should offer a succinct introduction, the Moderate plan a more comprehensive guide, and the Advanced plan an in-depth analysis of the subject. The complexity and detail of each plan should correspond to the student's desired level of mastery. **IMPORTANT NOTE:** /n - Beginner-level plans must be structured for more than 7 days with daily time in mind. /n - Moderate-level plans must be structured for more than 10 days with daily time in mind. /n - Advanced-level plans must be structured for more than 14 days with daily time in mind.",
};

// const knowledgeCheckGenerationConfig = {
//   model: "gemini-1.5-flash-002",
//   generationConfig: {
//     temperature: 1,
//     topP: 0.95,
//     topK: 40,
//     maxOutputTokens: 8192,
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         question: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               question_text: {
//                 type: "string",
//               },
//               options: {
//                 type: "array",
//                 items: {
//                   type: "string",
//                 },
//               },
//               correct_answer: {
//                 type: "string",
//               },
//               explanation: {
//                 type: "string",
//               },
//             },
//             required: [
//               "question_text",
//               "options",
//               "correct_answer",
//               "explanation",
//             ],
//           },
//         },
//       },
//       required: ["question"],
//     },
//   },
//   systemInstruction:
//     "As an expert in educational content creation, your task is to generate a knowledge check in JSON format based on the provided lesson topic. The knowledge check should include a minimum of 8 and a maximum of 10 multiple-choice questions, with difficulty progressing from easy to hard. Each question should have the following structure: - 'question_text': The text of the question. - 'options': An array of four possible answers. - 'correct_answer': The index of the correct answer in the options array (0, 1, 2, or 3). - 'explanation': A brief explanation of why the correct answer is correct. The first few questions (1-3) should focus on basic concepts and be easier, while questions towards the end (8-10) should cover more advanced or nuanced topics, becoming progressively more challenging.",
// };

const adaptive_recommendationGenerationConfig = {
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        adaptive_recommendation: {
          type: "string",
        },
      },
      required: ["adaptive_recommendation"],
    },
  },
  systemInstruction:
    "As an expert in educational content creation, your task is to generate an educational blog teaching the student with the questions/concepts they struggled with in the knowledge check. The blog should be written in MARKDOWN format and should include the following: - A brief introduction to the topic. - A detailed explanation of the concepts the student struggled with. - Examples and exercises to help the student understand the concepts better. - A conclusion that summarizes the key points. - A list of additional resources for further learning. Ensure that the blog is engaging and easy to understand, and that it provides the student with the information they need to master the concepts.",
};

const lessonContentGenerationConfig = (stringifySystemPrompt) => ({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 10000,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        lessonContent: {
          type: "object",
          properties: {
            objectives: {
              type: "array",
              items: {
                type: "string",
              },
            },
            overview: {
              type: "array",
              items: {
                type: "string",
              },
            },
            content: {
              type: "string",
            },
          },
          required: ["objectives", "overview", "content"],
        },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_text: {
                type: "string",
              },
              options: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              correct_answer: {
                type: "string",
                enum: ["0", "1", "2", "3"],
              },
              explanation: {
                type: "string",
              },
            },
            required: [
              "question_text",
              "options",
              "correct_answer",
              "explanation",
            ],
          },
        },
      },
      required: ["lessonContent", "questions"],
    },
  },
  systemInstruction: `${stringifySystemPrompt},
  "As an expert in educational content creation, your task is to generate educational blogs in MARKDOWN format based on the provided lesson plan. The student will request content for one subtopic at a time, progressing sequentially. Always maintain continuity by referencing previous content to ensure coherence. For each subtopic: 1. Overview: Introduce key concepts and relevance to the broader topic. 2. Learning Objectives: Outline specific knowledge or skills the student will gain. 3. Content: Provide detailed explanations, examples, and interactive elements. Ensure the lesson is: - Engaging: Tailor content to the students proficiency (Beginner, Moderate, Advanced). - Structured: Use clear headings, bullet points, and sections such as: - Introduction: Brief relevance. - Key Concepts: Core explanations, formulas, diagrams. - Examples: Code snippets or real-world scenarios. - Interactive Elements: Practical exercises or mini-quizzes. - Referencing: Connect to previously covered material to reinforce learning. - Teaching Methods: Use text, diagrams, code snippets, and visual aids. - Practical Examples: Include real-world applications and use cases (especially for Moderate and Advanced levels). - Aligned with Lesson Plan: Ensure the content fits the broader learning objectives and builds on prior lessons. Quiz Generation: After generating the content, create a knowledge check with 4-5 questions. Each question should include: A question with multiple-choice options, the correct answer, and an explanation."
`,
});

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

const generateContent = async (prompt, config) => {
  const model = genAI.getGenerativeModel({
    model: config.model,
    generationConfig: config.generationConfig,
    safetySettings: safetySettings,
    systemInstruction:
      typeof config.systemInstruction === "function"
        ? config.systemInstruction(stringifySystemPrompt)
        : config.systemInstruction,
  });

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new GoogleGenerativeAIError(error.message);
  }
};

export const generateLessonPlan = (prompt) =>
  generateContent(prompt, lessonPlanGenerationConfig);
// export const generateKnowledgeCheck = (prompt) =>
//   generateContent(prompt, knowledgeCheckGenerationConfig);
export const generateAdaptiveRecommendation = (prompt) =>
  generateContent(prompt, adaptive_recommendationGenerationConfig);
export const generateLessonContent = (stringifySystemPrompt, prompt) =>
  generateContent(prompt, lessonContentGenerationConfig(stringifySystemPrompt));
