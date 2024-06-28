import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  getUserProfileSuggested,
  followunfollow,
  updateUserProfile,
} from "../controllers/users.controllers.js";
const ur = express.Router();

ur.get("/profile/:username", protectRoute, getUserProfile);

ur.get("/suggested", protectRoute, getUserProfileSuggested);
ur.post("/follow/:id", protectRoute, followunfollow);
ur.post("/update", protectRoute, updateUserProfile);

export default ur;
