import { Router } from "express";
import { verifyJwtToken } from "../middlewares/auth.js";
import {
  getKnowledgeCheck,
  createKnowledgeCheck,
  saveKnowledgeCheck,
} from "../controllers/knowledgeCheck.controller.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/").get(getKnowledgeCheck).post(createKnowledgeCheck).patch(saveKnowledgeCheck);

export default router;
