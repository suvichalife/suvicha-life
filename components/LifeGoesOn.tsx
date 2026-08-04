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
          {/* radar pulse rings */}
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                width: "82%",
                aspectRatio: "1 / 1",
                borderColor: "rgba(255,255,255,0.35)",
                animation: `pulse-ring 3s ease-out ${i * 0.6}s infinite`,
              }}
            />
          ))}

          {/* breathing core */}
          <span
            aria-hidden
            className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "30%",
              aspectRatio: "1 / 1",
              background: "var(--pink)",
              boxShadow: "0 0 40px 12px rgba(210,18,68,0.55)",
              animation: "pulse-core 1.7s ease-in-out infinite",
            }}
          />

          <div className="absolute inset-x-0 bottom-0 p-6 text-center">
            <p className="font-thai text-[13px] text-white/70">ปกป้องทุกจังหวะของชีวิต</p>
            <p className="mt-1 text-[30px] font-bold text-white">Life goes on.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
