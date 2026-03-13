import { AnimatePresence } from "framer-motion";
import ReviewCard from "./ReviewCard";

export default function ReviewFeed({ reviews, isLoading, error, onLike }) {
  return (
    <section id="read-reviews" className="soft-panel float-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-[color:var(--text)] sm:text-2xl">Latest Reflections</h2>
        <span className="btn-ghost">{reviews.length} posts</span>
      </div>

      {isLoading && <p className="text-sm text-[color:var(--muted)]">Loading reviews...</p>}
      {error && <p className="text-sm text-soft-danger">{error}</p>}

      {!isLoading && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed border-[color:var(--line)] bg-white/70 p-5 text-sm text-[color:var(--muted)]">
          No one has written between these lines yet.
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} onLike={onLike} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
