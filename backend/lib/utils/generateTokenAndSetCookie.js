import jwt from "jsonwebtoken";

export const generateTokenAndsetCookie = (uid, res) => {
  const token = jwt.sign({ uid }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 1000 * 60 * 60 * 24,
  });
  return token;
};
