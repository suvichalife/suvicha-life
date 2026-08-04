import Image from "next/image";
import Reveal from "./Reveal";
import { LINE_URL } from "@/lib/links";

const copyBlocks = [
  {
    lead: "Live your life.",
    bodyLines: ["We'll hold the worry,", "so you don't have to."],
  },
  {
    lead: "Say yes to the unexpected.",
    bodyLines: ["We're ready", "the moment it happens."],
  },
  {
    lead: "Face every situation.",
    bodyLines: ["We help you respond,", "without hesitation."],
  },
  {
    lead: "Start today.",
    bodyLines: ["Build toward the future", "you're aiming for."],
  },
];

export default function Hero() {
  return (
    <section id="hero" className="pt-20 pb-16" style={{ background: "var(--snow)" }}>
      <div
        className="relative mx-auto max-w-[720px] px-6 text-center sm:px-8"
        style={{ top: "28px" }}
      >
        <p className="font-thai text-[18px] font-medium text-sage sm:text-[20px]">
          ปกป้องทุกจังหวะของชีวิต
        </p>

        <h1
          className="mt-2 whitespace-nowrap text-[9.5vw] leading-[0.95] sm:text-[64px]"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span
            className="font-display"
            style={{
              background: "linear-gradient(90deg, var(--pink), var(--red))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            LIFE,
          </span>{" "}
          <span className="font-bold text-ink">UNLOCKED</span>
          <span className="font-bold text-red">.</span>
        </h1>
      </div>

      <div
        className="mx-auto mt-1 flex justify-center"
        style={{
          height: "60vh",
          animation: "float-photo 5s ease-in-out infinite",
          filter: "drop-shadow(0 28px 48px rgba(42,50,57,.18))",
        }}
      >
        <Image
          src="/images/hero-photo.png"
          alt="สุวิชชา ตัวแทนประกันชีวิต"
          width={1824}
          height={2320}
          priority
          className="h-full w-auto select-none"
        />
      </div>

      <div className="mx-auto max-w-[720px] px-6 text-center sm:px-8">
        <h2 className="mt-0 text-[40px] font-bold text-ink sm:text-[48px]" style={{ letterSpacing: "-0.02em" }}>
          Go live<span className="text-red">.</span>
        </h2>

        <p className="font-thai mt-1 text-[15px] text-sage">
          สุวิชชา<span className="mx-2 text-gray">|</span>ตัวแทนประกันชีวิต
        </p>

        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glow font-thai mt-4 inline-block rounded-full px-8 py-3.5 text-[15px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03]"
          style={{ background: "var(--red)" }}
        >
          ปรึกษาฟรี
        </a>

        <div className="mt-28 flex flex-col gap-12">
          {copyBlocks.map((block) => (
            <Reveal key={block.lead}>
              <p className="text-[32px] font-bold leading-tight text-red sm:text-[38px]">{block.lead}</p>
              <p className="mt-1 text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
                {block.bodyLines[0]}
                <br />
                {block.bodyLines[1]}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
