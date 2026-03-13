import { motion } from "framer-motion";

const FLOW_STEPS = [
  "Open landing page and understand platform intent",
  "Sign in or create account to enter personal workspace",
  "Explore feed content from all readers",
  "Narrow results using search, genre, mood, and sort",
  "Write a new review and publish to community feed",
  "Feed refreshes with updated server-backed data"
];

const API_GROUPS = [
  {
    name: "Auth",
    routes: ["POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me"]
  },
  {
    name: "Reviews",
    routes: [
      "GET /api/reviews?page=1&limit=10",
      "GET /api/reviews/mine",
      "POST /api/reviews",
      "PATCH /api/reviews/:id/like"
    ]
  },
  {
    name: "Shelf",
    routes: ["GET /api/shelf", "POST /api/shelf", "DELETE /api/shelf/:id"]
  }
];

function Panel({ number, title, subtitle, children }) {
  return (
    <section className="wire-panel">
      <div className="wire-panel-head">
        <span className="wire-panel-id">{number}</span>
        <div>
          <h2 className="wire-panel-title">{title}</h2>
          {subtitle && <p className="wire-panel-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="wire-panel-body">{children}</div>
    </section>
  );
}

function WindowFrame({ title, children }) {
  return (
    <article className="wire-window">
      <div className="wire-window-bar">
        <span>Between The Lines</span>
        <span>{title}</span>
      </div>
      <div className="wire-window-body">{children}</div>
    </article>
  );
}

export default function BlueprintPage() {
  return (
    <main className="blueprint-wrap">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="blueprint-poster"
      >
        <div className="wire-shape wire-shape-circle" aria-hidden="true" />
        <div className="wire-shape wire-shape-square" aria-hidden="true" />
        <div className="wire-shape wire-shape-diamond" aria-hidden="true" />

        <header className="wire-header">
          <p className="wire-kicker">Blueprint</p>
          <h1 className="wire-title">Between The Lines</h1>
          <p className="wire-subtitle">
            System overview of product experience, frontend structure, backend contracts, and data model.
          </p>
          <div className="wire-context">
            <div className="wire-context-card">
              <h3>Goal</h3>
              <p>Give readers a calm space to share what books changed in them.</p>
            </div>
            <div className="wire-context-card">
              <h3>Audience</h3>
              <p>Readers who want emotional reflections, not just star ratings.</p>
            </div>
            <div className="wire-context-card">
              <h3>Current Stage</h3>
              <p>MVP with auth, feed, filters, publishing, and likes.</p>
            </div>
          </div>
        </header>

        <div className="wire-grid wire-grid-top">
          <Panel
            number="01"
            title="User Journey Flow"
            subtitle="Core lifecycle from entry to post publish"
          >
            <div className="wire-flow">
              {FLOW_STEPS.map((step, index) => (
                <div key={step} className="wire-flow-step">
                  <span className="wire-flow-index">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            number="02"
            title="Navigation Structure"
            subtitle="Main routes and what users see in each route"
          >
            <div className="wire-tree">
              <p>
                <strong>/</strong>
                {" : "}
                Landing (Login / Create Account)
              </p>
              <p>
                <strong>/login</strong>
                {" : "}
                Auth form (login mode)
              </p>
              <p>
                <strong>/register</strong>
                {" : "}
                Auth form (register mode)
              </p>
              <p>
                <strong>/journal</strong>
                {" : "}
                Main feed (same as /feed)
              </p>
            </div>
          </Panel>
        </div>

        <Panel
          number="03"
          title="Screen Wireframes"
          subtitle="Desktop-first views, responsive collapse on mobile"
        >
          <div className="wire-screen-grid">
            <WindowFrame title="home">
              <div className="wire-stack-sm">
                <div className="wire-line w-1/2" />
                <div className="wire-line w-full" />
                <div className="wire-line w-[85%]" />
              </div>
              <div className="wire-btn-row">
                <span className="wire-btn">Login</span>
                <span className="wire-btn">Create Account</span>
              </div>
            </WindowFrame>

            <WindowFrame title="auth">
              <div className="wire-stack-sm">
                <div className="wire-line w-[38%]" />
                <div className="wire-input-line" />
                <div className="wire-input-line" />
                <div className="wire-input-line" />
                <span className="wire-btn w-full text-center">Continue</span>
              </div>
            </WindowFrame>

            <WindowFrame title="feed">
              <div className="wire-feed-shell">
                <aside className="wire-box">Left filters</aside>
                <section className="wire-box">Center cards + infinite scroll</section>
                <aside className="wire-box">Right sort and mood</aside>
              </div>
            </WindowFrame>
          </div>
        </Panel>

        <div className="wire-grid wire-grid-bottom">
          <Panel
            number="04"
            title="System Architecture"
            subtitle="Single frontend + single backend + MongoDB"
          >
            <div className="wire-arch">
              <div className="wire-arch-box">
                <h3>Client</h3>
                <p>React + Vite + Tailwind + Framer Motion</p>
              </div>
              <p className="wire-link-label">API boundary (HTTPS /api)</p>
              <div className="wire-arch-box">
                <h3>Server</h3>
                <p>Node + Express + JWT middleware</p>
              </div>
              <p className="wire-link-label">Persistence layer (Mongoose)</p>
              <div className="wire-arch-box">
                <h3>Database</h3>
                <p>MongoDB Atlas (Users, Reviews, ShelfItems)</p>
              </div>
            </div>
          </Panel>

          <Panel
            number="05"
            title="API Contracts"
            subtitle="Current implemented endpoints"
          >
            <div className="wire-api-grid">
              {API_GROUPS.map((group) => (
                <div key={group.name} className="wire-api-group">
                  <h3>{group.name}</h3>
                  {group.routes.map((route) => (
                    <p key={route}>{route}</p>
                  ))}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="wire-grid wire-grid-bottom">
          <Panel
            number="06"
            title="Data Model"
            subtitle="Primary entities and key fields"
          >
            <div className="wire-data-grid">
              <div className="wire-data-card">
                <h3>User</h3>
                <p>firstName, lastName</p>
                <p>email, passwordHash</p>
              </div>
              <div className="wire-data-card">
                <h3>Review</h3>
                <p>bookTitle, author, genre, mood</p>
                <p>review, favoriteQuote</p>
                <p>likes, commentsCount, createdAt</p>
              </div>
              <div className="wire-data-card">
                <h3>ShelfItem</h3>
                <p>bookTitle</p>
                <p>status</p>
              </div>
            </div>
          </Panel>

          <Panel
            number="07"
            title="Release Scope"
            subtitle="What users can do in this MVP release"
          >
            <ul className="wire-list">
              <li>Register and login with JWT auth</li>
              <li>Browse feed with server-side filters</li>
              <li>Search by book title or username</li>
              <li>Sort by top liked, recent, oldest</li>
              <li>Infinite scroll in chunks of 10</li>
              <li>Publish reviews and like posts</li>
              <li>View personal posts from profile menu</li>
            </ul>
          </Panel>
        </div>
      </motion.article>
    </main>
  );
}
