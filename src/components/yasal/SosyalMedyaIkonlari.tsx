const SOSYAL_LINKLER = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/acilcozumbul/",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590333555686",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@acilcozumbul",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
        <path d="M16.6 4.1c.5 1.5 1.6 2.7 3.1 3.2v2.4a6.4 6.4 0 0 1-3.1-.9v5.5a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.5a3.1 3.1 0 1 0 2.2 3V4.1h2.5Z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC-CyyA9dg9FKf_mJ1eRrEdg",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
        <path d="M20.6 7.4a2.3 2.3 0 0 0-1.6-1.6C17.4 5.4 12 5.4 12 5.4s-5.4 0-7 .4A2.3 2.3 0 0 0 3.4 7.4 24 24 0 0 0 3 12a24 24 0 0 0 .4 4.6 2.3 2.3 0 0 0 1.6 1.6c1.6.4 7 .4 7 .4s5.4 0 7-.4a2.3 2.3 0 0 0 1.6-1.6A24 24 0 0 0 21 12a24 24 0 0 0-.4-4.6ZM10.4 14.9V9.1L15.2 12l-4.8 2.9Z" />
      </svg>
    ),
  },
] as const;

export function SosyalMedyaIkonlari({
  className = "",
}: {
  className?: string;
}) {
  return (
    <nav
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-label="Sosyal medya"
    >
      {SOSYAL_LINKLER.map((l) => (
        <a
          key={l.id}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 transition hover:text-slate-600"
          aria-label={l.label}
        >
          {l.ikon}
        </a>
      ))}
    </nav>
  );
}
