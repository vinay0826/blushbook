import { useState } from "react";

const initialForm = {
  bookTitle: "",
  feltSummary: "",
  stayedLine: "",
  liveInWorld: "yes"
};

export default function ReviewComposer({ onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const compactSummary = form.feltSummary.trim();

    if (!form.bookTitle || !compactSummary || !form.stayedLine) {
      setError("Please fill all fields.");
      return;
    }

    if (compactSummary.length > 170) {
      setError("Emotional summary should stay short (max 170 characters).");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onCreate(form);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="write-feeling" className="soft-panel float-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-[color:var(--text)] sm:text-2xl">Write Between The Lines</h2>
        <span className="btn-ghost">No ratings, just feeling</span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="bookTitle">
            1. Book Title
          </label>
          <input
            id="bookTitle"
            className="soft-input"
            placeholder="The Song Of Achilles"
            value={form.bookTitle}
            onChange={(e) => updateField("bookTitle", e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="feltSummary">
            2. How did it make you feel?
          </label>
          <textarea
            id="feltSummary"
            rows={2}
            maxLength={170}
            className="soft-textarea min-h-[5.5rem]"
            placeholder="A short emotional summary in two lines..."
            value={form.feltSummary}
            onChange={(e) => updateField("feltSummary", e.target.value)}
          />
          <p className="mt-1 text-xs text-[color:var(--muted)]">{form.feltSummary.length}/170</p>
        </div>

        <div>
          <label className="field-label" htmlFor="stayedLine">
            3. A line that stayed with you
          </label>
          <textarea
            id="stayedLine"
            rows={3}
            className="soft-textarea"
            placeholder='Paste a quote, for example: "We are all stories in the end."'
            value={form.stayedLine}
            onChange={(e) => updateField("stayedLine", e.target.value)}
          />
        </div>

        <div>
          <p className="field-label mb-2">4. Would you live in this world?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateField("liveInWorld", "yes")}
              className={`chip ${form.liveInWorld === "yes" ? "chip-active" : ""}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => updateField("liveInWorld", "no")}
              className={`chip ${form.liveInWorld === "no" ? "chip-active" : ""}`}
            >
              No
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-soft-danger">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? "Posting..." : "Publish Reflection"}
        </button>
      </form>
    </section>
  );
}
