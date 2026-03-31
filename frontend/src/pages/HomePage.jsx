import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const heroRef = useRef(null);
  const [activeMood, setActiveMood] = useState("cozy");

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    function handleMove(event) {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--parallax-x", x.toFixed(3));
      hero.style.setProperty("--parallax-y", y.toFixed(3));
    }

    function resetParallax() {
      hero.style.setProperty("--parallax-x", "0");
      hero.style.setProperty("--parallax-y", "0");
    }

    hero.addEventListener("mousemove", handleMove);
    hero.addEventListener("mouseleave", resetParallax);

    return () => {
      hero.removeEventListener("mousemove", handleMove);
      hero.removeEventListener("mouseleave", resetParallax);
    };
  }, []);

  return (
    <main className="home-v2" data-mood={activeMood}>
      <section className="hero-v2" ref={heroRef}>
        <div className="hero-left">
          <p className="hero-kicker">A diary for readers</p>
          <h1 className="hero-title">Between the Lines</h1>
          <p className="hero-subtitle">Stories do not end. They stay with you.</p>
          <p className="hero-body">
            A quiet space for readers to leave pieces of themselves in the books they loved.
            No stars. Just feelings, quotes, and the worlds that changed you.
          </p>
          <div className="hero-actions">
            <a href="/register" className="hero-button primary">
              🌸 Start Writing
            </a>
            <a href="#features" className="hero-button ghost">
              Explore
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <span>Mood Tags</span>
              <p>Feelings over ratings</p>
            </div>
            <div>
              <span>Personal Shelf</span>
              <p>Keep your stories close</p>
            </div>
            <div>
              <span>Threaded Notes</span>
              <p>Talk about what moved you</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-preview">
            <div className="preview-header">
              <div className="preview-dot" />
              <div className="preview-dot" />
              <div className="preview-dot" />
            </div>
            <div className="preview-body">
              <p className="preview-kicker">Entry</p>
              <h3>The Starless Sea</h3>
              <p>
                Every page felt like a secret door. I kept pausing just to breathe it in.
              </p>
              <div className="preview-tags">
                <span>🌙 Dreamy</span>
                <span>✨ Hopeful</span>
                <span>🧸 Cozy</span>
              </div>
              <div className="preview-quote">
                "Sometimes stories are maps to a place inside yourself."
              </div>
            </div>
          </div>

          <div className="floating-card card-one">
            <p>"Still thinking about that ending."</p>
            <span>— Mina</span>
          </div>
          <div className="floating-card card-two">
            <p>Quote that stayed</p>
            <strong>"Softness is a superpower."</strong>
          </div>
          <div className="floating-card card-three">
            <p>📖 Entry by Vinnu</p>
            <span>Emotional · Hopeful</span>
          </div>

          <div className="hero-mascot">
            <div className="mascot-face">
              <span className="eye" />
              <span className="eye" />
              <span className="blush left" />
              <span className="blush right" />
            </div>
          </div>

          <span className="hero-float star">✨</span>
          <span className="hero-float quote">💬</span>
          <span className="hero-float book">📖</span>
        </div>
      </section>

      <section id="features" className="features-v2">
        <div className="feature-grid">
          <article className="feature-card feature-big">
            <h2>🌸 Emotion-first reviews</h2>
            <p>Write what the book did to you, not just what you thought of it.</p>
            <div className="feature-glow" />
          </article>
          <article className="feature-card feature-small tilt-left">
            <h3>💬 Quotes that linger</h3>
            <p>Save the line that stayed with you and let it glow.</p>
          </article>
          <article className="feature-card feature-small tilt-right">
            <h3>📚 Personal shelf</h3>
            <p>Keep your current reads, favorites, and future worlds.</p>
          </article>
        </div>
      </section>

      <section className="ritual-v2">
        <div className="ritual-header">
          <h2>Your review ritual</h2>
          <p>Small steps that turn a feeling into a memory.</p>
        </div>
        <div className="ritual-line" />
        <div className="ritual-steps">
          {[
            ["①", "Write your feelings", "Two lines that say what it changed in you."],
            ["②", "Add a mood", "Choose the emotion the book left behind."],
            ["③", "Save a quote", "A sentence that still echoes."],
            ["④", "Live in the story?", "Yes or no — would you stay there?"]
          ].map(([index, title, detail]) => (
            <div key={title} className="ritual-step">
              <div className="ritual-dot">{index}</div>
              <div>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mood-v2">
        <div className="mood-header">
          <h2>Pick your mood</h2>
          <p>Tap a feeling to change the tone.</p>
        </div>
        <div className="mood-bubbles">
          {[
            { id: "cozy", label: "Cozy", icon: "🧸" },
            { id: "dark", label: "Dark", icon: "🌙" },
            { id: "hopeful", label: "Hopeful", icon: "🌈" },
            { id: "emotional", label: "Emotional", icon: "💔" },
            { id: "dreamy", label: "Dreamy", icon: "✨" }
          ].map((mood) => (
            <button
              type="button"
              key={mood.id}
              className={activeMood === mood.id ? "mood-bubble active" : "mood-bubble"}
              onClick={() => setActiveMood(mood.id)}
            >
              <span>{mood.icon}</span>
              {mood.label}
            </button>
          ))}
        </div>
        <div className="mood-preview">
          <p>"This is what today's feed feels like."</p>
        </div>
      </section>

      <section className="shelf-v2">
        <div className="shelf-header">
          <h2>Personal shelf, visualized</h2>
          <p>Arrange your stories like a cozy bookshelf.</p>
        </div>
        <div className="shelf-grid">
          <div className="shelf-column">
            <h3>📚 Currently Reading</h3>
            <div className="shelf-stack">
              <div className="book-card">A Court of Mist</div>
              <div className="book-card">Tomorrow, and Tomorrow</div>
              <div className="book-card">Little Fires Everywhere</div>
            </div>
          </div>
          <div className="shelf-column completed">
            <h3>✅ Completed</h3>
            <div className="shelf-stack">
              <div className="book-card">Pachinko</div>
              <div className="book-card">Circe</div>
              <div className="book-card">The Book Thief</div>
            </div>
            <span className="shelf-stamp">Loved</span>
          </div>
          <div className="shelf-column wish">
            <h3>✨ Want to Read</h3>
            <div className="shelf-stack">
              <div className="book-card">The Midnight Library</div>
              <div className="book-card">The Night Circus</div>
              <div className="book-card">Babel</div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-v2">
        <div className="community-header">
          <h2>Community whispers</h2>
          <p>A soft feed of the thoughts people leave behind.</p>
        </div>
        <div className="community-feed">
          <div className="community-track">
            {[
              "\"This one made me cry in the best way.\" — Aanya",
              "\"I wanted to live in this world forever.\" — Rhea",
              "\"The quote I saved keeps following me.\" — Sana",
              "\"Felt like a warm hug.\" — Nina",
              "\"Dark but strangely hopeful.\" — Avi"
            ].map((text) => (
              <div key={text} className="community-card">
                <span className="community-avatar">✦</span>
                <p>{text}</p>
              </div>
            ))}
            {[
              "\"This one made me cry in the best way.\" — Aanya",
              "\"I wanted to live in this world forever.\" — Rhea",
              "\"The quote I saved keeps following me.\" — Sana",
              "\"Felt like a warm hug.\" — Nina",
              "\"Dark but strangely hopeful.\" — Avi"
            ].map((text) => (
              <div key={`repeat-${text}`} className="community-card">
                <span className="community-avatar">✦</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-v2">
        <div className="how-card">
          <h2>How it works</h2>
          <div className="how-steps">
            <div>
              <span>✍️</span>
              <h3>Write</h3>
              <p>Start with how it made you feel.</p>
            </div>
            <div>
              <span>💭</span>
              <h3>Feel</h3>
              <p>Add a mood and a line that stayed.</p>
            </div>
            <div>
              <span>🌍</span>
              <h3>Share</h3>
              <p>Let your entry live in the feed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-v2">
        <div>
          <h2>Start writing what stayed with you.</h2>
          <p>Build a diary of the stories that shaped you.</p>
        </div>
        <a href="/register" className="hero-button primary">
          Create your diary
        </a>
      </section>

      <footer className="home-footer">
        Between the Lines · A soft place for your reading memories.
      </footer>
    </main>
  );
}
