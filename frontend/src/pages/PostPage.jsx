import { useEffect, useState } from "react";
import { authStorage, commentApi, followApi, reviewApi } from "../api/client";

function currentUserFromStorage() {
  try {
    const raw = window.localStorage.getItem("between_the_lines_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function displayUserName(user) {
  if (!user) return "Reader";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.email || "Reader";
}

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default function PostPage() {
  const user = currentUserFromStorage();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [followState, setFollowState] = useState(false);

  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const reviewId = path.split("/post/")[1] || "";

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/feed");
  }

  useEffect(() => {
    async function loadReview() {
      setLoading(true);
      setError("");
      try {
        const data = await reviewApi.getById(reviewId);
        setReview(data.review);
        setFollowState(Boolean(data.review?.isFollowingAuthor));
      } catch (err) {
        setError(err.message || "Unable to load this post.");
      } finally {
        setLoading(false);
      }
    }

    if (reviewId) {
      loadReview();
    }
  }, [reviewId]);

  useEffect(() => {
    async function loadComments() {
      setCommentLoading(true);
      setCommentError("");
      try {
        const data = await commentApi.list(reviewId);
        setComments(data.comments || []);
      } catch (err) {
        setCommentError(err.message || "Unable to load comments.");
      } finally {
        setCommentLoading(false);
      }
    }

    if (reviewId) {
      loadComments();
    }
  }, [reviewId]);

  function requireAuth() {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
      return false;
    }
    return true;
  }

  async function handleLike() {
    if (!review) return;
    if (!requireAuth()) return;
    try {
      const data = await reviewApi.like(review._id);
      setReview(data.review);
    } catch (err) {
      setError(err.message || "Unable to update likes right now.");
    }
  }

  async function handleRepost() {
    if (!review) return;
    if (!requireAuth()) return;
    try {
      await reviewApi.repost(review._id);
      const data = await reviewApi.getById(review._id);
      setReview(data.review);
    } catch (err) {
      setError(err.message || "Unable to repost right now.");
    }
  }

  async function handleDelete() {
    if (!review) return;
    if (!requireAuth()) return;
    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    try {
      await reviewApi.remove(review._id);
      window.location.assign("/feed");
    } catch (err) {
      setError(err.message || "Unable to delete this post.");
    }
  }

  async function handleFollow() {
    if (!review) return;
    if (!requireAuth()) return;
    try {
      const data = await followApi.toggle(review.userId);
      setFollowState(Boolean(data.following));
    } catch (err) {
      setError(err.message || "Unable to follow right now.");
    }
  }

  function setReply(comment) {
    setReplyTarget({ id: comment._id, username: comment.username || "Reader" });
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!review) return;
    if (!requireAuth()) return;

    const clean = commentDraft.trim();
    if (!clean) {
      setCommentError("Write something first.");
      return;
    }

    setCommentLoading(true);
    setCommentError("");
    try {
      await commentApi.create(review._id, {
        content: clean,
        parentId: replyTarget?.id || null
      });
      setCommentDraft("");
      setReplyTarget(null);
      const data = await commentApi.list(review._id);
      setComments(data.comments || []);
      setReview((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev));
    } catch (err) {
      setCommentError(err.message || "Unable to post comment.");
    } finally {
      setCommentLoading(false);
    }
  }

  function renderComments(items, level = 0) {
    if (!items || items.length === 0) return null;
    return items.map((comment) => (
      <div
        key={comment._id}
        className="comment-item"
        style={{ marginLeft: level ? `${level * 16}px` : 0 }}
      >
        <div className="comment-header">
          <div className="comment-header-main">
            <div className="comment-avatar">{initialsFromName(comment.username)}</div>
            <div>
              <p className="comment-name">{comment.username || "Reader"}</p>
              <p className="comment-date">{formatDate(comment.createdAt)}</p>
            </div>
          </div>
          <button type="button" className="comment-reply" onClick={() => setReply(comment)}>
            Reply
          </button>
        </div>
        <p className="comment-body">{comment.content}</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-children">{renderComments(comment.replies, level + 1)}</div>
        )}
      </div>
    ));
  }

  if (loading) {
    return (
      <div className="post-page fade-in">
        <p className="post-info">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-page fade-in">
        <button type="button" className="post-back" onClick={goBack}>
          Back to feed
        </button>
        <p className="post-error">{error}</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="post-page fade-in">
        <button type="button" className="post-back" onClick={goBack}>
          Back to feed
        </button>
        <p className="post-info">Post not found.</p>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(review.userId);
  const canFollow = user && String(user.id) !== String(review.userId);

  return (
    <div className="post-page fade-in">
      <button type="button" className="post-back" onClick={goBack}>
        Back to feed
      </button>

      <article className="post-card">
        {review.isRepost && (
          <div className="review-repost-banner">
            Reposted from {review.repostOf?.username || "a reader"}
          </div>
        )}

        <div className="review-header">
          <div className="review-header-main">
            <button
              type="button"
              className="review-avatar-button"
              onClick={() => window.location.assign(`/user/${review.userId}`)}
            >
              <span className="review-avatar">
                {initialsFromName(review.username || "Reader")}
              </span>
            </button>
            <div>
              <p className="review-entry-by">📖 Entry by {review.username || "Reader"}</p>
              <p className="review-date">Written on {formatDate(review.createdAt)}</p>
            </div>
          </div>
          {canFollow && (
            <button
              type="button"
              className={followState ? "review-follow active" : "review-follow"}
              onClick={handleFollow}
            >
              {followState ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <h1 className="post-title">{review.bookTitle}</h1>
        {review.author && <p className="review-author">by {review.author}</p>}

        {review.imageUrl && (
          <div className="review-image-wrap">
            <img
              src={review.imageUrl}
              alt={`Theme for ${review.bookTitle}`}
              loading="lazy"
              className="review-image"
            />
          </div>
        )}

        <div className="review-divider" />
        <p className="review-body">{review.review}</p>
        {review.favoriteQuote && (
          <blockquote className="review-quote">"{review.favoriteQuote}"</blockquote>
        )}

        <div className="review-tags">
          <span className="review-tag genre">{review.genre}</span>
          {review.mood && <span className="review-tag mood">{review.mood}</span>}
        </div>

        <div className="post-actions">
          <button type="button" onClick={handleLike}>
            ❤️ Like ({review.likes || 0})
          </button>
          <button type="button" onClick={handleRepost}>🔁 Repost</button>
          <span className="post-comments-count">Comments: {review.commentsCount || 0}</span>
          {isOwner && (
            <button type="button" className="danger" onClick={handleDelete}>
              Delete post
            </button>
          )}
        </div>
      </article>

      <section className="post-comments">
        <h2>Thread</h2>
        {commentLoading && <p className="comment-info">Loading comments...</p>}
        {commentError && <p className="comment-error">{commentError}</p>}
        {!commentLoading && comments.length === 0 && (
          <p className="comment-info">Be the first to comment.</p>
        )}
        <div className="comment-list">{renderComments(comments)}</div>

        {window.localStorage.getItem(authStorage.tokenKey) ? (
          <form className="comment-form" onSubmit={submitComment}>
            {replyTarget && (
              <div className="comment-replying">
                Replying to {replyTarget.username}
                <button type="button" onClick={() => setReplyTarget(null)}>
                  Cancel
                </button>
              </div>
            )}
            <textarea
              rows={2}
              placeholder="Write a thoughtful reply..."
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              className="comment-textarea"
            />
            <div className="comment-actions">
              <button type="submit" disabled={commentLoading}>
                {commentLoading ? "Posting..." : "Post comment"}
              </button>
            </div>
          </form>
        ) : (
          <p className="comment-login">Login to join this thread.</p>
        )}
      </section>
    </div>
  );
}
