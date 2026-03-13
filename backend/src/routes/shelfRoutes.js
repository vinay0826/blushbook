import { Router } from "express";
import { createShelfItem, deleteShelfItem, listShelfItems } from "../controllers/shelfController.js";

const router = Router();

router.get("/", listShelfItems);
router.post("/", createShelfItem);
router.delete("/:id", deleteShelfItem);

export default router;
