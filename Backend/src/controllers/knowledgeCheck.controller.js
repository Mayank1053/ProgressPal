import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import KnowledgeCheck from "../models/knowledgeCheck.model.js";
import LessonPlan from "../models/lessonPlan.model.js";
import Progress from "../models/progress.model.js";
import {
  generateKnowledgeCheck,
  generateAdaptiveRecommendation,
} from "../services/generativeAI.service.js";

const createKnowledgeCheck = asyncHandler(async (req, res) => {
  const { subtopic } = req.params;

  const knowledgeCheck = await generateKnowledgeCheck(subtopic);

  const newKnowledgeCheck = new KnowledgeCheck({
    subtopic: subtopic,
    questions: knowledgeCheck.question,
  });

  await newKnowledgeCheck.save();

  await LessonPlan.updateOne({ quiz: newKnowledgeCheck._id });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        knowledgeCheck.question,
        "Knowledge Check generated successfully"
      )
    );
});

const knowledgeCheck = asyncHandler(async (req, res) => {
  const { subtopic } = req.params;

  const knowledgeCheck = await KnowledgeCheck.findOne({
    subtopic: subtopic,
  });

  if (!knowledgeCheck) {
    throw new ApiError(404, "Knowledge Check not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        knowledgeCheck.questions,
        "Knowledge Check fetched successfully"
      )
    );
});

// Save info like score, attempted_at and wrong_answered
const saveKnowledgeCheck = asyncHandler(async (req, res) => {
  const { subtopic } = req.params;
  const { score, wrong_answered } = req.body;

  const knowledgeCheck = await KnowledgeCheck.findOne({
    subtopic: subtopic,
  });

  if (!knowledgeCheck) {
    throw new ApiError(404, "Knowledge Check not found");
  }

  knowledgeCheck.score = score;
  knowledgeCheck.attempted_at = new Date();
  knowledgeCheck.wrong_answered = wrong_answered;

  // Add the date & score to the progress model
  const progress = await Progress.findOne({ user: req.user._id });

  progress.daily_progress = {
    date: new Date(),
    score: score,
  };
  await progress.save();

  // Generate adaptive recommendation based on wrong_answered questions
  const adaptiveRecommendation = await generateAdaptiveRecommendation(
    knowledgeCheck.wrong_answered.join(", ")
  );

  knowledgeCheck.adaptive_recommendation = adaptiveRecommendation;

  await knowledgeCheck.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, knowledgeCheck, "Knowledge Check saved successfully")
    );
});

export { knowledgeCheck, createKnowledgeCheck, saveKnowledgeCheck };
