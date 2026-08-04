import Reveal from "./Reveal";
import { LINE_URL } from "@/lib/links";

const steps = [
  {
    title: "ปรึกษาฟรี ไม่มีข้อผูกมัด",
    body: "คุยกับตัวแทนเพื่อทำความเข้าใจเป้าหมาย ความต้องการ และความเสี่ยงของคุณ ก่อนตัดสินใจ",
  },
  {
    title: "วางแผนที่ใช่สำหรับคุณ",
    body: "ออกแบบความคุ้มครองให้เหมาะกับเป้าหมาย ช่วงชีวิต และงบประมาณของคุณโดยเฉพาะ",
  },
  {
    title: "ติดต่อตัวแทนได้ตลอด",
    body: "มีตัวแทนมืออาชีพดูแลคุณอย่างต่อเนื่อง พร้อมตอบทุกคำถาม ช่วยตรวจสอบการเตรียมเอกสาร แนะนำการเคลม เมื่อคุณต้องการ",
  },
  {
    title: "อัปเดตสิทธิประโยชน์อยู่เสมอ",
    body: "ไม่พลาดสิทธิพิเศษ โปรโมชั่น และข่าวสารใหม่ ๆ ที่เป็นประโยชน์กับกรมธรรม์ของคุณ",
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-16" style={{ background: "var(--snow)" }}>
      <div className="mx-auto flex max-w-[560px] flex-col gap-10 px-6 sm:px-8">
        {steps.map((step) => (
          <Reveal key={step.title}>
            <h3 className="font-thai text-[19px] font-bold text-ink">{step.title}</h3>
            <div className="mt-3 border-t" style={{ borderColor: "var(--gray)" }} />
            <p className="font-thai mt-3 text-[15px] leading-relaxed text-sage">{step.body}</p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow font-thai mt-4 inline-block rounded-full px-5 py-2.5 text-[13px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03]"
              style={{ background: "var(--red)" }}
            >
              ปรึกษาฟรี
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
