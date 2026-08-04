import Reveal from "./Reveal";
import { LINE_URL } from "@/lib/links";

export default function FinalCtaFooter() {
  return (
    <>
      <section id="contact" className="py-16" style={{ background: "var(--snow)" }}>
        <Reveal className="mx-auto max-w-[560px] px-6 text-center sm:px-8">
          <p className="font-body text-[16px] font-semibold text-red">suvicha.life</p>
          <h2 className="mt-4 text-[34px] font-bold leading-tight text-ink sm:text-[40px]">
            All it takes is today.
            <br />
            The rest is yours to live.
          </h2>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow font-thai mt-12 inline-block rounded-full px-8 py-3.5 text-[15px] font-semibold text-snow transition-transform duration-300 hover:scale-[1.03]"
            style={{ background: "var(--red)" }}
          >
            ปรึกษาฟรี
          </a>
        </Reveal>
      </section>

      <footer className="px-6 py-14 sm:px-8" style={{ background: "var(--footer-ink)" }}>
        <div className="mx-auto max-w-[560px]">
          <h3 className="text-[40px] font-bold text-white">Meet Suvicha</h3>

          <div className="font-thai mt-6 flex flex-col gap-4 text-[13px] leading-relaxed text-white/60">
            <p>
              สุวิชชา แซ่เอี้ยว เป็นตัวแทนประกันชีวิต สังกัดบริษัท เอไอเอ จำกัด
              <br />
              หน่วยพินนาเคิล เวลท์ (รหัสหน่วย 08440) รหัสตัวแทน 0000719102
              <br />
              ได้รับใบอนุญาตเป็นตัวแทนประกันชีวิตเลขที่ 6901000760
              <br />
              ออกให้เมื่อวันที่ 13 มกราคม 2569
            </p>
            <p>
              เว็บไซต์นี้จัดทำขึ้นโดยตัวแทนประกันชีวิตเพื่อวัตถุประสงค์ในการให้ข้อมูลเบื้องต้น
              และอำนวยความสะดวกในการติดต่อสื่อสารกับลูกค้าเท่านั้น เนื้อหาทั้งหมดในเว็บไซต์นี้จัดทำขึ้น
              โดยตัวแทนแต่เพียงผู้เดียว
              <br />
              เว็บไซต์นี้ไม่ใช่เว็บไซต์ทางการของ บริษัท เอไอเอ จำกัด รายละเอียดความคุ้มครอง เงื่อนไข
              และผลประโยชน์ที่ปรากฏบนเว็บไซต์นี้เป็นเพียงข้อมูลเบื้องต้นเพื่อประกอบการตัดสินใจ
              ผู้ขอเอาประกันภัยควรศึกษาและทำความเข้าใจในเอกสารเสนอขายก่อนตัดสินใจทำประกันภัยทุกครั้ง
              เมื่อได้รับกรมธรรม์แล้ว โปรดศึกษารายละเอียด ข้อกำหนด และเงื่อนไขในกรมธรรม์อย่างละเอียด
            </p>
            <p>
              หากต้องการติดต่อบริษัท เอไอเอ จำกัด โดยตรง สามารถดูรายละเอียดได้ที่{" "}
              <a href="https://www.aia.co.th" target="_blank" rel="noopener noreferrer" className="underline">
                www.aia.co.th
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
