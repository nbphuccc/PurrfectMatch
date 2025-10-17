import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.js"; // NOTE: .js!

const app = express();
app.use(cors());
app.use(express.json());

// simple root + health so you can curl them
app.get("/", (_req, res) => res.json({ name: "Purrfect Match API", status: "ok" }));
app.get("/health", (_req, res) => res.status(200).send("OK"));

app.use("/posts", postsRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});