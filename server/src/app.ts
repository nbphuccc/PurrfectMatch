import express from "express";
import cors from "cors";
import playdatesRouter from "./routes/playdates.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ name: "Purrfect Match API", status: "ok" }));
app.get("/health", (_req, res) => res.status(200).send("OK"));

app.use("/playdates", playdatesRouter);
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

export default app;
