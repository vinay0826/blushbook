import { Router } from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  likeReview,
  listMyReviews,
  listReviews,
  listUserReviews,
  repostReview
} from "../controllers/reviewController.js";
import { createComment, listComments } from "../controllers/commentController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", optionalAuth, listReviews);
router.get("/mine", requireAuth, listMyReviews);
router.get("/user/:userId", optionalAuth, listUserReviews);
router.post("/", requireAuth, createReview);
router.patch("/:id/like", likeReview);
router.post("/:id/repost", requireAuth, repostReview);
router.get("/:id/comments", listComments);
router.post("/:id/comments", requireAuth, createComment);
router.get("/:id", optionalAuth, getReviewById);
router.delete("/:id", requireAuth, deleteReview);

export default router;
