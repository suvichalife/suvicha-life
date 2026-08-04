import Reveal from "./Reveal";
import { LINE_URL, INSTAGRAM_URL } from "@/lib/links";

export default function ClosingCta() {
  return (
    <>
      <section className="py-16" style={{ background: "var(--red)" }}>
        <Reveal className="mx-auto max-w-[560px] px-6 text-center sm:px-8">
          <p className="font-body text-[14px] font-semibold text-white">suvicha.life</p>
          <p className="font-body mt-6 whitespace-nowrap text-[20px] font-semibold leading-tight text-white sm:text-[28px]">
            Take the leap. We&rsquo;ll catch the fall.
          </p>
          <h2 className="mt-2 text-[44px] font-bold leading-tight text-white sm:text-[54px]">
            Be brave enough
            <br />
            to try it all.
          </h2>
          <p className="font-body mx-auto mt-7 max-w-[440px] text-[15px] font-semibold leading-snug text-white">
            The world is out there, waiting for you to live in it.
            <br />
            So plan well, then let go of the worry. We&rsquo;ll carry the &ldquo;what ifs,&rdquo;
            <br />
            while you focus on everything else life has to offer.
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-thai mt-7 inline-block rounded-full bg-snow px-8 py-3.5 text-[15px] font-semibold text-red transition-transform duration-300 hover:scale-[1.03]"
          >
            ปรึกษาฟรี
          </a>
        </Reveal>
      </section>

      <section className="py-16" style={{ background: "var(--snow)" }}>
        <Reveal className="mx-auto max-w-[560px] px-6 sm:px-8">
          <h2 className="text-[24px] font-bold leading-tight text-ink">
            Follow along on Instagram.
            <br />
            Stay connected and never miss a moment.
          </h2>
          <p className="font-body mt-3 text-[15px] font-semibold leading-relaxed text-sage">
            Bringing you tips on protection, savings,
            <br />
            end the everyday moments worth planning for.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-full px-6 py-3 text-[14px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03]"
            style={{ background: "var(--red)" }}
          >
            Follow @suvicha.life
          </a>
        </Reveal>
      </section>
    </>
  );
}
