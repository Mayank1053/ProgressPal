import mongoose from "mongoose";

const lessonPlanSchema = new mongoose.Schema(
  {
    topics: {
      type: [{}],
      required: true,

      title: {
        type: String,
        required: true,
      },
      subtopics: {
        type: [{}],
        required: true,

        title: {
          type: String,
          required: true,
        },
        content: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LessonContent",
        },
        completed: {
          type: Boolean,
          default: false,
        },
        start_date: {
          type: Date,
        },
        end_date: {
          type: Date,
        },
        locked: {
          type: Boolean,
          default: true,
        },
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
      },
      progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Progress",
      },
      locked: {
        type: Boolean,
        default: false,
      },
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeCheck",
      },
      topicsToReview: {
        // topics to review after the quiz and answered incorrectly
        type: [String], // Will add the name of the topic of the question here and use these to make a review chapter/lesson
      },
    },
  },
  { timestamps: true }
);

const LessonPlan = mongoose.model("LessonPlan", lessonPlanSchema);

export default LessonPlan;
