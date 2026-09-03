export default function Home() {
  return (
    <main className="flex-1 px-6 py-8 md:px-10">
      <header className="glass rounded-pill mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <span className="text-lg font-bold tracking-tight">[NAME]</span>
        <nav className="hidden gap-6 text-sm text-muted md:flex">
          <span>Discover</span>
          <span>Brands</span>
          <span>Lookbooks</span>
          <span>Drops</span>
        </nav>
        <button className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white">
          Bag (0)
        </button>
      </header>

      <section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-lime p-8 md:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/60">
            Editor&apos;s choice
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Find your next favorite clothing brand.
          </h1>
          <button className="rounded-pill mt-10 bg-ink px-5 py-3 text-sm font-medium text-white">
            Start exploring
          </button>
        </div>
        <div className="rounded-lg bg-teal p-8 text-cream md:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/60">
            Brand of the week
          </p>
          <h2 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Coming soon.
          </h2>
          <button className="rounded-pill mt-10 bg-lime px-5 py-3 text-sm font-medium text-ink">
            Follow brand
          </button>
        </div>
      </section>

      <p className="mx-auto mt-8 max-w-6xl text-sm text-muted">
        Scaffold is live. Design system tokens are in <code>src/app/globals.css</code>.
      </p>
    </main>
  );
}
