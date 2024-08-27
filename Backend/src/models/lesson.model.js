// Fields:
// _id: ObjectId
// user_id: ObjectId (reference to the user who owns the LessonPlan plan)
// title: String (name of the LessonPlan plan)
// topic: String (main topic of the LessonPlan plan)
// level: String (beginner, moderate, advanced)
// daily_study_time: Number (time in minutes user plans to spend each day)
// lessons:
// day: Number (day number in the plan)
// subtopics:
// title: String (title of the subtopic)
// content: String (content or URL)
// completed: Boolean (whether the subtopic is completed)
// start_date: Date
// end_date: Date (optional, if the plan is time-bound)
// progress: Number (percentage of completion)
// locked: Boolean (whether future lessons are locked)
// final_review: Boolean (whether the final review LessonPlan is included)

import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
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
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
