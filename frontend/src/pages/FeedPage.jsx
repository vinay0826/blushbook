import { useEffect, useMemo, useRef, useState } from "react";
import { authStorage, commentApi, followApi, reviewApi } from "../api/client";

const GENRES = [
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
];

const MOODS = [
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
];

const FEED_STATE_KEY = "between_lines_feed_state";

function readFeedState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(FEED_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFeedState(state) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FEED_STATE_KEY, JSON.stringify(state));
}

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

function bulletPointsFromReview(text) {
  const clean = String(text || "").trim();
  if (!clean) return [];
  const parts = clean
    .split(/[.!?]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.slice(0, 3);
}

function moodTone(mood) {
  switch (mood) {
    case "Dark":
      return "tone-ink";
    case "Emotional":
      return "tone-rose";
    case "Romantic":
      return "tone-blush";
    case "Suspenseful":
      return "tone-indigo";
    case "Funny":
      return "tone-sun";
    case "Hopeful":
      return "tone-sky";
    case "Depressing":
      return "tone-ash";
    case "Inspirational":
      return "tone-lilac";
    case "Cozy":
      return "tone-mocha";
    case "Thought-provoking":
      return "tone-mint";
    default:
      return "tone-rose";
  }
}

export default function FeedPage() {
  const initialState = readFeedState();
  const user = currentUserFromStorage();
  const profileMenuRef = useRef(null);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const savedScrollRef = useRef(
    typeof initialState.scrollY === "number" ? initialState.scrollY : null
  );
  const restoreTargetRef = useRef(
    typeof initialState.page === "number" ? initialState.page : 1
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(initialState.searchInput || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState(initialState.sortBy || "top-liked");
  const [selectedGenres, setSelectedGenres] = useState(
    Array.isArray(initialState.selectedGenres) ? initialState.selectedGenres : []
  );
  const [selectedMoods, setSelectedMoods] = useState(
    Array.isArray(initialState.selectedMoods) ? initialState.selectedMoods : []
  );

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    bookTitle: "",
    author: "",
    genre: GENRES[0],
    mood: MOODS[1],
    review: "",
    favoriteQuote: "",
    imageUrl: ""
  });
  const [draftError, setDraftError] = useState("");
  const [submittingDraft, setSubmittingDraft] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsByReview, setCommentsByReview] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [commentError, setCommentError] = useState({});
  const [replyTarget, setReplyTarget] = useState({});
  const [followState, setFollowState] = useState({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 320);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenuOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeMenuOnOutsideClick);
  }, []);

  const requestParams = useMemo(
    () => ({
      limit: 10,
      sort: sortBy,
      search: debouncedSearch,
      genres: selectedGenres.join(","),
      moods: selectedMoods.join(",")
    }),
    [sortBy, debouncedSearch, selectedGenres, selectedMoods]
  );

  async function fetchReviews({ reset }) {
    if (isFetchingRef.current) return;
    if (!reset && !hasMore) return;

    isFetchingRef.current = true;
    setError("");

    const targetPage = reset ? 1 : page;
    if (reset) setIsLoadingInitial(true);
    if (!reset) setIsLoadingMore(true);

    try {
      const data = await reviewApi.list({ ...requestParams, page: targetPage });
      const nextReviews = data.reviews || [];
      const nextHasMore = Boolean(data.pagination?.hasMore);

      setReviews((prev) => (reset ? nextReviews : [...prev, ...nextReviews]));
      setHasMore(nextHasMore);
      setPage(targetPage + 1);
    } catch (err) {
      setError(err.message || "Unable to load reviews.");
      if (reset) {
        setReviews([]);
        setHasMore(false);
      }
    } finally {
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }

  useEffect(() => {
    setExpandedCards({});
    setPage(1);
    setHasMore(true);
    fetchReviews({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoadingInitial && !isLoadingMore) {
          fetchReviews({ reset: false });
        }
      },
      { rootMargin: "320px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingInitial, isLoadingMore, page, requestParams]);

  useEffect(() => {
    if (isLoadingInitial || isLoadingMore) return;
    const target = restoreTargetRef.current;
    if (!target || page >= target || !hasMore) {
      restoreTargetRef.current = null;
      return;
    }
    fetchReviews({ reset: false });
  }, [isLoadingInitial, isLoadingMore, page, hasMore, requestParams]);

  useEffect(() => {
    if (isLoadingInitial) return;
    if (savedScrollRef.current === null) return;

    const target = savedScrollRef.current;
    savedScrollRef.current = null;
    window.requestAnimationFrame(() => {
      window.scrollTo(0, target);
    });

    const nextState = { ...readFeedState() };
    delete nextState.scrollY;
    writeFeedState(nextState);
  }, [isLoadingInitial, reviews.length]);

  function requireAuth() {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
      return false;
    }
    return true;
  }

  function toggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
    );
  }

  function toggleMood(mood) {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((item) => item !== mood) : [...prev, mood]
    );
  }

  function clearFilters() {
    setSelectedGenres([]);
    setSelectedMoods([]);
    setSortBy("top-liked");
    setSearchInput("");
  }

  function toggleExpanded(reviewId) {
    setExpandedCards((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  }

  async function handleLike(reviewId) {
    if (!requireAuth()) return;
    try {
      const data = await reviewApi.like(reviewId);
      setReviews((prev) =>
        prev.map((review) => (review._id === reviewId ? data.review : review))
      );
    } catch (err) {
      setError(err.message || "Unable to update likes right now.");
    }
  }

  async function handleRepost(reviewId) {
    if (!requireAuth()) return;
    try {
      await reviewApi.repost(reviewId);
      setPage(1);
      setHasMore(true);
      await fetchReviews({ reset: true });
    } catch (err) {
      setError(err.message || "Unable to repost right now.");
    }
  }

  async function handleFollow(userId) {
    if (!requireAuth()) return;
    try {
      const data = await followApi.toggle(userId);
      setFollowState((prev) => ({ ...prev, [userId]: data.following }));
    } catch (err) {
      setError(err.message || "Unable to follow right now.");
    }
  }

  function goToUser(userId) {
    if (!userId) return;
    writeFeedState({
      searchInput,
      sortBy,
      selectedGenres,
      selectedMoods,
      page,
      scrollY: window.scrollY
    });
    window.location.assign(`/user/${userId}`);
  }

  function goToPost(reviewId) {
    writeFeedState({
      searchInput,
      sortBy,
      selectedGenres,
      selectedMoods,
      page,
      scrollY: window.scrollY
    });
    window.location.assign(`/post/${reviewId}`);
  }

  async function handleDelete(reviewId) {
    if (!requireAuth()) return;
    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    try {
      await reviewApi.remove(reviewId);
      setPage(1);
      setHasMore(true);
      await fetchReviews({ reset: true });
    } catch (err) {
      setError(err.message || "Unable to delete this post.");
    }
  }

  function openModal() {
    if (!requireAuth()) return;
    setDraftError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function submitDraft(event) {
    event.preventDefault();

    if (!draft.bookTitle || !draft.genre || !draft.review) {
      setDraftError("Please fill the book title, genre, and review.");
      return;
    }

    setSubmittingDraft(true);
    setDraftError("");
    try {
      await reviewApi.create(draft);
      setDraft({
        bookTitle: "",
        author: "",
        genre: GENRES[0],
        mood: MOODS[1],
        review: "",
        favoriteQuote: "",
        imageUrl: ""
      });
      setIsModalOpen(false);
      setPage(1);
      setHasMore(true);
      await fetchReviews({ reset: true });
    } catch (err) {
      setDraftError(err.message || "Unable to publish review.");
    } finally {
      setSubmittingDraft(false);
    }
  }

  function handleProfileAction(action) {
    setProfileOpen(false);
    if (action === "profile") {
      window.location.assign("/profile");
    }
    if (action === "logout") {
      authStorage.clear();
      window.location.assign("/login");
    }
  }

  async function loadComments(reviewId) {
    setCommentLoading((prev) => ({ ...prev, [reviewId]: true }));
    setCommentError((prev) => ({ ...prev, [reviewId]: "" }));
    try {
      const data = await commentApi.list(reviewId);
      setCommentsByReview((prev) => ({ ...prev, [reviewId]: data.comments || [] }));
    } catch (err) {
      setCommentError((prev) => ({ ...prev, [reviewId]: err.message || "Unable to load comments." }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  }

  function toggleComments(reviewId) {
    setCommentsOpen((prev) => {
      const next = !prev[reviewId];
      if (next && !commentsByReview[reviewId] && !commentLoading[reviewId]) {
        loadComments(reviewId);
      }
      return { ...prev, [reviewId]: next };
    });
  }

  function updateCommentDraft(reviewId, value) {
    setCommentDrafts((prev) => ({ ...prev, [reviewId]: value }));
  }

  function setReply(reviewId, comment) {
    setReplyTarget((prev) => ({
      ...prev,
      [reviewId]: { id: comment._id, username: comment.username || "Reader" }
    }));
  }

  function clearReply(reviewId) {
    setReplyTarget((prev) => ({ ...prev, [reviewId]: null }));
  }

  async function submitComment(event, reviewId) {
    event.preventDefault();
    if (!requireAuth()) return;

    const draftValue = String(commentDrafts[reviewId] || "").trim();
    if (!draftValue) {
      setCommentError((prev) => ({ ...prev, [reviewId]: "Write something first." }));
      return;
    }

    setCommentLoading((prev) => ({ ...prev, [reviewId]: true }));
    setCommentError((prev) => ({ ...prev, [reviewId]: "" }));

    try {
      await commentApi.create(reviewId, {
        content: draftValue,
        parentId: replyTarget[reviewId]?.id || null
      });
      setCommentDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyTarget((prev) => ({ ...prev, [reviewId]: null }));
      await loadComments(reviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? { ...review, commentsCount: (review.commentsCount || 0) + 1 }
            : review
        )
      );
    } catch (err) {
      setCommentError((prev) => ({ ...prev, [reviewId]: err.message || "Unable to post comment." }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  }

  function renderComments(items, reviewId, level = 0) {
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
          <button type="button" className="comment-reply" onClick={() => setReply(reviewId, comment)}>
            Reply
          </button>
        </div>
        <p className="comment-body">{comment.content}</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-children">{renderComments(comment.replies, reviewId, level + 1)}</div>
        )}
      </div>
    ));
  }

  return (
    <div className="feed-page">
      <header className="feed-header">
        <div className="feed-header-inner">
          <div className="feed-brand">
            <span className="feed-brand-badge">B</span>
            <div>
              <p className="feed-brand-title">Between The Lines</p>
              <p className="feed-brand-subtitle">Book feed</p>
            </div>
          </div>

          <div className="feed-header-actions">
            <button
              type="button"
              className="feed-chat-button"
              onClick={() => window.location.assign("/chat")}
            >
              Chats
            </button>

            <div ref={profileMenuRef} className="feed-profile">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="feed-profile-button"
              >
                <span className="feed-profile-avatar">
                  {initialsFromName(displayUserName(user))}
                </span>
                <span className="feed-profile-name">{displayUserName(user)}</span>
              </button>

              {profileOpen && (
                <div className="feed-profile-menu">
                  <button type="button" onClick={() => handleProfileAction("profile")}>My Profile</button>
                  <button type="button" onClick={() => handleProfileAction("logout")} className="danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="feed-search-row">
          <label className="sr-only" htmlFor="feed-search">
            Search by book name or username
          </label>
          <input
            id="feed-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by book name or username"
            className="feed-search-input"
          />
        </div>
      </header>

      <main className="feed-main fade-in">
        <div className="feed-grid">
          <aside className="feed-sidebar left">
            <section className="feed-panel">
              <h2 className="feed-panel-title">Genres</h2>
              <div className="feed-pill-group">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={selectedGenres.includes(genre) ? "feed-pill active" : "feed-pill"}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section className="feed-center">
            <div className="feed-mobile-panel">
              <div className="feed-mobile-row">
                <label className="feed-mobile-sort">
                  <span>Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="feed-select"
                  >
                    <option value="top-liked">Most Liked</option>
                    <option value="recent">Recent</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="feed-mobile-toggle"
                  onClick={() => setMobileFiltersOpen((prev) => !prev)}
                >
                  {mobileFiltersOpen ? "Hide filters" : "Show filters"}
                </button>
              </div>

              {mobileFiltersOpen && (
                <div className="feed-mobile-filters">
                  <div className="feed-mobile-section">
                    <p className="feed-panel-title">Genres</p>
                    <div className="feed-pill-group">
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={
                            selectedGenres.includes(genre) ? "feed-pill active" : "feed-pill"
                          }
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="feed-mobile-section">
                    <p className="feed-panel-title">Moods</p>
                    <div className="feed-chip-group">
                      {MOODS.map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => toggleMood(mood)}
                          className={`${selectedMoods.includes(mood) ? "feed-chip active" : "feed-chip"} ${moodTone(mood)}`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={clearFilters} className="feed-reset">
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            <div className="feed-panel">
              <p className="feed-helper-text">
                {isLoadingInitial ? "Loading reviews..." : `${reviews.length} reviews loaded`}
              </p>
              {error && <p className="feed-error-text">{error}</p>}
            </div>

            {!isLoadingInitial && reviews.length === 0 && (
              <div className="feed-empty">No one has written between these lines yet.</div>
            )}

            {reviews.map((review) => {
              const isExpanded = !!expandedCards[review._id];
              const bodyText = String(review.review || "");
              const preview =
                isExpanded || bodyText.length <= 220
                  ? bodyText
                  : `${bodyText.slice(0, 220)}...`;
              const followKey = String(review.userId || "");
              const isFollowing = followState[followKey] ?? review.isFollowingAuthor;
              const canFollow = user && followKey && String(user.id) !== followKey;
              const isOwner = user && followKey && String(user.id) === followKey;
              const comments = commentsByReview[review._id] || [];
              const showComments = !!commentsOpen[review._id];
              const replyInfo = replyTarget[review._id];
              const commentValue = commentDrafts[review._id] || "";
              const bullets = bulletPointsFromReview(bodyText);

              return (
                <article
                  key={review._id}
                  className="review-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => goToPost(review._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") goToPost(review._id);
                  }}
                >
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
                        onClick={(event) => {
                          event.stopPropagation();
                          goToUser(review.userId);
                        }}
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
                        className={isFollowing ? "review-follow active" : "review-follow"}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleFollow(followKey);
                        }}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>

                  <div className="review-entry">
                    {review.imageUrl && (
                      <div className="review-media">
                        <div className="review-image-wrap">
                          <img
                            src={review.imageUrl}
                            alt={`Theme for ${review.bookTitle}`}
                            loading="lazy"
                            className="review-image"
                          />
                        </div>
                      </div>
                    )}

                    <div className="review-content">
                      <h3 className="review-title">{review.bookTitle}</h3>
                      {review.author && <p className="review-author">by {review.author}</p>}

                      <div className="review-divider" />

                      {bullets.length > 0 ? (
                        <div className="review-bullets">
                          <p className="review-bullets-title">What I liked</p>
                          <ul>
                            {bullets.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="review-body">{preview}</p>
                      )}

                      {review.favoriteQuote && (
                        <blockquote className="review-quote">"{review.favoriteQuote}"</blockquote>
                      )}
                    </div>
                  </div>

                  <div className="review-tags">
                    <span className="review-tag genre">{review.genre}</span>
                    {review.mood && <span className="review-tag mood">{review.mood}</span>}
                  </div>

                  <div className="review-actions">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLike(review._id);
                      }}
                    >
                      ❤️ Like ({review.likes || 0})
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleComments(review._id);
                      }}
                    >
                      {showComments
                        ? "Hide comments"
                        : `Comments (${review.commentsCount || 0})`}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRepost(review._id);
                      }}
                    >
                      🔁 Repost
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        className="danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(review._id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      className="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpanded(review._id);
                      }}
                    >
                      {isExpanded ? "Hide review" : "View full review"}
                    </button>
                  </div>

                  {showComments && (
                    <div
                      className="review-comments"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {commentLoading[review._id] && <p className="comment-info">Loading comments...</p>}
                      {commentError[review._id] && (
                        <p className="comment-error">{commentError[review._id]}</p>
                      )}
                      {!commentLoading[review._id] && comments.length === 0 && (
                        <p className="comment-info">Be the first to comment.</p>
                      )}
                      <div className="comment-list">{renderComments(comments, review._id)}</div>

                      {window.localStorage.getItem(authStorage.tokenKey) ? (
                        <form className="comment-form" onSubmit={(event) => submitComment(event, review._id)}>
                          {replyInfo && (
                            <div className="comment-replying">
                              Replying to {replyInfo.username}
                              <button type="button" onClick={() => clearReply(review._id)}>
                                Cancel
                              </button>
                            </div>
                          )}
                          <textarea
                            rows={2}
                            placeholder="Write a thoughtful reply..."
                            value={commentValue}
                            onChange={(event) => updateCommentDraft(review._id, event.target.value)}
                            className="comment-textarea"
                          />
                          <div className="comment-actions">
                            <button type="submit" disabled={commentLoading[review._id]}>
                              {commentLoading[review._id] ? "Posting..." : "Post comment"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="comment-login">Login to join this thread.</p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            <div ref={sentinelRef} className="feed-sentinel">
              {isLoadingMore && <p>Loading more...</p>}
              {!hasMore && reviews.length > 0 && <p>You reached the end.</p>}
            </div>
          </section>

          <aside className="feed-sidebar right">
            <section className="feed-panel">
              <h2 className="feed-panel-title">Sort</h2>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="feed-select"
              >
                <option value="top-liked">Most Liked</option>
                <option value="recent">Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </section>

            <section className="feed-panel">
              <h2 className="feed-panel-title">Mood Filters</h2>
              <div className="feed-chip-group">
                {MOODS.map((mood) => {
                  const active = selectedMoods.includes(mood);
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => toggleMood(mood)}
                      className={`${active ? "feed-chip active" : "feed-chip"} ${moodTone(mood)}`}
                    >
                      {mood}
                    </button>
                  );
                })}
              </div>
            </section>

            <button type="button" onClick={clearFilters} className="feed-reset">
              Reset Filters
            </button>
          </aside>
        </div>
      </main>

      <button type="button" onClick={openModal} className="feed-fab">
        ✍️ Write Review
      </button>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card fade-in" onClick={(event) => event.stopPropagation()}>
            <h2>Write Review</h2>
            <p className="modal-subtitle">Post your review to the community feed.</p>

            <form className="modal-form" onSubmit={submitDraft}>
              <label className="modal-field">
                <span>Book Name</span>
                <input
                  type="text"
                  value={draft.bookTitle}
                  onChange={(event) => updateDraft("bookTitle", event.target.value)}
                />
              </label>

              <label className="modal-field">
                <span>Author (optional)</span>
                <input
                  type="text"
                  value={draft.author}
                  onChange={(event) => updateDraft("author", event.target.value)}
                />
              </label>

              <div className="modal-grid">
                <label className="modal-field">
                  <span>Genre</span>
                  <select
                    value={draft.genre}
                    onChange={(event) => updateDraft("genre", event.target.value)}
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modal-field">
                  <span>Mood Tag</span>
                  <select
                    value={draft.mood}
                    onChange={(event) => updateDraft("mood", event.target.value)}
                  >
                    {MOODS.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="modal-field">
                <span>Image URL (optional)</span>
                <input
                  type="url"
                  value={draft.imageUrl}
                  onChange={(event) => updateDraft("imageUrl", event.target.value)}
                  placeholder="https://"
                />
              </label>

              <label className="modal-field">
                <span>Review</span>
                <textarea
                  rows={4}
                  value={draft.review}
                  onChange={(event) => updateDraft("review", event.target.value)}
                />
              </label>

              <label className="modal-field">
                <span>Favorite Quote (optional)</span>
                <input
                  type="text"
                  value={draft.favoriteQuote}
                  onChange={(event) => updateDraft("favoriteQuote", event.target.value)}
                />
              </label>

              {draftError && <p className="modal-error">{draftError}</p>}

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingDraft}>
                  {submittingDraft ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
