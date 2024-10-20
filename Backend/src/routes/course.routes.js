import { Router } from "express";
import {
  createLessonPlans,
  startCourse,
  getLessonPlan,
  getLessonContent,
} from "../controllers/course.controller.js";
import { verifyJwtToken } from "../middlewares/auth.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/").post(createLessonPlans);
router.route("/start").post(startCourse);
router.route("/:courseId").get(getLessonPlan);
router.route("/:lessonPlanId/:subtopic").get(getLessonContent);

export default router;