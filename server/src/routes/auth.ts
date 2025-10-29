import { Router } from "express";
import {AuthController} from "../controllers/authController.js";
//import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Public routes
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
//router.post("/refresh", AuthController.refresh);

// Protected route
//router.post("/logout", requireAuth, AuthController.logout);

export default router;
