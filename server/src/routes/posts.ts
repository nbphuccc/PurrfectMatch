import { Router } from "express";
const router = Router();

// quick test route
router.get("/", (_req, res) => {
  res.json([{ id: 1, type: "playdate", title: "Green Lake pups 10am" }]);
});

export default router;