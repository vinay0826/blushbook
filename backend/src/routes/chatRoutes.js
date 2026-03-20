import { Router } from "express";
import { listConversations, listMessages, sendMessage } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, listConversations);
router.get("/with/:userId", requireAuth, listMessages);
router.post("/with/:userId", requireAuth, sendMessage);

export default router;
