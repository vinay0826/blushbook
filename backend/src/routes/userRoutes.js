import { Router } from "express";
import { getUserPublic, searchUsers } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, searchUsers);
router.get("/:id", getUserPublic);

export default router;
