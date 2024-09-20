import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const lessonPlanGenerationConfig = {
  model: "gemini-1.5-pro-exp-0827",
  generationConfig: {
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
  },
  systemInstruction:
    "As an expert in educational content creation, your assignment is to craft three structured lesson plans in JSON format tailored to the user's specifications. The user will specify a learning topic, their target proficiency level (Beginner, Moderate, Advanced), the goal they want to achieve, and the amount of time they can allocate daily for study. /n Each lesson plan must encompass: /n - A 'Topic' field detailing the primary focus for the day. /n - A 'Subtopics' field listing the particular subtopics to be addressed. /n *Keep the daily 'study-time' in mind when structuring the daily topics and subtopics to ensure the lesson plan fits within the allocated time.* /n Every lesson plan should commence with foundational knowledge of the subject, irrespective of the proficiency level. The Beginner plan should offer a succinct introduction, the Moderate plan a more comprehensive guide, and the Advanced plan an in-depth analysis of the subject. The complexity and detail of each plan should correspond to the user's desired level of mastery. **IMPORTANT NOTE:** /n - Beginner-level plans must be structured for more than 7 days with daily time in mind. /n - Moderate-level plans must be structured for more than 10 days with daily time in mind. /n - Advanced-level plans must be structured for more than 14 days with daily time in mind.",
};

const knowledgeCheckGenerationConfig = {
  model: "gemini-1.5-flash-exp-0827",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        question: {
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
      required: ["question"],
    },
  },
  systemInstruction:
    "As an expert in educational content creation, your task is to generate a knowledge check in JSON format based on the provided lesson topic. The knowledge check should include a minimum of 8 and a maximum of 10 multiple-choice questions, with difficulty progressing from easy to hard. Each question should have the following structure: - 'question_text': The text of the question. - 'options': An array of four possible answers. - 'correct_answer': The index of the correct answer in the options array (0, 1, 2, or 3). - 'explanation': A brief explanation of why the correct answer is correct. The first few questions (1-3) should focus on basic concepts and be easier, while questions towards the end (8-10) should cover more advanced or nuanced topics, becoming progressively more challenging.",
};

const adaptive_recommendationGenerationConfig = {
  model: "gemini-1.5-flash-exp-0827",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
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
    "As an expert in educational content creation, your task is to generate an adaptive recommendation in JSON format based on the user's performance in a knowledge check. The prompt contains the user's wrong answers from the knowledge check. Your recommendation should provide guidance on areas where the user needs to improve and suggest additional resources or study materials to help them better understand the concepts. The recommendation should be tailored to the user's specific knowledge gaps and learning preferences. **IMPORTANT NOTE:** /n - The adaptive recommendation should be concise and actionable, focusing on key areas for improvement based on the user's performance in the knowledge check. /n - Provide clear and relevant suggestions to help the user enhance their understanding of the subject matter. /n - Consider the user's learning style and preferences when formulating the recommendation to ensure it is engaging and effective. /n - The recommendation should be informative and supportive, motivating the user to continue learning and improving their knowledge.",
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

const generateContent = async (prompt, config) => {
  const model = genAI.getGenerativeModel({
    model: config.model,
    generationConfig: config.generationConfig,
    safetySettings: safetySettings,
    systemInstruction: config.systemInstruction,
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
export const generateKnowledgeCheck = (prompt) =>
  generateContent(prompt, knowledgeCheckGenerationConfig);
export const generateAdaptiveRecommendation = (prompt) =>
  generateContent(prompt, adaptive_recommendationGenerationConfig);
