import { ShelfItem } from "../models/ShelfItem.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedStatuses = ["currently-reading", "completed", "want-to-read"];

export const listShelfItems = asyncHandler(async (req, res) => {
  const items = await ShelfItem.find().sort({ createdAt: -1 });
  res.json({ items });
});

export const createShelfItem = asyncHandler(async (req, res) => {
  const { bookTitle, status } = req.body;
  if (!bookTitle || !status) {
    return res.status(400).json({ message: "bookTitle and status are required." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid shelf status." });
  }

  const item = await ShelfItem.create({ bookTitle, status });
  res.status(201).json({ item });
});

export const deleteShelfItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await ShelfItem.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({ message: "Shelf item not found." });
  }

  res.json({ message: "Deleted successfully." });
});
