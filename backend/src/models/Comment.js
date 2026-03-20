import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }
  },
  { timestamps: true }
);

commentSchema.index({ reviewId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1, createdAt: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
