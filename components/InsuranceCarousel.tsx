import Reveal from "./Reveal";
import { LINE_URL } from "@/lib/links";

const plans = [
  {
    title: "ประกันชีวิต",
    tagLines: ["Protection that lasts a lifetime."],
    bullets: [
      "เลือกความคุ้มครองได้ยาวถึงอายุ 99 ปี",
      "มีมูลค่าเงินสดสะสมตราบที่ถือกรมธรรม์ไว้",
      "เบี้ยประกันภัยใช้ลดหย่อนภาษีได้ตามเงื่อนไข",
    ],
  },
  {
    title: "ประกันโรคร้ายแรง",
    tagLines: ["Every step of treatment,", "we're with you."],
    bullets: [
      "เลือกความคุ้มครองตั้งแต่โรคระยะต้นถึงระยะรุนแรง",
      "เลือกรับเงินก้อนใหญ่ หรือหลายก้อนจากโรคร้ายแรงหลากหลายกลุ่มโรค",
      "ช่วยแบ่งเบาภาระค่าใช้จ่ายในช่วงเวลาที่ยากลำบาก",
    ],
  },
  {
    title: "ประกันสุขภาพ",
    tagLines: ["Getting sick is hard enough.", "We'll help carry the rest."],
    bullets: [
      "เลือกความคุ้มครองที่หลากหลายทั้งค่ารักษาทั้งผู้ป่วยในและผู้ป่วยนอก",
      "เคลมสะดวก รวดเร็ว มีตัวแทนมืออาชีพดูแลตลอดกระบวนการ",
      "มีแผนให้เลือกตั้งแต่ระดับเริ่มต้นจนถึงเหมาจ่ายวงเงินสูง",
    ],
  },
  {
    title: "ประกันอุบัติเหตุ",
    tagLines: ["Affordable to have.", "Priceless when you need it."],
    bullets: [
      "เบี้ยประกันภัยเริ่มต้นในราคาที่เข้าถึงง่าย",
      "คุ้มครองอุบัติเหตุตลอด 24 ชั่วโมง",
      "มีผลประโยชน์ชดเชยรายได้ระหว่างพักรักษาตัวในแผนที่กำหนด",
    ],
  },
  {
    title: "ประกันสะสมทรัพย์",
    tagLines: ["Save today,", "for the day you meant it for."],
    bullets: [
      "วางแผนเงินก้อนสำหรับเป้าหมายในอนาคต",
      "เลือกเงินคืนเป็นงวดระหว่างสัญญาตามแผนที่กำหนด",
      "เบี้ยประกันภัยใช้ลดหย่อนภาษีได้ตามเงื่อนไข",
    ],
  },
  {
    title: "ประกันบำนาญ",
    tagLines: ["The paycheck that outlives", "your career."],
    bullets: [
      "รับเงินบำนาญต่อเนื่องทุกปีตั้งแต่อายุที่กำหนด",
      "เลือกช่วงอายุเริ่มรับบำนาญให้เหมาะกับแผนเกษียณของคุณ",
      "วางแผนเงินบำนาญหลังเกษียณให้แน่นอนตั้งแต่วันนี้",
    ],
  },
];

export default function InsuranceCarousel() {
  return (
    <section id="plans" className="py-16" style={{ background: "var(--gray)" }}>
      <Reveal className="px-6 sm:px-8">
        <h2 className="text-[34px] font-bold text-ink">Find what fits your life.</h2>
        <p className="font-body mt-1 text-[18px] font-bold text-sage">Explore at your own pace.</p>
      </Reveal>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="flex min-h-[460px] w-[85%] shrink-0 snap-start flex-col rounded-[22px] bg-snow p-6 sm:w-[340px] sm:min-h-[480px]"
          >
            <p className="text-gradient-rp self-start font-thai text-[26px] font-bold leading-tight">{plan.title}</p>
            <p className="font-body mt-2 text-[20px] font-bold leading-snug text-ink">
              {plan.tagLines.map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
            <div className="mt-4 border-t" style={{ borderColor: "var(--gray)" }} />

            <ul className="mt-4 flex flex-1 flex-col gap-3">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="font-thai flex gap-2.5 text-[15px] font-medium leading-snug text-ink">
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--red)" }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow font-thai mt-6 inline-block self-start rounded-full px-6 py-3 text-[15px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03]"
              style={{ background: "var(--red)" }}
            >
              ปรึกษาฟรี
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
