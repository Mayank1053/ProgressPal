import { Router } from "express";
import { verifyJwtToken } from "../middlewares/auth.js";

import {
  markTopicComplete,
  getProgress,
  getLessonProgress,
} from "../controllers/progress.controller.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/").get(getProgress);
router.route("/subtopic/complete").post(markTopicComplete);
router.route("/:lessonId").get(getLessonProgress);

export default router;