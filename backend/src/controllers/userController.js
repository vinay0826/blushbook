import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserPublic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("firstName lastName email");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  res.json({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName || user.email || "Reader",
      email: user.email
    }
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const term = String(req.query.search || "").trim();
  if (!term) {
    return res.json({ users: [] });
  }

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const users = await User.find({
    _id: { $ne: req.userId },
    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
  })
    .select("firstName lastName email")
    .limit(10);

  const results = users.map((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return {
      id: user._id,
      name: fullName || user.email || "Reader",
      email: user.email
    };
  });

  res.json({ users: results });
});
