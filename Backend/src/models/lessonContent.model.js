import mongoose from "mongoose";

const lessonContentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
);

const LessonContent = mongoose.model("LessonContent", lessonContentSchema);

export default LessonContent;