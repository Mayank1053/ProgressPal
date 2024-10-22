import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonPlan",
    },
    daily_progress: {
      date: {
        type: Date,
      },
      score: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeCheck",
      },
    },
    overall_progress: {
      // Total progress of the current course => % of completed subtopics to total subtopics
      type: Number, // 0-100 => 0% - 100%
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;