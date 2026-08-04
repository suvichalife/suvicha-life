import Reveal from "./Reveal";

export default function WholeWorldQuote() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 text-center sm:px-8">
        <p className="font-thai text-[17px] font-medium text-sage">คุณคือโลกทั้งใบของใครบางคน</p>
        <p className="text-gradient-rp mt-3 text-[26px] font-bold leading-tight sm:text-[30px]">
          &ldquo;You are someone&rsquo;s
          <br />
          whole world.&rdquo;
        </p>
        <p className="mt-3 text-[22px] font-bold leading-tight text-ink sm:text-[26px]">
          What happens to them,
          <br />
          if something happens to you?
        </p>
      </Reveal>
    </section>
  );
}
