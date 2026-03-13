import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function signToken(userId, email) {
  return jwt.sign({ sub: userId, email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, firstName, lastName, email, password, confirmPassword } = req.body;
  const cleanName = String(name || "").trim();
  let cleanFirstName = String(firstName || "").trim();
  let cleanLastName = String(lastName || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  const cleanConfirmPassword = String(confirmPassword || cleanPassword);

  if (!cleanFirstName && cleanName) {
    const nameParts = cleanName.split(/\s+/).filter(Boolean);
    cleanFirstName = nameParts[0] || "";
    cleanLastName = nameParts.slice(1).join(" ");
  }

  if (!cleanFirstName || !cleanEmail || !cleanPassword || !cleanConfirmPassword) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (cleanPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  if (cleanPassword !== cleanConfirmPassword) {
    return res.status(400).json({ message: "Password and confirm password do not match." });
  }

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 10);
  const user = await User.create({
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
    passwordHash
  });

  const token = signToken(user._id.toString(), user.email);

  return res.status(201).json({
    token,
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken(user._id.toString(), user.email);

  return res.json({
    token,
    user: sanitizeUser(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ user });
});
