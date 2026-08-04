import Reveal from "./Reveal";

const rows = [
  { label: "ปรึกษาฟรี ไม่มีข้อผูกมัด", ok: true },
  { label: "ทบทวนแผนความคุ้มครองเป็นประจำทุกปี", ok: true },
  { label: "ดูแลเอกสารและขั้นตอนสมัครอย่างละเอียด", ok: true },
  { label: "ช่วยเตรียมเอกสารและขั้นตอนตอนเคลม", ok: true },
  { label: "ตอบไลน์เร็วพอๆ กับคนคุยของคุณ", ok: true },
  { label: "ตั้งใจฟังคุณ โดยไม่พูด “ห้ะ” เกิน 3 รอบ", ok: true },
  { label: "ทำให้แฟนเก่าคุณกลับมา", ok: false },
  { label: "ทำให้แม่คุณเลิกถามว่าเมื่อไหร่จะแต่งงาน", ok: false },
  { label: "นั่งฟังปัญหาเรื่องหัวหน้าของคุณตอนตี 2", ok: false },
  { label: "ดูดวง", ok: false },
];

export default function ComparisonTable() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 sm:px-8">
        <h2 className="text-center text-[34px] font-bold leading-tight text-ink">
          Here&rsquo;s what you get,
          <br />
          having me by your side.
        </h2>
        <p className="font-body mt-2 text-center text-[18px] font-semibold text-sage">
          This is what &ldquo;having an agent&rdquo; should feel like.
        </p>

        <div className="mt-8 flex justify-end px-3">
          <p className="font-thai text-right text-[17px] font-semibold text-ink">
            การดูแล
            <br />
            จากสุวิชชา
          </p>
        </div>

        <div className="mt-2 px-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-t py-4"
              style={{ borderColor: "var(--gray)" }}
            >
              <p className="font-thai text-[17px] font-medium text-ink">{row.label}</p>
              {row.ok ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="var(--red)"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="var(--sage)"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
