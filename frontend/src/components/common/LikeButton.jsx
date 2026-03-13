import { motion } from "framer-motion";

export default function LikeButton({ count, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--accent-strong)]"
    >
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        key={count}
        animate={{ scale: [1, 1.22, 1] }}
        transition={{ duration: 0.3 }}
      >
        <motion.path
          d="M12 21s-7.5-4.35-9.5-8.7C.8 8.8 3.1 5 7 5c2.2 0 3.4 1.1 5 3 1.6-1.9 2.8-3 5-3 3.9 0 6.2 3.8 4.5 7.3C19.5 16.65 12 21 12 21z"
          stroke="var(--accent-strong)"
          strokeWidth="1.5"
          fill="var(--accent)"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
      <motion.span key={`likes-${count}`} initial={{ y: 0 }} animate={{ y: [0, -1, 0] }}>
        {count}
      </motion.span>
    </motion.button>
  );
}
