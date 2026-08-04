import { LINE_URL } from "@/lib/links";

export default function Nav() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b"
      style={{
        background: "rgba(245,246,248,.45)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--gray)",
      }}
    >
      <nav className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-4 sm:px-8">
        <a href="#hero" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: "var(--red)",
              animation: "heartbeat-dot 1.8s ease-out infinite",
            }}
          />
          <span className="font-body text-[17px] font-semibold tracking-tight text-ink">
            suvicha.
            <span className="text-red">life</span>
          </span>
        </a>

        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glow font-thai rounded-full px-4 py-2 text-[13px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03] sm:px-5"
          style={{ background: "var(--red)" }}
        >
          ปรึกษาฟรี
        </a>
      </nav>
    </header>
  );
}
