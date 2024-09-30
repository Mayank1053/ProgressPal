import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    daily_progress: {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      date: {
        type: Date,
      },
      score: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeCheck",
      },
    },
    overall_progress: {  // Total progress of the current courses => % of completed subtopics to total subtopics
      type: [Number] // Will have the progress of each course in the same order as the user's current_courses array
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;