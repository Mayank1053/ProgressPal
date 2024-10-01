import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());


// Routes import
import userRoutes from "./routes/user.routes.js";
import lessonRoutes from "./routes/course.routes.js";
import KnowledgeCheck from "./routes/knowledgeCheck.routes.js";
import progress from "./routes/progress.routes.js";

// Routes declaration
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/knowledge-check", KnowledgeCheck);
app.use("/api/v1/progress", progress);


export default app;