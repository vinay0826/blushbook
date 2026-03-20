import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 60;
const CONVO_LIMIT = 20;

function buildThreadId(userId, otherUserId) {
  const [first, second] = [String(userId), String(otherUserId)].sort();
  return `${first}_${second}`;
}

function parseListQuery(query) {
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const parsedLimit = Number.parseInt(query.limit || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, parsedLimit), MAX_LIMIT);
  return { page, limit };
}

export const listConversations = asyncHandler(async (req, res) => {
  const userId = String(req.userId);

  const recentMessages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
    .sort({ createdAt: -1 })
    .limit(200);

  const seenThreads = new Set();
  const conversations = [];
  const otherUserIds = new Set();

  for (const message of recentMessages) {
    if (conversations.length >= CONVO_LIMIT) break;
    if (seenThreads.has(message.threadId)) continue;

    seenThreads.add(message.threadId);
    const isSender = String(message.senderId) === userId;
    const otherUserId = isSender ? String(message.receiverId) : String(message.senderId);

    otherUserIds.add(otherUserId);
    conversations.push({
      threadId: message.threadId,
      otherUserId,
      lastMessage: message.content,
      lastAt: message.createdAt,
      lastSenderId: message.senderId
    });
  }

  const users = await User.find({ _id: { $in: [...otherUserIds] } }).select(
    "firstName lastName email"
  );
  const userMap = new Map(
    users.map((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      return [
        String(user._id),
        {
          id: user._id,
          name: fullName || user.email || "Reader",
          email: user.email
        }
      ];
    })
  );

  res.json({
    conversations: conversations.map((item) => ({
      ...item,
      user: userMap.get(item.otherUserId) || {
        id: item.otherUserId,
        name: "Reader",
        email: ""
      }
    }))
  });
});

export const listMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = parseListQuery(req.query);

  if (!userId) {
    return res.status(400).json({ message: "User id is required." });
  }

  const threadId = buildThreadId(req.userId, userId);
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ threadId }).sort({ createdAt: 1 }).skip(skip).limit(limit),
    Message.countDocuments({ threadId })
  ]);

  res.json({
    messages,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + messages.length < total
    }
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const content = String(req.body.content || "").trim();

  if (!userId) {
    return res.status(400).json({ message: "User id is required." });
  }

  if (!content) {
    return res.status(400).json({ message: "Message content is required." });
  }

  if (String(req.userId) === String(userId)) {
    return res.status(400).json({ message: "You cannot message yourself." });
  }

  const [sender, receiver] = await Promise.all([
    User.findById(req.userId).select("firstName lastName email"),
    User.findById(userId).select("_id")
  ]);

  if (!sender) {
    return res.status(401).json({ message: "User account not found." });
  }

  if (!receiver) {
    return res.status(404).json({ message: "Recipient not found." });
  }

  const fullName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim();
  const senderName = fullName || sender.email;

  const threadId = buildThreadId(req.userId, userId);
  const message = await Message.create({
    threadId,
    senderId: req.userId,
    receiverId: userId,
    senderName,
    content
  });

  res.status(201).json({ message });
});
