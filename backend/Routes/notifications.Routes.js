import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";

import {
  getNotifications,
  deleteNotifications,
} from "../controllers/notifications.controllers.js";

const notificationRoutes = express.Router();

notificationRoutes.get("/", protectRoute, getNotifications);
notificationRoutes.delete("/", protectRoute, deleteNotifications);
export default notificationRoutes;
