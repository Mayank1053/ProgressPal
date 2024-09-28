// Fields:
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Moderate", "Advanced"],
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    daily_study_time: {
      type: String,
      required: true,
    },
    lessonPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonPlan",
      required: true,
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
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);

export default Course;
