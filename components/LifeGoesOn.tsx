import Reveal from "./Reveal";

export default function LifeGoesOn() {
  return (
    <section className="pb-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 sm:px-8">
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-[28px]"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, var(--red) 0%, #8a0f2c 26%, #6a0c22 46%, var(--maroon) 68%, var(--maroon-deep) 100%)",
          }}
        >
          {/* breathing multi-shade rings, largest/darkest to smallest/brightest */}
          {[
            { size: "90%", color: "var(--maroon)", delay: 0 },
            { size: "70%", color: "#8a0f2c", delay: 0.12 },
            { size: "50%", color: "var(--red)", delay: 0.24 },
            { size: "30%", color: "var(--pink)", delay: 0.36 },
          ].map((ring) => (
            <span
              key={ring.size}
              aria-hidden
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: ring.size,
                aspectRatio: "1 / 1",
                background: ring.color,
                opacity: 0.6,
                boxShadow: ring.size === "30%" ? "0 0 40px 12px rgba(210,18,68,0.55)" : undefined,
                animation: `pulse-core 1.7s ease-in-out ${ring.delay}s infinite`,
              }}
            />
          ))}

          <div className="absolute inset-x-0 bottom-[6%] px-6 text-center">
            <p className="font-thai text-[16px] font-medium text-white/70">ปกป้องทุกจังหวะของชีวิต</p>
            <p className="mt-1 text-[42px] font-bold text-white">Life goes on.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
