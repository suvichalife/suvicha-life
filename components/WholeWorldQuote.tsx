import Reveal from "./Reveal";

export default function WholeWorldQuote() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 text-center sm:px-8">
        <p className="font-thai text-[20px] font-semibold text-sage">คุณคือโลกทั้งใบของใครบางคน</p>
        <p className="text-gradient-rp mt-4 text-[38px] font-bold leading-tight sm:text-[44px]">
          &ldquo;You are someone&rsquo;s
          <br />
          whole world.&rdquo;
        </p>
        <p className="mt-4 text-[27px] font-bold leading-tight text-ink sm:text-[31px]">
          What happens to them,
          <br />
          if something happens to you?
        </p>
      </Reveal>
    </section>
  );
}
