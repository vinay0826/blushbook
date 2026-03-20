import { Comment } from "../models/Comment.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function buildCommentTree(items) {
  const map = new Map();
  const roots = [];

  items.forEach((item) => {
    const node = { ...item, replies: [] };
    map.set(String(node._id), node);
  });

  items.forEach((item) => {
    const id = String(item._id);
    const node = map.get(id);
    if (item.parentId) {
      const parent = map.get(String(item.parentId));
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export const listComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comments = await Comment.find({ reviewId: id }).sort({ createdAt: 1 }).lean();
  res.json({ comments: buildCommentTree(comments) });
});

export const createComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parentId } = req.body;
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  const user = await User.findById(req.userId).select("firstName lastName email");
  if (!user) {
    return res.status(401).json({ message: "User account not found." });
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const username = fullName || user.email;

  const created = await Comment.create({
    reviewId: review._id,
    userId: req.userId,
    username,
    content: cleanContent,
    parentId: parentId || null
  });

  await Review.findByIdAndUpdate(review._id, { $inc: { commentsCount: 1 } });

  res.status(201).json({ comment: created });
});

export const listMyComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .populate("reviewId", "bookTitle")
    .lean();

  const serialized = comments.map((comment) => ({
    ...comment,
    reviewTitle: comment.reviewId?.bookTitle || ""
  }));

  res.json({ comments: serialized });
});
