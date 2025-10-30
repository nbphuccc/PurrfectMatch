import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export const AuthController = {
  signup: async (req: Request, res: Response) => {
    try {
      const { email, username, password } = req.body;

      // basic validation
      if (!email || !username || !password) {
        return res.status(400).json({ ok: false, message: "Missing fields" });
      }

      const result = await AuthService.signup(email, username, password);

      if (!result.ok) {
        return res.status(400).json({ ok: false, message: result.message });
      }

      res.status(201).json({
        ok: true,
        message: "User registered successfully",
        user: result.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, message: "Server error" });
    }
  },

  // --- LOGIN ---
  login: (req: Request, res: Response) => {
    try {
      const { loginId, password } = req.body;

      // loginId can be email or username
      if (!loginId || !password) {
        return res
          .status(400)
          .json({ ok: false, message: "Missing loginId or password" });
      }

      const result = AuthService.login(loginId, password);

      if (!result.ok) {
        return res.status(401).json({ ok: false, message: result.message });
      }

      return res.status(200).json({
        ok: true,
        message: "Login successful",
        user: result.user,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  },

  // placeholders for other routes
  refresh: async (req: Request, res: Response) => res.json({ message: "refresh not implemented yet" }),
  logout: async (req: Request, res: Response) => res.json({ message: "logout not implemented yet" }),
};