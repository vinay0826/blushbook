import { Follow } from "../models/Follow.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function serializeUser(user) {
  if (!user) return null;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: fullName || user.email || "Reader",
    email: user.email
  };
}

export const getFollowStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: userId }),
    Follow.countDocuments({ followerId: userId })
  ]);

  let isFollowing = false;
  if (req.userId) {
    const existing = await Follow.findOne({
      followerId: req.userId,
      followingId: userId
    });
    isFollowing = Boolean(existing);
  }

  res.json({ followersCount, followingCount, isFollowing });
});

export const listFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followers = await Follow.find({ followingId: userId })
    .populate("followerId", "firstName lastName email")
    .lean();

  res.json({
    users: followers
      .map((item) => serializeUser(item.followerId))
      .filter(Boolean)
  });
});

export const listFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const following = await Follow.find({ followerId: userId })
    .populate("followingId", "firstName lastName email")
    .lean();

  res.json({
    users: following
      .map((item) => serializeUser(item.followingId))
      .filter(Boolean)
  });
});

export const toggleFollow = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.userId === userId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  const existing = await Follow.findOne({
    followerId: req.userId,
    followingId: userId
  });

  if (existing) {
    await existing.deleteOne();
    return res.json({ following: false });
  }

  await Follow.create({ followerId: req.userId, followingId: userId });
  return res.json({ following: true });
});
