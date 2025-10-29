import express from "express";
import cors from "cors";
import communityRouter from "./routes/community.js";
import playdatesRouter from "./routes/playdates.js";
import commentsRouter from "./routes/comments.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => res.json({ name: "Purrfect Match API", status: "ok" }));
app.get("/health", (_req, res) => res.status(200).send("OK"));
app.use("/community", communityRouter);
app.use("/playdates", playdatesRouter);
app.use("/comments", commentsRouter);
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
export default app;
//# sourceMappingURL=app.js.map