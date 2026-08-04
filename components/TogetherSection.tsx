import Image from "next/image";
import Reveal from "./Reveal";

export default function TogetherSection() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 sm:px-8">
        <p className="font-body text-center text-[14px] font-bold text-ink">
          Start together. Stay together.
        </p>
        <h2 className="text-gradient-rp mt-2 text-center text-[28px] font-bold leading-tight sm:text-[32px]">
          We walk this together,
          <br />
          from day one.
        </h2>

        <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-[24px] bg-ink">
          <Image
            src="/images/standing-portrait.jpg"
            alt="สุวิชชา ตัวแทนประกันชีวิต"
            fill
            sizes="(max-width: 640px) 100vw, 560px"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,.55) 100%)",
            }}
          />
          <p className="font-body absolute left-6 right-6 top-6 text-center text-[19px] font-bold leading-snug text-white">
            You take the first step.
            <br />
            I stay for every one after.
          </p>
          <p className="font-body absolute inset-x-6 bottom-6 text-center text-[19px] font-bold leading-snug text-white">
            I&rsquo;ve seen enough to know
            <br />
            why this matters.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
