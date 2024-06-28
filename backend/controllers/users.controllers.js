import User from "../Models/user.models.js";
import Notification from "../Models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("error in getUserProfile controller", error.message);
    res.status(404).json({ error: error.message });
  }
};
export const getUserProfileSuggested = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const usersFollowedByMe = user.following.map((id) => id.toString());

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 100 } },
    ]);

    const filteredUsers = users.filter((user) => {
      return !usersFollowedByMe.includes(user._id.toString());
    });

    const suggestedUsers = filteredUsers.slice(0, 5).map((user) => {
      user.password = null;
      return user;
    });

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("error in suggestedUsers controller", error.message);
    res.status(404).json({ error: error.message });
  }
};

export const followunfollow = async (req, res) => {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id).select("-password");
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!userToModify) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(user._id, userToModify._id);
    if (user._id.toString() === userToModify._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }
    const isfollowing = user.following.includes(id);
    if (isfollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "user unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      const notification = new Notification({
        from: req.user._id,
        to: id,
        type: "follow",
      });
      await notification.save();
      res.status(200).json({ message: "user followed successfully" });
    }
  } catch (error) {
    console.log("error in followunfollowun controller", error.message);
    res.status(404).json({ error: error.message });
  }
};
export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, password, newpassword, bio, link } =
    req.body;
  let { profileImage, coverImage } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((!newpassword && password) || (!password && newpassword)) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (password && newpassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newpassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newpassword, salt);
    }

    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImage, {
        upload_preset: "your_upload_preset", // optional, if you have a preset
      });
      profileImage = uploadedResponse.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(
          user.coverImage.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImage, {
        upload_preset: "your_upload_preset", // optional, if you have a preset
      });
      coverImage = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;

    user = await user.save();
    user.password = undefined;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
