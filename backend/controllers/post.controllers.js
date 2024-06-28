import Post from "../Models/post.model.js";
import User from "../Models/user.models.js";
import Notification from "../Models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { Image } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !Image) {
      return res.status(400).json({ error: "Please provide text or image" });
    }
    if (Image) {
      const uploadedResponse = await cloudinary.uploader.upload(Image);
      Image = uploadedResponse.secure_url;
    }
    const newpost = await Post({
      text: text,
      Image: Image,
      user: userId,
    });
    await newpost.save();
    console.log(Image);
    res.status(200).json(newpost);
  } catch (error) {
    console.log("Error in create post controller", error.message);

    res.status(404).json({ error: "internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Unauthorized User to delete this post" });
    }
    if (post.Image) {
      const imageId = post.Image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in delete post controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ error: "Please provide comment" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comment.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in comment on post controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};

export const likeunlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isliked = post.likes.includes(userId);
    if (isliked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeunlike controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" })
      .sort({ createdAt: -1 });
    if (posts.length === 0) {
      return res.status(404).json({ error: "No posts found" });
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" })
      .sort({ createdAt: -1 });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};
export const getFollowingAllPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following;
    const posts = await Post.find({ user: { $in: following } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" })
      .sort({ createdAt: -1 });
    res.status(200).json(posts || []);
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  // const username = req.params.username;
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(404).json({ error: "internal server error" });
  }
};
