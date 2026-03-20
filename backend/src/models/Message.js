import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    threadId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

messageSchema.index({ threadId: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
