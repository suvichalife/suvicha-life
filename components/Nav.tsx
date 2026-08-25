"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LINE_URL } from "@/lib/links";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

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

        <div className="flex items-center gap-5 sm:gap-6">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="font-thai text-[14px] font-medium text-ink transition-opacity duration-300 hover:opacity-60"
            >
              แนะแนว
            </button>

            <div
              className="absolute right-0 top-full mt-4"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.97)",
                pointerEvents: open ? "auto" : "none",
                transformOrigin: "top right",
                transition: "opacity .5s var(--ease-reveal), transform .5s var(--ease-reveal)",
              }}
            >
              <div
                className="w-[248px] overflow-hidden rounded-[20px] border"
                style={{
                  background: "rgba(255,255,255,.85)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  borderColor: "var(--gray)",
                  boxShadow: "0 24px 60px rgba(42,50,57,.16)",
                }}
              >
                <div className="px-5 pt-4">
                  <span className="font-thai text-[11px] font-medium tracking-wide text-sage">เลือกดู</span>
                </div>
                <Link
                  href="/guidance"
                  onClick={() => setOpen(false)}
                  className="font-thai block px-5 pb-5 pt-1 text-[23px] font-bold leading-snug text-ink transition-opacity duration-300 hover:opacity-50"
                >
                  กิจกรรมแนะแนว
                </Link>
              </div>
            </div>
          </div>

          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow font-thai rounded-full px-4 py-2 text-[13px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03] sm:px-5"
            style={{ background: "var(--red)" }}
          >
            ปรึกษาฟรี
          </a>
        </div>
      </nav>
    </header>
  );
}
