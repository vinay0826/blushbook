import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function parseListQuery(query) {
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const parsedLimit = Number.parseInt(query.limit || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, parsedLimit), MAX_LIMIT);
  const search = String(query.search || "").trim();
  const sort = String(query.sort || "recent");
  const discover = String(query.discover || "all");
  const genres = String(query.genres || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const moods = String(query.moods || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return { page, limit, search, sort, discover, genres, moods };
}

function resolveSort(sort) {
  if (sort === "top-liked") return { likes: -1, createdAt: -1 };
  if (sort === "oldest") return { createdAt: 1 };
  return { createdAt: -1 };
}

function buildListFilter({ search, discover, genres, moods, userId }) {
  const filter = {};

  if (userId) {
    filter.userId = userId;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ bookTitle: { $regex: escaped, $options: "i" } }, { username: { $regex: escaped, $options: "i" } }];
  }

  if (discover === "trending") {
    filter.likes = { ...(filter.likes || {}), $gte: 20 };
  }

  if (discover === "most-loved") {
    filter.likes = { ...(filter.likes || {}), $gte: 50 };
  }

  if (genres.length > 0) {
    filter.genre = { $in: genres };
  }

  if (moods.length > 0) {
    filter.mood = { $in: moods };
  }

  return filter;
}

async function listWithQuery(req, res, extraFilter = {}) {
  const query = parseListQuery(req.query);
  const filter = {
    ...buildListFilter(query),
    ...extraFilter
  };

  const skip = (query.page - 1) * query.limit;
  const sortBy = resolveSort(query.sort);

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort(sortBy).skip(skip).limit(query.limit),
    Review.countDocuments(filter)
  ]);

  const hasMore = skip + reviews.length < total;

  res.json({
    reviews,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      hasMore
    }
  });
}

export const listReviews = asyncHandler(async (req, res) => {
  await listWithQuery(req, res);
});

export const listMyReviews = asyncHandler(async (req, res) => {
  await listWithQuery(req, res, { userId: req.userId });
});

export const createReview = asyncHandler(async (req, res) => {
  const { bookTitle, author, genre, review, favoriteQuote, mood } = req.body;
  const cleanBookTitle = String(bookTitle || "").trim();
  const cleanAuthor = String(author || "").trim();
  const cleanGenre = String(genre || "").trim();
  const cleanReview = String(review || "").trim();
  const cleanFavoriteQuote = String(favoriteQuote || "").trim();
  const cleanMood = String(mood || "Inspiring").trim();

  if (!cleanBookTitle || !cleanAuthor || !cleanGenre || !cleanReview || !cleanFavoriteQuote) {
    return res.status(400).json({
      message: "bookTitle, author, genre, review, and favoriteQuote are required."
    });
  }

  const user = await User.findById(req.userId).select("firstName lastName email");
  if (!user) {
    return res.status(401).json({ message: "User account not found." });
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const username = fullName || user.email;

  const created = await Review.create({
    userId: req.userId,
    username,
    bookTitle: cleanBookTitle,
    author: cleanAuthor,
    genre: cleanGenre,
    mood: cleanMood,
    review: cleanReview,
    favoriteQuote: cleanFavoriteQuote
  });

  res.status(201).json({ review: created });
});

export const likeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  review.likes += 1;
  await review.save();

  res.json({ review });
});
