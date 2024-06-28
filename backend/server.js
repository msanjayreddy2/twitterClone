import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./Routes/auth.Routes.js";
import userRoutes from "./Routes/user.routes.js";
import postRoutes from "./Routes/post.routes.js";
import notificationRoutes from "./Routes/notifications.Routes.js";

import { connectMongoDB } from "./db/connect.js";
import { v2 as cloudinary } from "cloudinary";
const app = express();
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Example app listening on port 3000!");
  connectMongoDB();
});
