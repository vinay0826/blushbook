import { Router } from "express";
import { listMyComments } from "../controllers/commentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", requireAuth, listMyComments);

export default router;
