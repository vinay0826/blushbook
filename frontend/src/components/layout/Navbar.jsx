export default function Navbar() {
  return (
    <header className="sticky top-3 z-30 px-3 sm:px-6">
      <nav className="soft-panel mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="brand-badge" aria-hidden="true">
            B
          </span>
          <div>
            <p className="text-lg font-bold text-[color:var(--text)] sm:text-xl">Between The Lines</p>
            <p className="text-[11px] text-[color:var(--muted)] sm:text-xs">The stories that stay in us</p>
          </div>
        </div>
        <span className="btn-ghost hidden sm:inline-flex">Calm Reading Journal</span>
      </nav>
    </header>
  );
}
