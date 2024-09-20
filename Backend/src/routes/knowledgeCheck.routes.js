import { Router } from "express";
import { verifyJwtToken } from "../middlewares/auth.js";
import {
  knowledgeCheck,
  createKnowledgeCheck,
  saveKnowledgeCheck,
} from "../controllers/knowledgeCheck.controller.js";

const router = Router();

router.use(verifyJwtToken);

router.route("/:subtopic").get(knowledgeCheck).post(createKnowledgeCheck).patch(saveKnowledgeCheck);

export default router;
