import { motion } from "framer-motion";
import LikeButton from "../common/LikeButton";

export default function ReviewCard({ review, onLike }) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const feltSummary = review.feltSummary || review.content || "No reflection shared yet.";
  const stayedLine = review.stayedLine || "This page stayed with me.";
  const liveInWorld = review.liveInWorld === "no" ? "No" : "Yes";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="group soft-panel float-card relative overflow-hidden p-5 sm:p-6"
    >
      <div
        className="absolute -left-10 -top-10 h-24 w-24 rounded-full blur-2xl transition group-hover:scale-110"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
      />

      <div className="relative mb-2 flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-[40ch] text-xl font-semibold text-[color:var(--text)] sm:text-2xl">
          {review.bookTitle}
        </h3>
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--chip)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--muted)]">
          {formattedDate}
        </span>
      </div>

      <div className="relative space-y-3">
        <div>
          <p className="field-label">How did it make you feel?</p>
          <p className="text-sm leading-7 text-[color:var(--text)]">{feltSummary}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--line)] bg-white/60 p-3">
          <p className="field-label">A line that stayed with you</p>
          <p className="italic text-[color:var(--text)]">"{stayedLine}"</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="field-label mb-0">Would you live in this world?</p>
          <span className="post-tag">{liveInWorld}</span>
        </div>
      </div>

      <div className="relative mt-5">
        <LikeButton count={review.likes} onClick={() => onLike(review._id)} />
      </div>
    </motion.article>
  );
}
