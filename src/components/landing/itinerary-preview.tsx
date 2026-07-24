const days = [
  {
    day: "Day 1",
    title: "Arrive & settle into Gion",
    items: [
      { time: "15:00", label: "Check-in near Yasaka", tag: "stay" },
      { time: "17:30", label: "Sunset at Kiyomizu-dera", tag: "culture" },
      { time: "20:00", label: "Kaiseki in a machiya", tag: "food" },
    ],
  },
  {
    day: "Day 2",
    title: "Temples at a human pace",
    items: [
      { time: "07:30", label: "Fushimi Inari before crowds", tag: "nature" },
      { time: "12:00", label: "Nishiki Market lunch crawl", tag: "food" },
      { time: "16:00", label: "Tea house in Arashiyama", tag: "culture" },
    ],
  },
];

export function ItineraryPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--lagoon)]/20 via-transparent to-[var(--coral)]/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-[var(--ink)]/10">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--sand-deep)]/60 px-5 py-3.5">
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              Kyoto in autumn
            </p>
            <p className="text-xs text-[var(--muted)]">7 days · food & culture · balanced</p>
          </div>
          <span className="rounded-full bg-[var(--lagoon)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lagoon)]">
            Live preview
          </span>
        </div>
        <div className="space-y-4 p-5">
          {days.map((d) => (
            <div key={d.day}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                  {d.day}
                </p>
                <p className="truncate font-display text-sm font-medium">{d.title}</p>
              </div>
              <ul className="space-y-2">
                {d.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)]/80 bg-[var(--background)]/50 px-3 py-2.5"
                  >
                    <span className="w-11 shrink-0 font-mono text-[11px] text-[var(--muted)]">
                      {item.time}
                    </span>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    <span className="rounded-full bg-[var(--sand-deep)] px-2 py-0.5 text-[10px] font-semibold capitalize text-[var(--muted)]">
                      {item.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="pt-1 text-center text-xs text-[var(--muted)]">
            Weather · map · budget open in the real workspace
          </p>
        </div>
      </div>
    </div>
  );
}
