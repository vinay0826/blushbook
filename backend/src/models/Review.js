import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, trim: true },
    bookTitle: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true },
    genre: {
      type: String,
      enum: ["Fantasy", "Romance", "Mystery", "Thriller", "Sci-Fi", "Non-fiction"],
      required: true
    },
    mood: {
      type: String,
      enum: ["Heartwarming", "Dark", "Inspiring", "Mind-bending", "Comforting"],
      default: "Inspiring"
    },
    review: { type: String, required: true, trim: true, maxlength: 3000 },
    favoriteQuote: { type: String, required: true, trim: true, maxlength: 700 },
    likes: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ likes: -1, createdAt: -1 });
reviewSchema.index({ username: "text", bookTitle: "text" });

export const Review = mongoose.model("Review", reviewSchema);
