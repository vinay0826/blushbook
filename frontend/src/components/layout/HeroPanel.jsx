import { motion } from "framer-motion";

export default function HeroPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="soft-panel p-6 sm:p-8"
    >
      <div className="max-w-3xl">
        <h1 className="font-display text-5xl leading-tight text-[color:var(--text)] sm:text-6xl">
          Between The Lines
        </h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          {"Some stories don't end on the last page.\nThey stay in us."}
        </p>
      </div>

      <div className="book-showcase mt-7">
        <div className="book-shell">
          <div className="book-page">
            <p className="field-label">Start Writing</p>
            <h2 className="book-title">Write A Review</h2>
            <p className="book-copy">Share what this story changed in you.</p>
            <a href="#write-feeling" className="btn-primary mt-5 inline-flex text-sm">
              Write a Review
            </a>
          </div>

          <div className="book-spine" aria-hidden="true" />

          <div className="book-page">
            <p className="field-label">Explore Voices</p>
            <h2 className="book-title">Read Reviews</h2>
            <p className="book-copy">See how the same book lived differently in others.</p>
            <a href="#read-reviews" className="btn-primary mt-5 inline-flex text-sm">
              Read Reviews
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
