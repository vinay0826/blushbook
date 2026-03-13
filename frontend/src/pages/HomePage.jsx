import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    document.body.classList.add("home-page-lock");
    document.documentElement.classList.add("home-page-lock");

    return () => {
      document.body.classList.remove("home-page-lock");
      document.documentElement.classList.remove("home-page-lock");
    };
  }, []);

  return (
    <main className="landing-wrap">
      <section className="landing-card">
        <p className="landing-kicker">Quiet Reading Space</p>
        <h1 className="font-display landing-title">Between The Lines</h1>

        <p className="landing-tagline">
          A quiet space for readers to leave pieces of themselves in the stories they loved.
        </p>

        <div className="landing-divider" aria-hidden="true" />

        <p className="landing-description">
          Some books entertain us.
          <br />
          Some books stay with us.
          <br />
          This is where readers share the thoughts that live between the lines.
        </p>

        <div className="landing-actions">
          <a href="/login" className="btn-primary landing-button">
            Login
          </a>
          <a href="/register" className="btn-secondary landing-button">
            Create Account
          </a>
        </div>
      </section>
    </main>
  );
}
