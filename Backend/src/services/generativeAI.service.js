import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const lessonGenerationConfig = {
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

const knowledgeCheckGenerationConfig = {
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
    model: "gemini-1.5-pro-exp-0827",
    generationConfig: config,
    safetySettings,
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
  generateContent(prompt, lessonGenerationConfig);
export const generateKnowledgeCheck = (prompt) =>
  generateContent(prompt, knowledgeCheckGenerationConfig);
