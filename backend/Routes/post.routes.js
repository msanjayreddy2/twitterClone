import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  likeunlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingAllPosts,
  getUserPosts,
} from "../controllers/post.controllers.js";

const postRoutes = express.Router();

postRoutes.get("/all", protectRoute, getAllPosts);
postRoutes.get("/following", protectRoute, getFollowingAllPosts);
postRoutes.get("/user/:username", protectRoute, getUserPosts);
postRoutes.get("/likes/:id", protectRoute, getLikedPosts);
postRoutes.post("/create", protectRoute, createPost);
postRoutes.delete("/:id", protectRoute, deletePost);
postRoutes.post("/comment/:id", protectRoute, commentOnPost);
postRoutes.post("/like/:id", protectRoute, likeunlikePost);
export default postRoutes;
