import { Router } from "express";
import {
  createReview,
  likeReview,
  listMyReviews,
  listReviews
} from "../controllers/reviewController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", optionalAuth, listReviews);
router.get("/mine", requireAuth, listMyReviews);
router.post("/", requireAuth, createReview);
router.patch("/:id/like", likeReview);

export default router;
