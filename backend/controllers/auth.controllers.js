import User from "../Models/user.models.js";
import { generateTokenAndsetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(fullName, username, email, password);
    console.log(emailRegex.test(email));
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const existingemail = await User.findOne({ email });
    if (existingemail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (password.length <= 5) {
      return res
        .status(400)
        .json({ error: "Password must be atleast 6 characters long" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndsetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json(newUser);
    } else {
      return res.status(400).json({ error: "unable tosignin" });
    }
  } catch (err) {
    console.log("Error in Signup Controller", err.message);
    res.json({ error: "Invalid Server Error" });
  }
};
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || ""
    );
    // console.log(user, isPasswordValid, username, password);
    if (!user) {
      return res.json({ error: "User not found" });
    }
    if (!isPasswordValid) {
      return res.status(400).json({ error: "invalid password" });
    }
    generateTokenAndsetCookie(user._id, res);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in login Controller", err.message);
    console.log({ error: "Invalid Server Error" });
  }
};
export const logout = async (req, res, next) => {
  try {
    // console.log(req.cookies.jwt);
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout Controller", error.message);
    console.log({ error: "Invalid Server Error" });
  }
};

export const getMe = (req, res) => {
  res.status(200).json(req.user);
};
