import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";
const authRoutes = express.Router();

authRoutes.get("/me", protectRoute, getMe);
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
