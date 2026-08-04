import type { ReactNode } from "react";
import Reveal from "./Reveal";

function Icon({ path, filledHeart = false }: { path: string; filledHeart?: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ink)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
      {filledHeart && (
        <path
          d="M12 16.5c-1.6-1.2-3-2.6-3-4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1.4-1.4 2.8-3 4Z"
          fill="var(--ink)"
          stroke="none"
        />
      )}
    </svg>
  );
}

const items: { label: ReactNode; key: string; path: string; filledHeart?: boolean }[] = [
  {
    key: "life",
    label: "ประกันชีวิต",
    path: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4",
  },
  {
    key: "health",
    label: (
      <>
        ประกันสุขภาพ
        <br />
        และโรคร้ายแรง
      </>
    ),
    path: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7ZM3.22 8.75h3.5l.5-1.5.5 3 .5-1.5h3.5",
  },
  {
    key: "savings",
    label: (
      <>
        ประกันสะสมทรัพย์
        <br />
        และบำนาญ
      </>
    ),
    path: "M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 1 3 2 3.5V19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h4v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.3c.5-.2.9-.5 1.2-.8.3.1.6.1.8.1a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1h-1a4.9 4.9 0 0 0-2-3.9V5M2 9v1c0 1.1.9 2 2 2h1M16 11h.01",
  },
  {
    key: "accident",
    label: "ประกันอุบัติเหตุ",
    path: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
  },
  {
    key: "always-on",
    label: (
      <>
        อยู่ตรงนี้
        <br />
        เมื่อคุณต้องการ
      </>
    ),
    path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  },
  {
    key: "consult",
    label: (
      <>
        ปรึกษาได้ทุกแง่มุม
        <br />
        ก่อนการตัดสินใจ
      </>
    ),
    path: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
    filledHeart: true,
  },
];

export default function LifestyleGrid() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <Reveal className="mx-auto max-w-[560px] px-6 text-center sm:px-8">
        <h2 className="text-[28px] font-bold leading-tight text-ink">
          Protection that fits
          <br />
          <span className="text-gradient-rp">every lifestyle.</span>
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10">
          {items.map((item) => (
            <div key={item.key} className="flex flex-col items-center gap-3">
              <Icon path={item.path} filledHeart={item.filledHeart} />
              <p className="font-thai text-[15px] font-medium leading-snug text-ink">{item.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
