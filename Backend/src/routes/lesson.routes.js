import { Router } from "express";
import {
  createLessonPlans,
  startCourse,
  getLessons,
  getLessonPlan,
  getLessonContent,
  generateContent,
} from "../controllers/course.controller.js";
import { verifyJwtToken } from "../middlewares/auth.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/").get(getLessons).post(createLessonPlans);
router.route("/start").post(startCourse);
router.route("/:lessonId").get(getLessonPlan);

export default router;