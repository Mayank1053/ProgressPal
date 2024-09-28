import mongoose from "mongoose";

const lessonContentSchema = new mongoose.Schema(
  {
    lessonPlan: { // A copy of the lesson plan in text form for content generation
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
);

const LessonContent = mongoose.model("LessonContent", lessonContentSchema);

export default LessonContent;