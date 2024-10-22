import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import KnowledgeCheck from "../models/knowledgeCheck.model.js";
import LessonPlan from "../models/LessonPlan.model.js";
import Progress from "../models/progress.model.js";
import { generateAdaptiveRecommendation } from "../services/generativeAI.service.js";

// const createKnowledgeCheck = asyncHandler(async (req, res) => {
//   const { subtopic } = req.params;

//   const knowledgeCheck = await generateKnowledgeCheck(subtopic);

//   const newKnowledgeCheck = new KnowledgeCheck({
//     subtopic: subtopic,
//     questions: knowledgeCheck.question,
//   });

//   await newKnowledgeCheck.save();

//   await LessonPlan.updateOne({ quiz: newKnowledgeCheck._id });

//   res
//     .status(201)
//     .json(
//       new ApiResponse(
//         201,
//         knowledgeCheck.question,
//         "Knowledge Check generated successfully"
//       )
//     );
// });

const getKnowledgeCheck = asyncHandler(async (req, res) => {
  const { LessonPlanId, topicIndex } = req.body;
  console.log("Get Knowledge Check: ", LessonPlanId, topicIndex);

  // Find the knowledge check for the lesson plan id and topic index (topic index should be matched)
  const knowledgeCheck = await KnowledgeCheck.findOne({
    lessonPlan: LessonPlanId,
    topic: topicIndex,
  });
  console.log("Knowledge Check: ", knowledgeCheck);

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
  const { lessonPlanId, topicIndex, knowledgeCheckId, score, wrongAnswered } =
    req.body;

  console.log("Save Knowledge Check: ", req.body);

  const knowledgeCheck = await KnowledgeCheck.findById(knowledgeCheckId);

  if (!knowledgeCheck) {
    throw new ApiError(404, "Knowledge Check not found");
  }

  knowledgeCheck.score = score;
  knowledgeCheck.attempted_at = new Date();
  knowledgeCheck.wrong_answered = wrongAnswered;

  knowledgeCheck.save();

  // Add the date & score to the progress model
  const progress = await Progress.findOne({ user: req.user._id });

  progress.daily_progress = {
    day: topicIndex + 1,
    score: score,
  };
  await progress.save();

  // Generate adaptive recommendation based on wrong_answered questions
  const ReviewContent = await generateAdaptiveRecommendation(
    wrongAnswered.join(", ")
  );

  console.log("Review Content: ", ReviewContent.adaptive_recommendation);

  // Update the lesson plan with the review content and knowledge check completed
  const lessonPlan = await LessonPlan.findById(lessonPlanId);
  lessonPlan.topics[topicIndex].reviewContent =
    ReviewContent.adaptive_recommendation;
  lessonPlan.topics[topicIndex].knowledgeCheckCompleted = true;
  lessonPlan.markModified("topics");
  await lessonPlan.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, lessonPlan, "Knowledge Check saved successfully")
    );
});

export { getKnowledgeCheck, saveKnowledgeCheck };
