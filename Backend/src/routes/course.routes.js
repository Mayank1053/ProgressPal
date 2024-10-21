import { Router } from "express";
import {
  createLessonPlans,
  startCourse,
  getCoursesData,
  getLessonPlan,
} from "../controllers/course.controller.js";
import { verifyJwtToken } from "../middlewares/auth.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/create").post(createLessonPlans);
router.route("/").post(getCoursesData)
router.route("/start").post(startCourse);
router.route("/:courseId").get(getLessonPlan);

export default router;