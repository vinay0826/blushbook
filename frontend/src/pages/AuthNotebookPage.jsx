import { useEffect, useMemo, useState } from "react";
import { authApi, authStorage } from "../api/client";

function LinedInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder
}) {
  return (
    <div className="lined-input">
      <label htmlFor={id} className="lined-input-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="lined-input-field"
      />
      <span className="lined-input-accent" />
      <span className="lined-input-caret animate-writing-caret" />
    </div>
  );
}

export default function AuthNotebookPage({ initialMode = "register" }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isRegister = mode === "register";

  const buttonText = useMemo(
    () => (isRegister ? "Start My Reading Diary" : "Continue My Story"),
    [isRegister]
  );

  const switchText = useMemo(
    () =>
      isRegister
        ? "Already part of the story? Continue writing ->"
        : "New to the story? Start writing ->",
    [isRegister]
  );

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function switchMode() {
    setError("");
    setMode((prev) => {
      const next = prev === "register" ? "login" : "register";
      const nextPath = next === "register" ? "/register" : "/login";
      window.history.replaceState({}, "", nextPath);
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email || !form.password || (isRegister && !form.name)) {
      setError("Please fill all fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = isRegister
        ? await authApi.register({
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.password
          })
        : await authApi.login({
            email: form.email,
            password: form.password
          });

      authStorage.saveAuth(data.token, data.user);
      window.location.assign("/journal");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-notebook-main">
      <section className="auth-notebook-card fade-in">
        <div
          aria-hidden="true"
          className="auth-notebook-lines"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 42px, rgba(236,188,212,0.6) 43px, transparent 44px)"
          }}
        />
        <div
          aria-hidden="true"
          className="auth-notebook-margin"
        />

        <div className="auth-notebook-content">
          <h1 className="auth-notebook-title">
            Welcome to Between The Lines
          </h1>
          <p className="auth-notebook-subtitle">Start your reading diary.</p>

          <form className="auth-notebook-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="fade-in-fast">
                <LinedInput
                  id="auth-name"
                  label="Name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  autoComplete="name"
                  placeholder="Write your name"
                />
              </div>
            )}

            <LinedInput
              id="auth-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              placeholder="Write your email"
            />

            <LinedInput
              id="auth-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Write your password"
            />

            {error && <p className="auth-notebook-error">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="auth-notebook-submit"
            >
              {submitting ? "Saving..." : buttonText}
            </button>
          </form>

          <button type="button" onClick={switchMode} className="auth-notebook-switch">
            {switchText}
          </button>
        </div>
      </section>
    </main>
  );
}
