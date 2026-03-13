import { AnimatePresence, motion } from "framer-motion";
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
    <div className="relative pt-1">
      <label htmlFor={id} className="mb-1 block text-sm font-medium tracking-wide text-[#7A5870]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="peer w-full border-0 border-b border-[#EAB9CE] bg-transparent px-0 pb-2 pt-1 font-['Inter'] text-[15px] text-[#4B3E54] placeholder:text-[#C8A8BB]/75 focus:border-[#D986AC] focus:outline-none"
      />
      <span className="pointer-events-none absolute bottom-[7px] left-0 h-[2px] w-0 bg-gradient-to-r from-[#E7AFC8] to-[#A9BDEB] transition-all duration-300 peer-focus:w-full" />
      <span className="pointer-events-none absolute bottom-[9px] right-1 h-4 w-px bg-[#D889AE] opacity-80 animate-writing-caret peer-focus:opacity-100" />
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
    <main className="auth-notebook-main flex items-center justify-center p-4 sm:p-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="auth-notebook-card relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#DDBCD3] bg-white/78 p-5 shadow-[0_26px_58px_rgba(93,74,122,0.2)] backdrop-blur-[1px] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 42px, rgba(236,188,212,0.6) 43px, transparent 44px)"
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[14%] top-0 w-px bg-[#EAB6CE]/80 sm:left-[12%]"
        />

        <div className="relative z-10 mx-auto w-full max-w-xl pl-[10%] pr-2 font-['Inter'] sm:pl-[8%]">
          <h1 className="font-['Caveat'] text-[46px] leading-none text-[#6E4E72] sm:text-[56px]">
            Welcome to Between The Lines
          </h1>
          <p className="mt-2 text-sm text-[#856F87] sm:text-[15px]">Start your reading diary.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <LinedInput
                    id="auth-name"
                    label="Name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoComplete="name"
                    placeholder="Write your name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

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

            {error && <p className="text-sm text-[#C05C7E]">{error}</p>}

            <motion.button
              type="submit"
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#E5AFC9] to-[#AABCEB] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(171,132,180,0.3)] transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving..." : buttonText}
            </motion.button>
          </form>

          <button
            type="button"
            onClick={switchMode}
            className="mt-4 text-sm font-medium text-[#8F6A91] transition hover:text-[#6C4E75]"
          >
            {switchText}
          </button>
        </div>
      </motion.section>
    </main>
  );
}
