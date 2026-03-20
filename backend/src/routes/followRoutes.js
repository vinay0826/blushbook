import { Router } from "express";
import { getFollowStats, listFollowers, listFollowing, toggleFollow } from "../controllers/followController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:userId", optionalAuth, getFollowStats);
router.get("/:userId/followers", listFollowers);
router.get("/:userId/following", listFollowing);
router.post("/:userId", requireAuth, toggleFollow);

export default router;
