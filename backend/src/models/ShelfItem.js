import mongoose from "mongoose";

const shelfItemSchema = new mongoose.Schema(
  {
    bookTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["currently-reading", "completed", "want-to-read"],
      required: true
    }
  },
  { timestamps: true }
);

export const ShelfItem = mongoose.model("ShelfItem", shelfItemSchema);
