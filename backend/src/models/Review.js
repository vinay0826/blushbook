import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, trim: true },
    bookTitle: { type: String, required: true, trim: true, index: true },
    author: { type: String, trim: true, default: "" },
    genre: {
      type: String,
      enum: [
        "Fantasy",
        "Science Fiction",
        "Mystery",
        "Thriller",
        "Romance",
        "Horror",
        "Historical Fiction",
        "Literary Fiction",
        "Contemporary Fiction",
        "Non-fiction",
        "Biography / Memoir",
        "Self-help",
        "Philosophy",
        "Psychology",
        "Business / Finance",
        "Health / Fitness",
        "Travel",
        "Religion / Spirituality",
        "Poetry",
        "Drama",
        "Young Adult (YA)",
        "Children's"
      ],
      required: true
    },
    mood: {
      type: String,
      enum: [
        "Dark",
        "Emotional",
        "Romantic",
        "Suspenseful",
        "Funny",
        "Hopeful",
        "Depressing",
        "Inspirational",
        "Cozy",
        "Thought-provoking"
      ],
      default: "Emotional"
    },
    review: { type: String, required: true, trim: true, maxlength: 3000 },
    favoriteQuote: { type: String, trim: true, maxlength: 700, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    isRepost: { type: Boolean, default: false },
    repostOf: { type: mongoose.Schema.Types.ObjectId, ref: "Review", default: null },
    likes: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ likes: -1, createdAt: -1 });
reviewSchema.index({ username: "text", bookTitle: "text" });

export const Review = mongoose.model("Review", reviewSchema);
