import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token; // Read token from HttpOnly cookie

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export default protect;
