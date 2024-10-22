import { Router } from "express";
import { verifyJwtToken } from "../middlewares/auth.js";
import {
  getKnowledgeCheck,
  saveKnowledgeCheck,
} from "../controllers/knowledgeCheck.controller.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/").post(getKnowledgeCheck).patch(saveKnowledgeCheck);

export default router;
