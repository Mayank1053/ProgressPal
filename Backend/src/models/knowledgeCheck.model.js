import mongoose from "mongoose";

const knowledgeCheckSchema = new mongoose.Schema(
  {
    subtopic: {
      type: String,
      required: true,
    },
    questions: [
      {
        question_text: {
          type: String,
        },
        options: {
          type: [String],
        },
        correct_answer: {
          type: Number, // 0, 1, 2, 3
        },
        explanation: {
          type: String,
        },
      },
    ],
    score: {
      type: Number,
    },
    attempted_at: {
      type: Date,
    },
    wrong_answered: { // Store the question_text for review purpose
      type: [String],
    },
    adaptive_recommendation: { // Based on wrong_answered
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const KnowledgeCheck = mongoose.model("KnowledgeCheck", knowledgeCheckSchema);

export default KnowledgeCheck;