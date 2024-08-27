import mongoose from "mongoose";

const lessonContentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeCheck",
    },
  },
  {
    timestamps: true,
  }
);

const LessonContent = mongoose.model("LessonContent", lessonContentSchema);

export default LessonContent;