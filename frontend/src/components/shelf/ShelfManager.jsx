import { useMemo, useState } from "react";
import { SHELF_STATUSES } from "../../utils/constants";

export default function ShelfManager({ items, onCreate, onRemove, error }) {
  const [bookTitle, setBookTitle] = useState("");
  const [status, setStatus] = useState("currently-reading");
  const [actionError, setActionError] = useState("");

  const grouped = useMemo(() => {
    return SHELF_STATUSES.reduce((acc, current) => {
      acc[current.value] = items.filter((item) => item.status === current.value);
      return acc;
    }, {});
  }, [items]);

  async function handleAdd(event) {
    event.preventDefault();
    if (!bookTitle) {
      setActionError("Please enter a book title.");
      return;
    }
    setActionError("");
    await onCreate({ bookTitle, status });
    setBookTitle("");
  }

  return (
    <section className="soft-panel float-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--text)] sm:text-2xl">My Shelf of Feelings</h2>
          <p className="text-xs text-[color:var(--muted)] sm:text-sm">The stories that shaped me.</p>
        </div>
        <span className="btn-ghost">{items.length} saved</span>
      </div>

      <form onSubmit={handleAdd} className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          className="soft-input"
          placeholder="Add a book to shelf..."
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="soft-select">
          {SHELF_STATUSES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary min-h-[2.8rem] px-5 text-sm">
          Save
        </button>
      </form>

      {(error || actionError) && <p className="mb-4 text-sm text-soft-danger">{error || actionError}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SHELF_STATUSES.map((column) => (
          <div
            key={column.value}
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--chip)]/75 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--text)]">{column.label}</p>
              <span className="text-xs text-[color:var(--muted)]">
                {(grouped[column.value] || []).length}
              </span>
            </div>

            <ul className="space-y-2.5">
              {(grouped[column.value] || []).map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--line)] bg-white/90 px-3 py-2 text-sm text-[color:var(--text)]"
                >
                  <span className="break-words leading-5">{item.bookTitle}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(item._id)}
                    className="text-xs font-semibold text-[color:var(--accent-strong)] hover:opacity-75"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
