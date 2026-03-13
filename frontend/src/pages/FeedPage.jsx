import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { authStorage, reviewApi } from "../api/client";

const GENRES = ["Fantasy", "Romance", "Mystery", "Thriller", "Sci-Fi", "Non-fiction"];
const MOODS = ["Heartwarming", "Dark", "Inspiring", "Mind-bending", "Comforting"];
const DISCOVER_OPTIONS = [
  { value: "all", label: "All Reviews" },
  { value: "trending", label: "Trending" },
  { value: "most-loved", label: "Most Loved" }
];

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

export default function FeedPage() {
  const user = currentUserFromStorage();
  const profileMenuRef = useRef(null);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [sortBy, setSortBy] = useState("top-liked");
  const [discover, setDiscover] = useState("all");
  const [showDiscoverFilters, setShowDiscoverFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);

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
    mood: MOODS[2],
    review: "",
    favoriteQuote: ""
  });
  const [draftError, setDraftError] = useState("");
  const [submittingDraft, setSubmittingDraft] = useState(false);

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
      moods: selectedMoods.join(","),
      discover: discover === "all" ? "" : discover
    }),
    [sortBy, debouncedSearch, selectedGenres, selectedMoods, discover]
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
      const api = scope === "mine" ? reviewApi.listMine : reviewApi.list;
      const data = await api({ ...requestParams, page: targetPage });
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
  }, [scope, requestParams]);

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
  }, [hasMore, isLoadingInitial, isLoadingMore, page, scope, requestParams]);

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
    setDiscover("all");
    setSortBy("top-liked");
    setSearchInput("");
  }

  function toggleExpanded(reviewId) {
    setExpandedCards((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  }

  async function handleLike(reviewId) {
    try {
      const data = await reviewApi.like(reviewId);
      setReviews((prev) =>
        prev.map((review) => (review._id === reviewId ? data.review : review))
      );
    } catch (err) {
      setError(err.message || "Unable to update likes right now.");
    }
  }

  function openModal() {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
      return;
    }
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

    if (!draft.bookTitle || !draft.author || !draft.genre || !draft.review || !draft.favoriteQuote) {
      setDraftError("Please fill all fields.");
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
        mood: MOODS[2],
        review: "",
        favoriteQuote: ""
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
    if (action === "mine") {
      const token = window.localStorage.getItem(authStorage.tokenKey);
      if (!token) {
        window.location.assign("/login");
        return;
      }
      setScope("mine");
    }
    if (action === "all") setScope("all");
    if (action === "logout") {
      authStorage.clear();
      window.location.assign("/login");
    }
  }

  return (
    <div className="min-h-screen text-slate-700">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-[0_10px_28px_rgba(117,142,180,0.15)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-[0_8px_22px_rgba(117,142,180,0.12)]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-200 to-rose-200 text-sm font-bold text-slate-700">
                B
              </span>
              <div>
                <p className="text-[0.93rem] font-semibold leading-none tracking-tight text-slate-700">
                  Between The Lines
                </p>
                <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.2em] text-slate-400">Book feed</p>
              </div>
            </div>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(117,142,180,0.12)] transition hover:-translate-y-0.5 hover:border-sky-200"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-rose-200 to-sky-200 text-xs font-bold text-slate-700">
                  {initialsFromName(displayUserName(user))}
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">{displayUserName(user)}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-30 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleProfileAction("mine")}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    My Posts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileAction("all")}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    Explore Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileAction("logout")}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="w-full max-w-2xl">
              <label className="sr-only" htmlFor="feed-search">
                Search by book name or username
              </label>
              <input
                id="feed-search"
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by book name or username"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-[0_8px_20px_rgba(117,142,180,0.12)] outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={openModal}
              className="rounded-full bg-gradient-to-r from-sky-300 to-rose-300 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
            >
              Write Review
            </button>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_6px_16px_rgba(117,142,180,0.1)]">
              {scope === "mine" ? "Showing: My Posts" : "Showing: All Reviews"}
            </span>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6"
      >
        <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_290px]">
          <aside className="order-2 space-y-4 xl:order-1">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Navigation
              </h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    scope === "all"
                      ? "bg-gradient-to-r from-sky-200 to-rose-200 font-semibold text-slate-700"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Reviews
                </button>
                <button
                  type="button"
                  onClick={() => handleProfileAction("mine")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    scope === "mine"
                      ? "bg-gradient-to-r from-sky-200 to-rose-200 font-semibold text-slate-700"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  My Posts
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Genres
              </h2>
              <div className="space-y-2">
                {GENRES.map((genre) => (
                  <label key={genre} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200"
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </section>
          </aside>

          <section className="order-1 space-y-4 xl:order-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <p className="text-sm text-slate-600">
                {isLoadingInitial ? "Loading reviews..." : `${reviews.length} reviews loaded`}
              </p>
              {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
            </div>

            {!isLoadingInitial && reviews.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
                No one has written between these lines yet.
              </div>
            )}

            <AnimatePresence>
              {reviews.map((review) => {
                const isExpanded = !!expandedCards[review._id];
                const bodyText = String(review.review || "");
                const preview =
                  isExpanded || bodyText.length <= 220 ? bodyText : `${bodyText.slice(0, 220)}...`;

                return (
                  <motion.article
                    key={review._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ y: -3 }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(117,142,180,0.16)]"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-200 to-rose-200 text-sm font-bold text-slate-700 shadow-sm">
                        {initialsFromName(review.username || "Reader")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{review.username || "Reader"}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700">{review.bookTitle}</h3>
                    <p className="mt-1 text-sm text-slate-500">by {review.author}</p>

                    <p className="mt-3 text-sm leading-7 text-slate-600">{preview}</p>
                    <blockquote className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-600">
                      "{review.favoriteQuote}"
                    </blockquote>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        {review.genre}
                      </span>
                      {review.mood && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                          {review.mood}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleLike(review._id)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Like ({review.likes || 0})
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Comment ({review.commentsCount || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(review._id)}
                        className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
                      >
                        {isExpanded ? "Hide review" : "View full review"}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            <div ref={sentinelRef} className="h-8">
              {isLoadingMore && <p className="text-center text-sm text-slate-500">Loading more...</p>}
              {!hasMore && reviews.length > 0 && (
                <p className="text-center text-sm text-slate-400">You reached the end.</p>
              )}
            </div>
          </section>

          <aside className="order-3 space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Sort</h2>
              <label className="sr-only" htmlFor="sort-by">
                Sort reviews
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="top-liked">Top Rated (Likes)</option>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Mood Filters
              </h2>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => {
                  const active = selectedMoods.includes(mood);
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => toggleMood(mood)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-sky-300 to-rose-300 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {mood}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(117,142,180,0.14)]">
              <button
                type="button"
                onClick={() => setShowDiscoverFilters((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Discover (Optional)
                </span>
                <span className="text-sm text-slate-400">{showDiscoverFilters ? "-" : "+"}</span>
              </button>

              {showDiscoverFilters && (
                <div className="mt-3 space-y-2">
                  {DISCOVER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDiscover(option.value)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                        discover === option.value
                          ? "bg-gradient-to-r from-sky-200 to-rose-200 font-semibold text-slate-700"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-[0_8px_20px_rgba(117,142,180,0.1)] transition hover:bg-slate-100"
            >
              Reset Filters
            </button>
          </aside>
        </div>
      </motion.main>

      <button
        type="button"
        onClick={openModal}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-gradient-to-r from-sky-300 to-rose-300 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1"
      >
        Write Review
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-40 grid place-items-center bg-slate-900/35 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-slate-700">Write Review</h2>
              <p className="mt-1 text-sm text-slate-500">Post your review to the community feed.</p>

              <form className="mt-4 space-y-3" onSubmit={submitDraft}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-book-title">
                    Book Name
                  </label>
                  <input
                    id="draft-book-title"
                    type="text"
                    value={draft.bookTitle}
                    onChange={(event) => updateDraft("bookTitle", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-author">
                    Author
                  </label>
                  <input
                    id="draft-author"
                    type="text"
                    value={draft.author}
                    onChange={(event) => updateDraft("author", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-genre">
                      Genre
                    </label>
                    <select
                      id="draft-genre"
                      value={draft.genre}
                      onChange={(event) => updateDraft("genre", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    >
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-mood">
                      Mood Tag
                    </label>
                    <select
                      id="draft-mood"
                      value={draft.mood}
                      onChange={(event) => updateDraft("mood", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    >
                      {MOODS.map((mood) => (
                        <option key={mood} value={mood}>
                          {mood}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-review">
                    Review
                  </label>
                  <textarea
                    id="draft-review"
                    rows={4}
                    value={draft.review}
                    onChange={(event) => updateDraft("review", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="draft-favorite-quote">
                    Favorite Quote
                  </label>
                  <input
                    id="draft-favorite-quote"
                    type="text"
                    value={draft.favoriteQuote}
                    onChange={(event) => updateDraft("favoriteQuote", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                {draftError && <p className="text-sm text-rose-500">{draftError}</p>}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDraft}
                    className="rounded-full bg-gradient-to-r from-sky-300 to-rose-300 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submittingDraft ? "Posting..." : "Post Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
