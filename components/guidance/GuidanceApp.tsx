"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  MapPin,
  Wallet,
  Heart,
  Brain,
  Puzzle,
  ChevronRight,
  ArrowLeftRight,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Wrench,
  Compass,
  Target,
  Users,
  Phone,
  Star,
  Clock,
  TrendingUp,
  Scale,
  Sparkles,
  Eye,
  Zap,
  Home,
  ChevronDown,
  Copy,
  Check,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
} from "lucide-react";

// Kanit first (not Pretendard-first like the main site's body stack): this
// page is Thai-heavy, and Safari/WebKit doesn't reliably fall through
// per-glyph to the next font in a stack the way Chromium does, so a
// broad-coverage font listed first (Pretendard) can "win" the font match for
// Thai characters even without real glyphs for them, rendering as a system
// fallback. Putting Kanit first avoids that ambiguity; it has full Latin
// coverage too, so English text on this page still renders correctly.
const F = "var(--font-kanit), var(--font-pretendard), -apple-system, sans-serif";

// Brand palette pulled from the insurance site (app/globals.css). The six
// former Apple-style topic hues (green/gold/purple/blue/orange) are remapped
// onto the red-pink-maroon-sage family so this page reads as one brand with
// the insurance site, while staying distinguishable topic-to-topic.
const C = {
  bg: "#FFFFFF",
  tx: "#2A3239", // ink
  su: "#6E777D", // muted ink (secondary text)
  li: "#E4E5E6", // gray
  ln: "#E4E5E6", // gray (hairlines)
  red: "#D21244", // red
  pink: "#E37995", // pink
  green: "#8A9992", // sage — pathways
  gold: "#5C0E21", // maroon — finance
  purple: "#3A0512", // maroon-deep — mental health
  blue: "#B23A5A", // rose — multiple intelligences
  orange: "#7A2142", // plum — time management
};

const EASE_REVEAL = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_MORPH = "cubic-bezier(0.4, 0, 0.2, 1)";

const toRgb = (h: string) => {
  const x = h.replace("#", "");
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)].join(",");
};

function useReveal() {
  const r = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [r, v] as const;
}

function Rv({
  children,
  delay = 0,
  y = 28,
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  style?: CSSProperties;
}) {
  const [r, v] = useReveal();
  return (
    <div
      ref={r}
      style={{
        ...style,
        opacity: v ? 1 : 0,
        transform: v ? "none" : `translateY(${y}px)`,
        transition: `opacity .8s ${EASE_REVEAL} ${delay}s,transform .8s ${EASE_REVEAL} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Gl({ children, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.55)",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,.05)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Pill({ label, color = C.red }: { label: string; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: color,
        color: "#FFF",
        borderRadius: 999,
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

const TOPICS = [
  { id: "pathways", label: "เส้นทาง", color: C.green, Icon: MapPin, sub: "8 เส้นทางหลังจบ ม.3", preview: ["จากสายสามัญถึง IGCSE — แต่ละเส้นทางเหมาะกับใคร?", "TCAS 4 รอบ และช่วงเวลาที่ต้องรู้", "เปรียบเทียบแบบเห็นภาพ ตัดสินใจอย่างมีข้อมูล"] },
  { id: "finance", label: "การเงิน", color: C.gold, Icon: Wallet, sub: "พร้อมสู่โลกจริง — เริ่มที่เรื่องเงิน", preview: ["เงินสดหรือผ่อน? เช่าหรือซื้อ? ฝึกคิดก่อนใช้เงินจริง", "พีระมิดการเงินส่วนบุคคล — สร้างฐานรากก่อนลงทุน", "กฎ 50-30-20 ที่ทำให้เงินเหลือทุกเดือน"] },
  { id: "sex", label: "เพศศึกษา", color: C.pink, Icon: Heart, sub: "ร่างกาย สิทธิ์ กฎหมาย", preview: ["ร่างกาย ความสัมพันธ์ที่ดี และสิทธิ์ที่คุณมี", "ความหลากหลายทางเพศ — สิ่งที่ทุกคนควรเข้าใจ", "ภัยออนไลน์ กฎหมาย และวิธีปกป้องตัวเอง"] },
  { id: "mental", label: "สุขภาพจิต", color: C.purple, Icon: Brain, sub: "เครื่องมือรับมือชีวิต", preview: ["ทำความเข้าใจอารมณ์และความเครียดของตัวเอง", "5 เครื่องมือที่ใช้ได้ทันทีเมื่อรู้สึกหนัก", "รู้จักขอความช่วยเหลือ — ไม่ใช่เรื่องอ่อนแอ"] },
  { id: "mi", label: "พหุปัญญา", color: C.blue, Icon: Puzzle, sub: "ค้นพบความฉลาดที่ซ่อนอยู่", preview: ["ค้นพบว่าคุณฉลาดแบบไหน ใน 8 ด้านของ Howard Gardner", "เชื่อมความถนัดกับเส้นทางอาชีพที่ใช่", "ทักษะที่โลกยุคใหม่ต้องการจากคุณ"] },
  { id: "time", label: "Time Management", color: C.orange, Icon: Calendar, sub: "ออกแบบ 24 ชั่วโมงของคุณ", preview: ["ทำไมคนที่ 'ยุ่งตลอดวัน' ถึงไม่ได้ผลลัพธ์อะไร", "วิธีออกแบบ 24 ชั่วโมงของคุณให้มีความหมาย", "ระบบสีและหมวดหมู่ที่ทำให้ปฏิทินอ่านง่าย"] },
];

const PATHS = [
  { name: "สายสามัญ (มัธยมศึกษาตอนปลาย)", Icon: BookOpen, color: C.green, time: "3 ปี", cost: "ต่ำ — รัฐบาลอุดหนุน", next: "มหาวิทยาลัยทุกสาขาผ่านระบบ TCAS", fit: "ต้องการศึกษาต่อมหาวิทยาลัย หรือยังไม่แน่ใจทิศทาง", d: "แผนการเรียนมีวิทยาศาสตร์-คณิตศาสตร์ ศิลปะ-คำนวณ ศิลปะ-ภาษา และศิลปะ-สังคม โรงเรียนชั้นนำหลายแห่งเปิดห้องเรียนพิเศษเพิ่มเติม เช่น สายวิทยาศาสตร์สุขภาพ สายวิศวกรรม และห้องเรียนภาษาอังกฤษเข้มข้น (MEP/IEP) เพื่อเตรียมความพร้อมสู่คณะที่ต้องการโดยตรง" },
  { name: "อาชีวศึกษา (ประกาศนียบัตรวิชาชีพ)", Icon: Wrench, color: C.blue, time: "3 ปี (ต่อ ปวส. ได้อีก 2 ปี)", cost: "ต่ำ — รัฐบาลอุดหนุน", next: "ทำงาน หรือต่อปริญญาตรีสายเทคโนโลยี", fit: "ชอบเรียนรู้จากการปฏิบัติจริง ต้องการมีทักษะวิชาชีพเร็ว", d: "เน้นทักษะปฏิบัติในสถานประกอบการ สาขาครอบคลุมช่างอุตสาหกรรม เทคโนโลยีสารสนเทศ พาณิชยกรรม เกษตรกรรม และการท่องเที่ยว สำเร็จการศึกษาทำงานได้ทันที หรือต่อประกาศนียบัตรวิชาชีพชั้นสูงแล้วเข้ามหาวิทยาลัยสายเทคโนโลยีผ่านโควตา" },
  { name: "โรงเรียนเตรียมทหาร-ตำรวจ", Icon: Shield, color: C.gold, time: "7 ปี (เตรียมทหาร 2 ปี + สถาบัน 5 ปี)", cost: "รัฐบาลออกค่าใช้จ่ายทั้งหมด รวมค่าครองชีพ", next: "ปริญญาตรี พร้อมยศนายทหารหรือนายตำรวจ", fit: "มีเป้าหมายรับราชการทหารหรือตำรวจ มีวินัยสูง ร่างกายแข็งแรง", d: "เริ่มที่โรงเรียนเตรียมทหาร 2 ปี คัดเลือกเข้าสถาบันหลักอีก 5 ปี ได้แก่ โรงเรียนนายร้อยพระจุลจอมเกล้า โรงเรียนนายเรือ โรงเรียนนายเรืออากาศ หรือโรงเรียนนายร้อยตำรวจ การสอบแข่งขันสูงมาก มีการทดสอบร่างกาย สุขภาพ สายตา และส่วนสูงอย่างเข้มงวด" },
  { name: "การศึกษานอกระบบ (กศน.)", Icon: Home, color: C.pink, time: "3 ปี (ยืดหยุ่นตามอัธยาศัย)", cost: "ต่ำมาก — แทบไม่มีค่าใช้จ่าย", next: "ทำงาน หรือมหาวิทยาลัยเปิด", fit: "ต้องทำงานช่วยครอบครัว ต้องการความยืดหยุ่น", d: "เรียนวันเสาร์-อาทิตย์ ออนไลน์ หรือที่ศูนย์การศึกษานอกระบบในพื้นที่ ได้รับวุฒิเทียบเท่ามัธยมศึกษาปีที่ 6 สามารถนำไปสมัครงานและมหาวิทยาลัยได้ ต้องมีวินัยในตนเองสูง เพราะไม่มีโครงสร้างชั้นเรียนที่ตายตัว" },
  { name: "โครงการเรียนล่วงหน้า (Pre-degree)", Icon: Zap, color: C.purple, time: "เรียนควบคู่กับมัธยมปลาย", cost: "ปานกลางถึงสูง", next: "เข้ามหาวิทยาลัยพร้อมหน่วยกิตสะสม", fit: "มีผลการเรียนดีเยี่ยม ต้องการก้าวล้ำหน้าทางวิชาการ", d: "โครงการของ สสวท. หลักสูตรห้องเรียนพิเศษ หรือ Dual Enrollment ของมหาวิทยาลัยชั้นนำ สะสมหน่วยกิตปริญญาตรีในช่วงมัธยมปลาย ทำให้เรียนจบเร็วขึ้นและได้เปรียบใน TCAS รอบ Portfolio" },
  { name: "มหาวิทยาลัยเปิด (รามคำแหง / มสธ.)", Icon: GraduationCap, color: C.red, time: "4-6 ปี (ยืดหยุ่นตามจังหวะ)", cost: "ต่ำมาก — หลักพันถึงหมื่นต้นต่อปี", next: "ปริญญาตรี ควบคู่กับการทำงาน", fit: "ต้องการทำงานและเรียนไปพร้อมกัน ต้องการความยืดหยุ่นสูงสุด", d: "มหาวิทยาลัยรามคำแหงและมหาวิทยาลัยสุโขทัยธรรมาธิราชรับนักศึกษาที่มีวุฒิมัธยมศึกษาปีที่ 6 เรียนด้วยตนเองผ่านตำราและสื่อการสอน ค่าเล่าเรียนต่ำมาก เหมาะสำหรับผู้ที่ต้องทำงานหารายได้ควบคู่กับการศึกษา" },
  { name: "GED (General Educational Development)", Icon: Compass, color: C.green, time: "6-12 เดือน", cost: "ปานกลาง — ค่าสอบ 4,000-6,000 บาท", next: "มหาวิทยาลัยต่างประเทศ และบางมหาวิทยาลัยในไทย", fit: "มีความสามารถภาษาอังกฤษดี มีเป้าหมายต่างประเทศ", d: "สอบ 4 วิชา คณิตศาสตร์ วิทยาศาสตร์ สังคมศึกษา และการใช้ภาษา ได้วุฒิเทียบเท่ามัธยมศึกษาตอนปลายของสหรัฐอเมริกา ต่อมหาวิทยาลัยต่างประเทศได้โดยตรง" },
  { name: "IGCSE / A-Level (Cambridge)", Icon: Target, color: C.blue, time: "4 ปี (IGCSE 2 ปี + A-Level 2 ปี)", cost: "สูงมาก — หลักแสนบาทต่อปี", next: "มหาวิทยาลัยชั้นนำทั่วโลก", fit: "มีทรัพยากรเพียงพอ มีเป้าหมายต่างประเทศชัดเจน", d: "หลักสูตรจาก Cambridge ยอมรับจากมหาวิทยาลัยชั้นนำทั้ง UK US Australia และเอเชีย ต้องเรียนในโรงเรียนนานาชาติหรือสถาบันเอกชนที่ได้รับการรับรอง" },
];

const TCAS_R = [
  { r: "1", name: "Portfolio", m: "ธ.ค. – ม.ค.", d: "ยื่นแฟ้มสะสมผลงาน ไม่ใช้คะแนนสอบกลาง เหมาะสำหรับผู้มีความสามารถพิเศษ", c: C.green },
  { r: "2", name: "Quota", m: "ก.พ. – เม.ย.", d: "โควตาพื้นที่และโครงการพิเศษ แต่ละมหาวิทยาลัยกำหนดเกณฑ์เอง", c: C.blue },
  { r: "3", name: "Admission", m: "พ.ค.", d: "Admission กลาง เลือกได้ 10 อันดับ ใช้คะแนน A-Level, TGAT และ TPAT", c: C.gold },
  { r: "4", name: "Direct", m: "พ.ค. – มิ.ย.", d: "รับตรงอิสระ แต่ละมหาวิทยาลัยเปิดรับเอง มักเป็นที่นั่งเหลือจากรอบก่อน", c: C.pink },
];

const PYR = [
  { l: "กระจายทรัพย์สิน", c: C.red, d: "วางแผนส่งต่อทรัพย์สินให้ทายาทผ่านพินัยกรรมและกองทุนครอบครัว ลดความขัดแย้งและรักษาทรัพย์สินที่ใช้เวลาทั้งชีวิตสร้างมา ภาษีมรดกในไทยเริ่มต้นที่ทรัพย์สินเกิน 100 ล้านบาท" },
  { l: "ลงทุน", c: "#B21A47", d: "นำเงินส่วนเกินจากฐาน 3 ชั้นแรกมาลงทุนในกองทุนรวม หุ้น หรืออสังหาริมทรัพย์ หลักสำคัญคือกระจายความเสี่ยง และลงทุนในสิ่งที่เข้าใจจริง ๆ ไม่ใช่ตามกระแส" },
  { l: "เงินเกษียณ", c: "#C22450", d: "ออมระยะยาวให้ดอกเบี้ยทบต้นทำงาน เริ่มตอนอายุ 25 กับ 35 ต่างกันมาก กองทุน RMF และ SSF ในไทยช่วยลดหย่อนภาษีได้ด้วย เป้าหมายคือ 25 เท่าของค่าใช้จ่ายรายปีเมื่อเกษียณ" },
  { l: "ประกัน", c: C.pink, d: "โอนความเสี่ยงที่รับไว้เองไม่ไหวให้บริษัทประกัน ค่ารักษา ICU สูงวันละ 20,000-50,000 บาท ประกันไม่ใช่การลงทุน แต่คือการป้องกัน ถ้าไม่ต้องใช้คือโชคดี ถ้าต้องใช้คือช่วยชีวิต" },
  { l: "เงินสำรองฉุกเฉิน", c: "#EFA8BB", d: "3-6 เท่าของค่าใช้จ่ายรายเดือน เพื่อรองรับการตกงาน เจ็บป่วย หรือเหตุฉุกเฉินที่ไม่คาดคิด เก็บในบัญชีออมทรัพย์สภาพคล่องสูง ถ้ามีมากกว่า 12 เท่าควรย้ายส่วนเกินไปลงทุน" },
];

const VS: string[][] = [
  ["Buy Now Pay Now", "Buy Now Pay Later", "BNPL ดูฟรีแต่ดอกเบี้ยซ่อน", "ถ้าพลาดชำระ ดอกเบี้ยปรับสูงถึง 24%/ปี และกระตุ้นให้ใช้จ่ายเกินตัวโดยไม่รู้สึกตัว"],
  ["ต้องการ", "จำเป็น", "อยากได้ ≠ ต้องมี", "ถามว่าถ้าไม่ซื้อชีวิตจะเดือดร้อนจริงไหม? ทักษะนี้คือรากฐานที่สำคัญที่สุดของการบริหารการเงิน"],
  ["ทำอาหารเอง", "สั่ง Delivery", "ราคาอาหารไม่ใช่ต้นทุนทั้งหมด", "ค่านายหน้า 30-35% + ค่าส่ง = อาหาร 80 บาทกลายเป็น 150 บาท คำนวณให้ครบก่อนตัดสินใจ"],
  ["ของมือสอง", "ของใหม่", "ถูกกว่าเสมอจริงไหม?", "หนังสือ เฟอร์นิเจอร์คุ้มมาก แต่ที่นอนและเครื่องสำอางต้องระวัง ชั่งน้ำหนักราคา ความปลอดภัย อายุใช้งาน"],
  ["แบรนด์เนม", "สินค้าทั่วไป", "ราคา ≠ คุณภาพ", "ส่วนหนึ่งของราคาแบรนด์คือค่าการตลาด ยาสามัญกับยาแบรนด์ตัวยาเดียวกัน ราคาต่างกันหลายเท่า"],
  ["เงินสด", "กระเป๋าดิจิทัล", "จ่ายง่ายขึ้น ใช้มากขึ้น?", "งานวิจัยพบคนใช้เงินดิจิทัลมากกว่าเงินสด 12-18% กุญแจคือต้องติดตามยอดอย่างสม่ำเสมอ"],
  ["ซื้อออนไลน์", "ซื้อที่ร้าน", "ออนไลน์ถูกกว่าเสมอ?", "บวกค่าส่ง เวลารอ ของไม่ตรงปก ค่าคืนของ อาจทำให้ราคารวมไม่ต่างจากร้านมากนัก"],
  ["จ่ายสด", "ผ่อนชำระ", "ผ่อนไม่ได้แย่เสมอ", "ถ้าดอกเบี้ยผ่อน 3%/ปี แต่ลงทุนได้ 7%/ปี การผ่อนอาจดีกว่า แต่ถ้าดอกเบี้ยสูงกว่าผลตอบแทนควรจ่ายสด"],
  ["เช่า", "ซื้อ", "เช่า = เสียเปล่าจริงไหม?", "เช่า 15k/เดือน กับผ่อน 30k/เดือน ส่วนต่าง 15k ถ้าลงทุนทุกเดือนอาจสร้างความมั่งคั่งมากกว่า"],
  ["ซื้อรถก่อน", "ซื้อบ้านก่อน", "รถเสื่อม บ้านอาจงอก", "รถใหม่เสียมูลค่า 20-30% ปีแรก ราคาที่ดินโดยรวมมักเพิ่มขึ้นตามเวลา แต่ต้องพิจารณาทำเลด้วย"],
  ["รถยนต์น้ำมัน", "รถยนต์ไฟฟ้า", "คิด Total Cost ทั้งชีวิต", "EV ค่าพลังงานถูกกว่า 60-70% แต่ต้องพิจารณาสถานีชาร์จในพื้นที่และอายุแบตเตอรี่ด้วย"],
  ["ยืมเงินเพื่อน", "กู้สถาบันการเงิน", "ต้นทุนคือความสัมพันธ์", "ยืมเพื่อนดูฟรี แต่ถ้าคืนช้า ความสัมพันธ์หลายปีอาจพังในพริบตา ควรกู้จากสถาบันที่มีสัญญาชัดเจน"],
  ["ออมก่อน", "ใช้ก่อนค่อยออม", "ที่เหลือมักไม่เคยเหลือ", "Pay Yourself First: โอนเงินออมออกทันทีที่รับเงิน ก่อนใช้จ่ายอะไร"],
  ["เงินฝากธนาคาร", "กองทุนรวม", "เงินเฟ้อกินเงินออม", "ดอกเบี้ยออมทรัพย์ 0.5-1%/ปี ขณะที่เงินเฟ้อ 2-3%/ปี เงินที่ฝากธนาคารสูญเสียกำลังซื้อทุกปี"],
  ["สินทรัพย์ดิจิทัล", "กองทุนรวม", "ผลตอบแทนสูง ความเสี่ยงก็สูง", "Crypto ผันผวน 50-80%/ปี กองทุนหุ้นระยะยาวให้ 7-12%/ปี ต้องถามตัวเองว่ารับความผันผวนได้มากแค่ไหน"],
  ["มีประกัน", "ไม่มีประกัน", "ไม่เจ็บ = เสียเปล่า?", "ค่ารักษา ICU 50,000-100,000 บาท/วัน ไม่มีประกัน = หมดตัว ค่าเบี้ยรายเดือนเทียบไม่ได้กับความเสี่ยงที่โอนไป"],
  ["ลงทุนในทักษะ", "ลงทุนในสินทรัพย์", "ทักษะไม่มีใครพรากไปได้", "ทักษะใหม่อาจเพิ่มรายได้ตลอดชีวิต 20-50% ในช่วงแรกของชีวิต การลงทุนในตัวเองให้ผลตอบแทนสูงที่สุด"],
  ["Freelance", "งานประจำ", "อิสระ vs ความมั่นคง", "Freelance ไม่มีสวัสดิการ วันลาป่วย ประกันสังคม แต่มีความยืดหยุ่น ทางที่ดีคือทำประจำแล้วค่อยสร้างรายได้เสริม"],
  ["รายได้ทางเดียว", "รายได้หลายทาง", "ฟังดูดี แต่ต้องระวัง", "ถ้างานหลักยังไม่แข็งแรงพอ การเพิ่มงานจะยิ่งทำให้ทุกอย่างแย่ลง สร้างฐานให้มั่นคงก่อน"],
  ["เรียนต่อมหาวิทยาลัย", "เข้าตลาดแรงงานทันที", "ไม่มีคำตอบถูกหรือผิด", "บางอาชีพต้องมีวุฒิ เช่น แพทย์ ทนาย วิศวกร บางอาชีพให้ความสำคัญกับประสบการณ์มากกว่า"],
];

const MI_D = [
  { n: "ภาษา", c: C.blue, Icon: BookOpen, desc: "คิดผ่านคำพูด ชอบอ่านเขียน เล่าเรื่อง", signs: "ชอบอ่านมากกว่าดูรูป จำเนื้อเพลงเร็ว คิดเป็นประโยคในหัว", jobs: "นักเขียน ทนายความ ครู ผู้ดำเนินรายการ", detail: "ผู้ที่มีความฉลาดด้านภาษาสูงจะประมวลผลโลกผ่านคำพูดและข้อความ มักอธิบายสิ่งซับซ้อนให้คนอื่นเข้าใจได้ง่าย ระบบการศึกษาส่วนใหญ่ออกแบบมาเพื่อคนกลุ่มนี้ ทำให้บางครั้งเราเข้าใจผิดว่านี่คือ 'ฉลาด' แบบเดียวที่มีคุณค่า ทั้งที่จริงความฉลาดมีหลายรูปแบบ" },
  { n: "ตรรกะ-คณิตศาสตร์", c: C.green, Icon: TrendingUp, desc: "คิดแบบระบบ ชอบหาเหตุผลและแบบแผน", signs: "ชอบเกมหรือปริศนา ทำทุกอย่างเป็นขั้นตอน ชอบหาความสัมพันธ์ในข้อมูล", jobs: "วิศวกร นักพัฒนาซอฟต์แวร์ นักวิทยาศาสตร์ แพทย์", detail: "ความสามารถมองเห็นความสัมพันธ์เชิงตรรกะ วิเคราะห์ปัญหาเป็นระบบ และหาวิธีแก้ปัญหาที่มีประสิทธิภาพ ยุคดิจิทัลทำให้ทักษะด้านนี้มีความต้องการสูงขึ้นมากในตลาดแรงงาน โดยเฉพาะสาขา Data Science และ AI" },
  { n: "มิติสัมพันธ์", c: C.gold, Icon: Eye, desc: "คิดเป็นภาพ จินตนาการ ออกแบบ", signs: "จินตนาการภาพในหัวได้ชัดเจนก่อนทำ ชอบวาดหรือออกแบบ จำหน้าคนดีกว่าจำชื่อ", jobs: "สถาปนิก นักออกแบบกราฟิก ช่างภาพ UX/UI Designer", detail: "ผู้ที่มีความฉลาดด้านนี้มองเห็นภาพสามมิติในหัวก่อนที่มันจะมีอยู่จริง มักเป็นคนที่เห็นภาพรวมได้ก่อนคนอื่น และเรียนรู้ได้ดีที่สุดจากแผนผัง ไดอะแกรม และการสาธิตภาพ" },
  { n: "ดนตรี", c: C.pink, Icon: Sparkles, desc: "รับรู้โลกผ่านเสียงและจังหวะ", signs: "เคาะจังหวะโดยไม่รู้ตัว รู้สึกได้ว่าเพลงคีย์ผิด จำทำนองเร็วกว่าเนื้อร้อง", jobs: "นักดนตรี วิศวกรเสียง ครูดนตรี นักบำบัดด้วยดนตรี", detail: "ความสามารถรับรู้รูปแบบเสียง จังหวะ และความสัมพันธ์ระหว่างเสียงได้ไวกว่าคนทั่วไป งานวิจัยพบว่าการฝึกดนตรีตั้งแต่เด็กยังช่วยพัฒนาความฉลาดด้านคณิตศาสตร์และภาษาได้ด้วย" },
  { n: "ร่างกาย", c: C.red, Icon: Zap, desc: "เรียนรู้ผ่านการลงมือทำ สัมผัสจริง", signs: "จำสิ่งที่ทำได้ดีกว่าสิ่งที่อ่าน รู้สึกอึดอัดเมื่อนั่งนิ่งนาน", jobs: "นักกีฬา ศัลยแพทย์ เชฟ ช่างฝีมือ นักแสดง", detail: "ความสามารถควบคุมร่างกายได้อย่างแม่นยำและเรียนรู้ผ่านการสัมผัสและการเคลื่อนไหว ศัลยแพทย์ระดับโลกหลายคนมีความฉลาดด้านนี้สูงมาก ควบคู่กับด้านตรรกะและมิติสัมพันธ์" },
  { n: "มนุษยสัมพันธ์", c: C.purple, Icon: Users, desc: "อ่านคนออก เข้าใจอารมณ์ ประสานงาน", signs: "รู้สึกได้ว่าคนนี้ไม่โอเคแม้เขาไม่บอก เพื่อนมักมาเล่าปัญหาให้ฟัง", jobs: "นักทรัพยากรมนุษย์ นักจิตวิทยา นักการทูต ผู้นำองค์กร", detail: "ความสามารถอ่านและตอบสนองต่ออารมณ์ของคนอื่นได้อย่างแม่นยำ ในยุคที่ AI ทำงานซ้ำ ๆ ได้ ทักษะมนุษย์ด้านนี้กลับมีค่ามากขึ้นเรื่อย ๆ ผู้นำที่ประสบความสำเร็จมักมีความฉลาดด้านนี้สูง" },
  { n: "เข้าใจตนเอง", c: C.blue, Icon: Compass, desc: "รู้จักตัวเองลึก มีเป้าหมายชัดเจน", signs: "ชอบเขียนบันทึก รู้ว่าตัวเองรู้สึกอย่างไรและทำไม มีค่านิยมที่ไม่เปลี่ยนง่าย", jobs: "ผู้ประกอบการ โค้ชชีวิต นักวิจัย นักจิตวิทยาคลินิก", detail: "การรู้จักตัวเองลึกซึ้งทำให้ตัดสินใจได้ดีขึ้น รับมือกับความเครียดได้มีประสิทธิภาพมากขึ้น การเขียนบันทึกและการทำ Mindfulness ช่วยพัฒนาความฉลาดด้านนี้ได้จริง" },
  { n: "ธรรมชาติ", c: C.green, Icon: Target, desc: "สังเกตธรรมชาติ รักการจำแนกและจัดหมวดหมู่", signs: "สังเกตเห็นการเปลี่ยนแปลงของสัตว์ พืช สภาพอากาศ รู้สึกผ่อนคลายในธรรมชาติ", jobs: "นักชีววิทยา สัตวแพทย์ นักสิ่งแวดล้อม เกษตรกรยุคใหม่", detail: "ความสามารถพิเศษในการจำแนกและหาแบบแผนในธรรมชาติ Gardner เพิ่มความฉลาดด้านนี้เป็นลำดับสุดท้าย สำคัญมากขึ้นในยุคที่โลกต้องการผู้เชี่ยวชาญด้านสิ่งแวดล้อม" },
];

const SK21: [string, string, string][] = [
  ["Critical Thinking", C.blue, "ความสามารถในการวิเคราะห์ข้อมูล ตั้งคำถามกับสิ่งที่ได้ยินหรืออ่าน และสรุปอย่างมีเหตุผลโดยไม่ถูกอคติหรืออารมณ์ครอบงำ ทักษะนี้ไม่ใช่แค่การโต้เถียง แต่คือการหาข้อเท็จจริง ตรวจสอบแหล่งที่มา แยกแยะระหว่างข้อเท็จจริงและความคิดเห็น และสรุปผลจากหลักฐานที่มีอยู่ ในยุคข่าวปลอมและ AI สร้างเนื้อหาได้ทุกชนิด ทักษะนี้สำคัญกว่าที่เคยเป็นมา การฝึกฝนทำได้โดยตั้งคำถามว่า 'รู้ได้อย่างไร' และ 'หลักฐานคืออะไร' กับทุกสิ่งที่พบเจอ"],
  ["Creativity", C.pink, "ความสามารถในการสร้างสิ่งใหม่ มองปัญหาจากมุมที่คนอื่นยังไม่เห็น และหาทางออกที่ไม่ใช่วิธีเดิม ๆ ความคิดสร้างสรรค์ไม่ได้จำกัดอยู่แค่ศิลปะหรือดนตรี แต่รวมถึงการออกแบบวิธีแก้ปัญหาใหม่ การสร้างผลิตภัณฑ์หรือบริการใหม่ และการมองเห็นโอกาสที่คนอื่นมองข้าม AI เก่งในงานซ้ำ ๆ แต่ยังทำความคิดสร้างสรรค์แทนมนุษย์ไม่ได้ ทักษะนี้จะยิ่งมีคุณค่าขึ้นเรื่อย ๆ ในอนาคต"],
  ["Communication", C.green, "ความสามารถในการถ่ายทอดความคิดให้คนอื่นเข้าใจอย่างชัดเจน ทั้งการพูด การเขียน การนำเสนอ และการฟัง การสื่อสารที่ดีไม่ใช่แค่พูดเก่ง แต่คือการเข้าใจผู้ฟัง ปรับรูปแบบให้เหมาะกับสถานการณ์ และรับฟังอย่างตั้งใจ ในโลกที่ทุกคนมีข้อมูลพอ ๆ กัน คนที่สื่อสารได้ดีกว่ามักมีความได้เปรียบในทุกสาขาอาชีพ"],
  ["Collaboration", C.gold, "ความสามารถในการทำงานร่วมกับผู้ที่มีบุคลิก ทักษะ และมุมมองแตกต่างกัน โครงการในโลกจริงมักต้องการทีมที่หลากหลาย ไม่มีใครทำทุกอย่างคนเดียวได้ดีที่สุด ความสามารถในการร่วมงานกับคนอื่นโดยไม่จำเป็นต้องเอาชนะ การรับฟังความคิดเห็นที่ต่างออกไป และการสร้างผลลัพธ์ร่วมกัน คือทักษะที่ขาดแคลนอย่างแท้จริงในตลาดแรงงาน"],
  ["Digital Literacy", C.purple, "ความสามารถในการใช้เทคโนโลยีอย่างมีประสิทธิภาพและปลอดภัย รู้เท่าทัน Algorithm ที่ส่งผลต่อชีวิตประจำวัน เข้าใจว่า AI ทำงานอย่างไร รู้จักรักษาความเป็นส่วนตัวในโลกดิจิทัล และสามารถประเมินความน่าเชื่อถือของข้อมูลออนไลน์ได้ ทักษะนี้ไม่ใช่แค่ใช้โทรศัพท์เป็น แต่คือการเข้าใจกลไกเบื้องหลังและใช้เทคโนโลยีเพื่อสร้างประโยชน์ ไม่ใช่แค่บริโภค"],
  ["Adaptability", C.orange, "ความสามารถในการเรียนรู้สิ่งใหม่ได้อย่างต่อเนื่อง ปรับตัวได้เมื่อสถานการณ์เปลี่ยนแปลง และไม่ยึดติดกับวิธีเดิม ๆ โลกเปลี่ยนเร็วมาก อาชีพใหม่เกิดขึ้น อาชีพเดิมหายไป สิ่งที่เรียนในวันนี้อาจล้าสมัยใน 5 ปี คนที่มี Adaptability สูงไม่ได้กลัวการเปลี่ยนแปลง แต่มองว่าทุกการเปลี่ยนแปลงคือโอกาสที่จะเรียนรู้สิ่งใหม่"],
];

const FRIES_DATA = [
  { k: "F", full: "Freely given", th: "ให้โดยอิสระ", d: "ไม่ถูกบังคับ กดดัน หรืออยู่ภายใต้อิทธิพลของแอลกอฮอล์", c: C.red },
  { k: "R", full: "Reversible", th: "เปลี่ยนใจได้ตลอด", d: "บอกว่าใช่แล้วก็มีสิทธิ์บอกว่าไม่ได้ทุกเมื่อ ไม่ต้องให้เหตุผล", c: C.pink },
  { k: "I", full: "Informed", th: "รู้ข้อมูลครบ", d: "ไม่ถูกหลอกหรือปิดบังข้อมูลสำคัญ", c: C.purple },
  { k: "E", full: "Enthusiastic", th: "เต็มใจจริง ๆ", d: "ไม่บอกปฏิเสธ ≠ ยินยอม ต้องเป็นการยินยอมอย่างชัดเจน", c: C.blue },
  { k: "S", full: "Specific", th: "เฉพาะเจาะจง", d: "ยินยอมอย่างหนึ่งไม่ได้แปลว่ายินยอมทุกอย่าง", c: C.green },
];

const LGBT_DATA = [
  { k: "L", n: "Lesbian", d: "หญิงที่รู้สึกดึงดูดไปหาหญิง", note: "ไม่ใช่แฟชั่น ไม่ใช่ช่วงผ่าน", c: C.pink },
  { k: "G", n: "Gay", d: "ชายที่รู้สึกดึงดูดไปหาชาย", note: "ไม่ได้เกิดจากการเลี้ยงดูหรือบาดแผล", c: C.red },
  { k: "B", n: "Bisexual", d: "ดึงดูดได้มากกว่าหนึ่งเพศ", note: "ไม่ใช่การตัดสินใจไม่ได้", c: C.gold },
  { k: "T", n: "Transgender", d: "อัตลักษณ์ทางเพศไม่ตรงกับเพศกำเนิด", note: "ต่างจากรสนิยมทางเพศ", c: C.purple },
  { k: "Q", n: "Queer/Questioning", d: "ยังสำรวจตัวเอง หรือไม่ระบุกรอบ", note: "ปกติมากสำหรับวัยนี้", c: C.blue },
  { k: "I", n: "Intersex", d: "ลักษณะชีววิทยาที่ไม่ชัดเจนแต่กำเนิด", note: "เป็นเรื่องชีววิทยา ไม่ใช่รสนิยม", c: C.green },
  { k: "A", n: "Asexual", d: "ไม่รู้สึกดึงดูดทางเพศ", note: "ไม่ผิดปกติ ไม่ต้องรักษา", c: C.orange },
  { k: "+", n: "และอื่น ๆ", d: "ความหลากหลายที่สเปกตรัมยังกว้างกว่า", note: "ทุกคนมีสิทธิ์นิยามตัวเอง", c: C.su },
];

const CASES = [
  { title: "มายด์ — แค่อยากให้เขาชอบเรา", tags: ["Sexting", "Grooming"], story: "มายด์ (14) คบกับเติ้ลผ่านเกมออนไลน์ 2 เดือนโดยไม่เคยเจอตัวจริง เติ้ลขอรูปส่วนตัวโดยบอกว่า 'ถ้าชอบกันจริงก็ไม่น่าจะมีอะไรต้องกลัว' มายด์กลัวเติ้ลจะเลิกสนใจจึงส่งให้ 2 สัปดาห์ต่อมาเติ้ลหายไป รูปถูกแชร์ในกลุ่มไลน์โรงเรียนอื่น", law: "เติ้ลผิด พรบ.คอมพิวเตอร์ ม.14 (จำคุก 5 ปี) คนที่ forward รูปต่อก็ผิดเท่ากัน", q: ["เติ้ลทำอะไรผิดบ้าง และผิดกฎหมายข้อไหน", "มีสัญญาณเตือนอะไรบ้างที่มายด์น่าสังเกตเห็นได้ก่อน", "ถ้าเพื่อนส่งลิงก์นั้นมาให้เรา เราควรทำอะไร ไม่ทำอะไร", "ถ้าเราเป็นมายด์ ขั้นตอนต่อไปที่ควรทำคืออะไร", "คนที่ forward รูปนั้นต่อมีความผิดไหม"] },
  { title: "ฝน — เราคือแฟนกัน มันต่างกัน", tags: ["Revenge Porn", "เลิกกัน"], story: "ฝนส่งรูปให้โอม (แฟน) โดยเชื่อว่าเก็บไว้ดูคนเดียว หลังเลิกกัน 2 วัน รูปถูกส่งต่อในกลุ่มเด็กมัธยมทั่วจังหวัด ฝนไม่กล้าไปโรงเรียน", law: "โอมผิด พรบ.คอมพิวเตอร์ ม.16 (จำคุก 3 ปี) + PDPA ส่งรูปให้แฟนไม่ได้แปลว่าให้สิทธิ์เขาเอาไปแชร์", q: ["การที่โอมส่งรูปต่อหลังเลิกกัน ผิดกฎหมายอะไรบ้าง", "เพราะเป็นแฟนกัน ทำให้โอมมีสิทธิ์ทำแบบนี้ไหม", "นักเรียนที่ได้รูปมาแล้ว forward ต่อ มีความผิดไหม แม้ไม่รู้ว่าเป็นใคร", "เพื่อนสนิทของฝนควรทำอะไร ไม่ควรทำอะไร", "ฝนทำผิดไหมที่ส่งรูปให้แฟน"] },
  { title: "ต้น — เขาบอกว่าเป็นเด็ก 16", tags: ["Grooming", "Discord"], story: "ต้น (15) คุยกับ 'เจมส์' ที่อ้างว่าอายุ 16 บน Discord นาน 3 เดือน เจมส์ส่งรูปตัวเองมาก่อนแล้วขอตอบแทน ต้นรู้สึกกดดันและส่งให้ ต่อมาพบว่าเจมส์เป็นผู้ใหญ่ที่ทำแบบนี้กับเด็กหลายคน", law: "เจมส์ผิด พรบ.คุ้มครองเด็ก ม.26 (Grooming จำคุก 3 ปี) ต้นเป็นเหยื่อ ไม่มีความผิด", q: ["เจมส์ใช้เทคนิคอะไรในการเข้าหาต้น ทำไมมันถึงได้ผล", "ในบทสนทนาสามเดือน มีสัญญาณเตือนอะไรบ้าง", "การที่เจมส์ส่งรูปมาก่อนแล้วขอตอบแทน เป็นกลยุทธ์อะไร", "ต้นผิดไหม ต้นเป็นเหยื่อไหม", "ถ้ารู้ว่าเพื่อนกำลังคุยกับคนแบบนี้ เราจะทำอย่างไร"] },
  { title: "กลุ่มเพื่อน — แค่ล้อเล่นกัน", tags: ["แอบถ่าย", "กลุ่ม Line"], story: "กลุ่มเพื่อน 8 คนสร้างกลุ่มลับบน Line คนหนึ่งแอบถ่ายเพื่อนหญิงในห้องน้ำโรงเรียนแล้วส่งในกลุ่ม ทุกคนหัวเราะและแซว มีคนส่งต่อออกนอกกลุ่มอีก", law: "คนถ่าย: ป.อาญา + พรบ.คอมฯ (จำคุก 3+5 ปี) คนหัวเราะและไม่ทำอะไร: อาจถูกพิจารณาว่าเป็นส่วนหนึ่ง", q: ["ใครผิดบ้างในเรื่องนี้ ผิดต่างกันระดับไหน", "คนที่แค่หัวเราะแต่ไม่ได้ส่งต่อ มีความผิดไหม", "ถ้าเราอยู่ในกลุ่มนั้นและเห็นรูปขึ้นมา เราควรทำอะไรทันที", "'แค่ล้อเล่น' เป็นเหตุผลที่รับได้ไหม", "ผลกระทบต่อเหยื่อมีอะไรบ้าง ทั้งระยะสั้นและระยะยาว"] },
  { title: "แพร — ถ้าไม่ส่งจะบอกพ่อแม่", tags: ["Sextortion", "กรรโชก"], story: "แพร (14) ถูกเบอร์แปลกโทรมาข่มขู่ว่ามีรูปของเธออยู่ ถ้าไม่ส่งรูปเพิ่มจะส่งให้พ่อแม่และครู แพรไม่กล้าบอกใครและส่งรูปให้อีก 2 ครั้ง แต่การข่มขู่ยังไม่หยุด", law: "ผู้ข่มขู่ผิด ป.อาญา ม.338 กรรโชก (จำคุก 7 ปี) การส่งรูปเพิ่มไม่ทำให้จบ ควรแจ้งผู้ใหญ่ทันทีและอย่าลบหลักฐาน", q: ["สิ่งที่คนโทรมาทำเรียกว่าอะไร และผิดกฎหมายอะไร", "ถ้าแพรส่งรูปให้ไปเรื่อย ๆ มันจะจบไหม เพราะอะไร", "แพรควรทำอะไรเป็นอันดับแรก", "ทำไมแพรถึงไม่กล้าบอกใคร เราจะช่วยให้เพื่อนกล้าพูดได้อย่างไร", "ความรับผิดชอบควรตกที่ใคร ระหว่างแพรกับคนที่ข่มขู่"] },
];

const STI_DATA: string[][] = [
  ["การตั้งครรภ์", "ครั้งแรกก็ตั้งครรภ์ได้ ไม่มีวิธีนับวันที่ปลอดภัย 100%"],
  ["ถุงยางอนามัย", "ประสิทธิภาพ 98% ถ้าใช้ถูกต้องทุกครั้ง เป็นวิธีที่ป้องกันได้ทั้งการตั้งครรภ์และ STIs"],
  ["ยาคุมกำเนิด", "ยาคุมฉุกเฉินต้องกินภายใน 72 ชั่วโมง ไม่ใช่วิธีหลัก ใช้บ่อยส่งผลต่อร่างกาย"],
  ["HIV และ STIs", "HIV ≠ เอดส์ คนที่รับยาสม่ำเสมอใช้ชีวิตปกติได้ PrEP ป้องกันก่อนสัมผัส PEP ต้องกินใน 72 ชม."],
  ["การตรวจสุขภาพ", "เด็กมีสิทธิ์ตรวจสุขภาพทางเพศโดยไม่ต้องให้พ่อแม่รู้ทุกกรณี"],
  ["การตั้งครรภ์ในวัยรุ่น", "มีทางเลือกและสามารถขอความช่วยเหลือได้ที่คลินิกวัยรุ่นของโรงพยาบาลรัฐ"],
];

const LAW_DATA: string[][] = [
  ["อายุความยินยอม", "ไทยกำหนดที่ 15 ปี ต่ำกว่านี้คู่กรณีมีความผิดทางอาญาแม้ผู้เสียหายจะ 'เต็มใจ'"],
  ["แอบถ่าย", "ผิดประมวลกฎหมายอาญา จำคุกสูงสุด 3 ปี"],
  ["แชร์รูปส่วนตัว", "พรบ.คอมพิวเตอร์ ม.14 จำคุกสูงสุด 5 ปี (แม้ส่งแค่คนเดียว)"],
  ["รูปแฟนเก่า", "พรบ.คอมพิวเตอร์ ม.16 + PDPA จำคุก 3 ปี + ค่าเสียหาย"],
  ["Sextortion (กรรโชก)", "ป.อาญา ม.338 จำคุกสูงสุด 7 ปี"],
  ["สื่อลามกเด็ก", "พรบ.คุ้มครองเด็ก + CSAM จำคุกสูงสุด 10 ปี ทั้งดู ส่ง และเก็บ"],
];

function BreathCircle() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [total, setTotal] = useState(120);
  const phases = ["หายใจเข้า", "กลั้นไว้", "หายใจออก", "กลั้นไว้"];

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhase((p) => (p + 1) % 4);
          return 4;
        }
        return c - 1;
      });
      setTotal((t) => {
        if (t <= 1) {
          setActive(false);
          setPhase(0);
          setCount(4);
          return 120;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [active]);

  function stop() {
    setActive(false);
    setPhase(0);
    setCount(4);
    setTotal(120);
  }

  const sc = phase === 0 ? 1.28 : phase === 2 ? 0.82 : phase === 1 ? 1.28 : 0.82;
  const mm = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, "0");

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
        {[["หายใจเข้า", "วงขยาย"], ["กลั้นไว้", "วงหยุด"], ["หายใจออก", "วงหด"], ["กลั้นไว้", "วงหยุด"]].map(([a, b], i) => (
          <div key={i} style={{ textAlign: "center", padding: "6px 10px", background: C.purple + "10", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.purple }}>{a}</div>
            <div style={{ fontSize: 10, color: C.su }}>4 วินาที · {b}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div
          onClick={() => {
            if (!active) {
              setActive(true);
              setPhase(0);
              setCount(4);
              setTotal(120);
            }
          }}
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            cursor: active ? "default" : "pointer",
            background: "rgba(58,5,18,.09)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(58,5,18,.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${active ? sc : 1})`,
            transition: `transform 1.5s ${EASE_MORPH}`,
            boxShadow: `0 0 ${active ? 60 : 15}px rgba(58,5,18,${active ? 0.15 : 0.05})`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>{active ? phases[phase] : "แตะเพื่อเริ่ม"}</div>
          {active && <div style={{ fontSize: 32, fontWeight: 800, color: C.purple, marginTop: 4 }}>{count}</div>}
        </div>
      </div>
      {active && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.purple, fontVariantNumeric: "tabular-nums" }}>
            {mm}:{ss}
          </div>
          <button
            onClick={stop}
            style={{ background: C.li, border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.su, cursor: "pointer", fontFamily: F }}
          >
            หยุด
          </button>
        </div>
      )}
      {!active && <div style={{ fontSize: 12, color: C.su, marginTop: 8, textAlign: "center" }}>หายใจเข้า 4 — กลั้น 4 — หายใจออก 4 — กลั้น 4</div>}
    </div>
  );
}

function BodyScan() {
  const parts = ["เท้าและนิ้วเท้า", "หน้าแข้งและน่อง", "เข่าและต้นขา", "สะโพกและหลังส่วนล่าง", "ท้องและช่วงอก", "ไหล่และแขนทั้งสองข้าง", "คอและลำคอ", "ใบหน้าและหัว"];
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < 0 || step >= parts.length) return;
    const t = setTimeout(() => {
      if (step < parts.length - 1) setStep(step + 1);
      else setDone(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [step, parts.length]);

  return (
    <div style={{ padding: "12px 0" }}>
      <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 14 }}>
        นั่งหลับตา แล้วค่อย ๆ เคลื่อนความสนใจไปทีละส่วนของร่างกาย สังเกตว่ามีความตึง ความเจ็บ หรือความสบาย แค่สังเกตโดยไม่ตัดสิน
      </p>
      {step < 0 && !done && (
        <button
          onClick={() => setStep(0)}
          style={{ background: C.purple, color: "#FFF", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F }}
        >
          เริ่ม Body Scan
        </button>
      )}
      {step >= 0 && !done && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.su, marginBottom: 8 }}>
            ส่วนที่ {step + 1} จาก {parts.length}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.purple, marginBottom: 8 }}>{parts[step]}</div>
          <p style={{ fontSize: 13, color: C.su, lineHeight: 1.6, marginBottom: 14 }}>หายใจเข้าลึก ๆ ให้ความสนใจกับบริเวณนี้อย่างอ่อนโยน</p>
          <div style={{ height: 6, background: C.li, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", background: C.purple, borderRadius: 3, width: `${((step + 1) / parts.length) * 100}%`, transition: `width .5s ${EASE_REVEAL}` }} />
          </div>
        </div>
      )}
      {done && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.purple, marginBottom: 6 }}>สแกนครบแล้ว</div>
          <p style={{ fontSize: 13, color: C.su, marginBottom: 12 }}>ค่อย ๆ ลืมตาขึ้น สังเกตว่าร่างกายรู้สึกอย่างไรตอนนี้</p>
          <button
            onClick={() => {
              setStep(-1);
              setDone(false);
            }}
            style={{ background: C.li, border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
          >
            ทำอีกครั้ง
          </button>
        </div>
      )}
    </div>
  );
}

function JournalBox() {
  const [tx, setTx] = useState("");
  const [cp, setCp] = useState(false);
  const now = new Date();
  const ts = now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + " · " + now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  function doCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("[" + ts + "]\n\n" + tx).then(() => {
        setCp(true);
        setTimeout(() => setCp(false), 2000);
      });
    }
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 12 }}>การเขียนบันทึกช่วยดึงความคิดออกจากหัว สมองไม่ต้องคอยจำ รู้สึกเบาขึ้นทันที ใช้เวลา 5-10 นาที</p>
      <Gl style={{ padding: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.su, marginBottom: 6 }}>{ts}</div>
        <textarea
          value={tx}
          onChange={(e) => setTx(e.target.value)}
          placeholder="เขียนสิ่งที่คิดและรู้สึก..."
          rows={4}
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.tx, fontFamily: F, resize: "none", lineHeight: 1.6 }}
        />
      </Gl>
      {tx && (
        <button
          onClick={doCopy}
          style={{ display: "flex", alignItems: "center", gap: 6, background: C.purple, color: "#FFF", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
        >
          {cp ? <Check size={15} /> : <Copy size={15} />}
          {cp ? "คัดลอกแล้ว" : "คัดลอกบันทึก"}
        </button>
      )}
    </div>
  );
}

function GratBox() {
  const [items, setItems] = useState(["", "", ""]);
  const [cp, setCp] = useState(false);

  function setI(i: number, v: string) {
    const n = [...items];
    n[i] = v;
    setItems(n);
  }

  function doCopy() {
    const t = items
      .filter(Boolean)
      .map((x, i) => i + 1 + ". " + x)
      .join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText("สิ่งดี 3 อย่างวันนี้\n" + t).then(() => {
        setCp(true);
        setTimeout(() => setCp(false), 2000);
      });
    }
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 12 }}>จดสิ่งดี 3 อย่างก่อนนอน ฝึกสมองให้มองหาสิ่งดีในชีวิต ทำต่อเนื่อง 21 วัน เปลี่ยน baseline mood ได้จริง</p>
      {items.map((v, i) => (
        <Gl key={i} style={{ padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: C.purple + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.purple, flexShrink: 0 }}>
            {i + 1}
          </div>
          <input
            value={v}
            onChange={(e) => setI(i, e.target.value)}
            placeholder={"สิ่งดีที่ " + (i + 1) + "..."}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.tx, fontFamily: F }}
          />
        </Gl>
      ))}
      {items.some(Boolean) && (
        <button
          onClick={doCopy}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, background: C.purple, color: "#FFF", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}
        >
          {cp ? <Check size={15} /> : <Copy size={15} />}
          {cp ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      )}
    </div>
  );
}

// Small day-planner data-viz: kept as a distinct, functional multi-hue legend
// (it's teaching real color psychology, e.g. "purple = focus"), so it isn't
// forced into the brand's red/pink family the way topic chrome is.
function CalendarDay() {
  const blocks = [
    { t: "05:00", l: "Wake Up", c: "#FF9500", h: 0.75 },
    { t: "06:00", l: "อาหารเช้า", c: "#34C759", h: 0.5 },
    { t: "08:00", l: "เรียน / ทบทวน", c: "#AF52DE", h: 3 },
    { t: "11:00", l: "อาหารกลางวัน", c: "#34C759", h: 0.75 },
    { t: "13:00", l: "เรียน / ทำงาน", c: "#AF52DE", h: 2.5 },
    { t: "15:30", l: "ออกกำลังกาย", c: "#FF3B30", h: 1.5 },
    { t: "18:00", l: "อาหารเย็น", c: "#34C759", h: 0.75 },
    { t: "19:00", l: "เวลาส่วนตัว", c: "#007AFF", h: 1.5 },
    { t: "20:30", l: "ทบทวนและจดบันทึก", c: "#FFD60A", h: 0.75 },
    { t: "21:30", l: "นอนหลับ", c: "#8E8E93", h: 7.5 },
  ];
  return (
    <div style={{ marginBottom: 20 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2, alignItems: "stretch" }}>
          <div style={{ width: 44, fontSize: 11, color: C.su, fontWeight: 500, paddingTop: 5, flexShrink: 0, textAlign: "right" }}>{b.t}</div>
          <div style={{ flex: 1, background: b.c + "18", borderLeft: "3px solid " + b.c, borderRadius: "0 8px 8px 0", padding: "5px 10px", minHeight: Math.max(26, b.h * 22) }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: b.c }}>{b.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Clock24h() {
  const segs = [
    { s: 22, e: 5.5, c: "#8E8E93" },
    { s: 5.5, e: 6, c: "#FF9500" },
    { s: 8, e: 12, c: "#AF52DE" },
    { s: 12, e: 13, c: "#34C759" },
    { s: 13, e: 15.5, c: "#AF52DE" },
    { s: 15.5, e: 17, c: "#FF3B30" },
    { s: 17, e: 19, c: "#007AFF" },
    { s: 19, e: 20, c: "#34C759" },
    { s: 20, e: 22, c: "#FFD60A" },
  ];
  const cx = 100,
    cy = 100,
    ro = 78,
    ri = 44;

  function arc(s: number, e: number, c: string) {
    if (e <= s) e += 24;
    const sa = (s / 24) * 360 - 90,
      ea = (e / 24) * 360 - 90;
    const tr = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + ro * Math.cos(tr(sa)),
      y1 = cy + ro * Math.sin(tr(sa)),
      x2 = cx + ro * Math.cos(tr(ea)),
      y2 = cy + ro * Math.sin(tr(ea)),
      ix1 = cx + ri * Math.cos(tr(sa)),
      iy1 = cy + ri * Math.sin(tr(sa)),
      ix2 = cx + ri * Math.cos(tr(ea)),
      iy2 = cy + ri * Math.sin(tr(ea)),
      lg = e - s > 12 ? 1 : 0;
    return (
      <path key={s} d={`M ${x1} ${y1} A ${ro} ${ro} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ri} ${ri} 0 ${lg} 0 ${ix1} ${iy1} Z`} fill={c} opacity={0.88} />
    );
  }

  return (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto 8px" }}>
        {segs.map((b) => arc(b.s, b.e, b.c))}
        <circle cx={cx} cy={cy} r={ri - 2} fill="white" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#333" fontWeight="700">
          24h
        </text>
      </svg>
    </div>
  );
}

function PathDetail() {
  const [sel, setSel] = useState<number | null>(null);
  const cmp = [
    ["สายสามัญ", "3 ปี", "ต่ำ", "ม.6", "ได้", "บางแห่ง"],
    ["อาชีวศึกษา", "3+2 ปี", "ต่ำ", "ปวช./ปวส.", "สายเทค", "—"],
    ["เตรียมทหาร", "7 ปี", "รัฐออกให้", "ป.ตรี+ยศ", "—", "—"],
    ["กศน.", "3 ปี", "ต่ำมาก", "เทียบ ม.6", "บางแห่ง", "—"],
    ["Pre-degree", "คู่กับม.ปลาย", "ปานกลาง", "หน่วยกิต", "ได้", "—"],
    ["ม.เปิด", "4-6 ปี", "ต่ำมาก", "ป.ตรี", "ได้", "—"],
    ["GED", "6-12 เดือน", "ปานกลาง", "เทียบ ม.6 US", "บางแห่ง", "ได้"],
    ["IGCSE/A-Level", "4 ปี", "สูงมาก", "วุฒิสากล", "บางแห่ง", "ได้"],
  ];
  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>8 เส้นทางหลังจบ ม.3</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 20 }}>แตะแต่ละเส้นทางเพื่อดูรายละเอียด</p>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 2, background: C.green + "25" }} />
        {PATHS.map((p, i) => (
          <div key={p.name} onClick={() => setSel(sel === i ? null : i)} style={{ display: "flex", gap: 14, marginBottom: 10, cursor: "pointer" }}>
            <div
              style={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: 14,
                background: sel === i ? p.color : C.bg,
                border: "2px solid " + (sel === i ? p.color : C.ln),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
                transition: `all .25s ${EASE_MORPH}`,
              }}
            >
              <p.Icon size={20} color={sel === i ? "#FFF" : p.color} strokeWidth={1.5} />
            </div>
            <Gl style={{ flex: 1, padding: sel === i ? "18px" : "12px 16px", border: sel === i ? "1.5px solid " + p.color + "30" : "1px solid rgba(255,255,255,.5)", transition: `padding .2s ${EASE_MORPH}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <ChevronRight size={14} color={C.su} style={{ transform: sel === i ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
              </div>
              <div style={{ fontSize: 12, color: p.color, fontWeight: 600, marginTop: 3 }}>
                {p.time} · ค่าใช้จ่าย: {p.cost}
              </div>
              <div style={{ overflow: "hidden", maxHeight: sel === i ? "1000px" : "0", transition: `max-height .4s ${EASE_REVEAL}` }}>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.ln }}>
                  <p style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 10 }}>{p.d}</p>
                  <div style={{ fontSize: 12, color: C.su }}>
                    เส้นทางต่อ: <span style={{ color: p.color }}>{p.next}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.su, marginTop: 4 }}>
                    เหมาะสำหรับ: <span style={{ color: C.tx }}>{p.fit}</span>
                  </div>
                </div>
              </div>
            </Gl>
          </div>
        ))}
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>TCAS Timeline</h4>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, WebkitOverflowScrolling: "touch" }}>
        {TCAS_R.map((t) => (
          <Gl key={t.r} style={{ flexShrink: 0, width: 185, padding: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.c }}>รอบ {t.r}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: t.c, fontWeight: 600, marginTop: 3 }}>{t.m}</div>
            <div style={{ fontSize: 12, color: C.su, marginTop: 6, lineHeight: 1.5 }}>{t.d}</div>
          </Gl>
        ))}
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 700, margin: "20px 0 12px" }}>ตารางเปรียบเทียบ</h4>
      <div style={{ overflowX: "auto", paddingBottom: 12 }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: 11, minWidth: 500, width: "100%" }}>
          <thead>
            <tr style={{ background: C.li }}>
              {["เส้นทาง", "เวลา", "ค่าใช้จ่าย", "วุฒิที่ได้", "ม.ไทย", "ม.เทศ"].map((h) => (
                <th key={h} style={{ padding: "8px", fontWeight: 600, textAlign: "left", borderBottom: "1px solid " + C.ln, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cmp.map((row) => (
              <tr key={row[0]}>
                {row.map((v, i) => (
                  <td key={i} style={{ padding: "8px", borderBottom: "1px solid " + C.ln }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinDetail() {
  const [py, setPy] = useState<number | null>(null);
  const [op, setOp] = useState<Record<number, boolean>>({});
  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>การเงินส่วนบุคคล</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 16 }}>รู้เร็ว เริ่มเร็ว ชีวิตดีกว่า · แตะแต่ละชั้นพีระมิดเพื่อดูรายละเอียด</p>
      {PYR.map((lv, i) => (
        <div key={lv.l}>
          <div
            onClick={() => setPy(py === i ? null : i)}
            style={{
              width: `${40 + i * 12}%`,
              margin: "0 auto 3px",
              background: py === i ? lv.c : lv.c + "20",
              borderRadius: 10,
              padding: "9px 12px",
              textAlign: "center",
              cursor: "pointer",
              transition: `all .2s ${EASE_MORPH}`,
              border: "1.5px solid " + lv.c + (py === i ? "" : "30"),
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: py === i ? "#FFF" : lv.c }}>{lv.l}</div>
          </div>
          {py === i && (
            <Gl style={{ margin: "5px 0 4px", padding: 14, border: "1.5px solid " + lv.c + "20" }}>
              <div style={{ fontSize: 13, lineHeight: 1.75 }}>{lv.d}</div>
            </Gl>
          )}
        </div>
      ))}
      <Gl style={{ padding: 18, marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>กฎ 50-30-20</div>
        <div style={{ display: "flex", gap: 3, height: 22, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ flex: 50, background: C.green }} />
          <div style={{ flex: 30, background: C.blue }} />
          <div style={{ flex: 20, background: C.gold }} />
        </div>
        {[["50%", "ค่าใช้จ่ายจำเป็น", C.green], ["30%", "ค่าใช้จ่ายที่ต้องการ", C.blue], ["20%", "ออมและลงทุน", C.gold]].map(([p, l, c]) => (
          <div key={l} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: c, flexShrink: 0 }} />
            <div style={{ fontSize: 13 }}>
              <strong>{p}</strong> — {l}
            </div>
          </div>
        ))}
        <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.7, marginTop: 10 }}>
          แนวคิดโดย Elizabeth Warren จาก Harvard แบ่งรายได้สุทธิ 3 กอง แก่นสำคัญคือ &quot;ออมก่อนใช้&quot; เพราะเงินที่เหลือมักไม่เคยเหลือจริง ๆ
        </p>
      </Gl>
      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>20 คู่ ก่อนเข้าสู่โลกการเงิน</h4>
      <p style={{ fontSize: 12, color: C.su, marginBottom: 12 }}>แตะเพื่อดูมุมมองและข้อมูลที่ต้องรู้</p>
      {VS.map(([l, r, sh, dt], i) => (
        <div
          key={i}
          onClick={() => setOp((p) => ({ ...p, [i]: !p[i] }))}
          style={{
            background: C.bg,
            borderRadius: 16,
            padding: "11px 14px",
            cursor: "pointer",
            marginBottom: 5,
            boxShadow: op[i] ? "0 4px 14px rgba(0,0,0,.06)" : "0 1px 2px rgba(0,0,0,.03)",
            border: "1.5px solid " + (op[i] ? C.gold + "40" : "rgba(0,0,0,.04)"),
            transition: `box-shadow .2s ${EASE_MORPH},border-color .2s ${EASE_MORPH}`,
          }}
        >
          {!op[i] ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "center" }}>{l}</span>
              <ArrowLeftRight size={12} color={C.gold} strokeWidth={2} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "center" }}>{r}</span>
            </div>
          ) : (
            <div className="expand-enter">
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <Pill label={l} color={C.gold} />
                <Pill label={r} color={C.gold + "bb"} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                <Lightbulb size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={1.5} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{sh}</div>
              </div>
              <div style={{ fontSize: 13, color: C.su, lineHeight: 1.6, paddingLeft: 22 }}>{dt}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SexDetail() {
  const [s, setS] = useState<number | null>(null);
  const [openCase, setOpenCase] = useState<number | null>(null);
  const units = [
    { t: "ร่างกายและการเปลี่ยนแปลง", Icon: Eye, c: C.pink },
    { t: "เพศวิถีและอัตลักษณ์", Icon: Users, c: C.purple },
    { t: "ความสัมพันธ์และความยินยอม", Icon: Heart, c: C.red },
    { t: "สุขภาพทางเพศ", Icon: Shield, c: C.green },
    { t: "ภัยออนไลน์ทางเพศ", Icon: MessageCircle, c: C.gold },
    { t: "สิทธิ์และกฎหมาย", Icon: Scale, c: C.blue },
  ];

  function renderUnit(i: number) {
    if (i === 0)
      return (
        <div>
          <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 14 }}>ฐานความรู้ที่ต้องมีก่อนทุกอย่าง เด็กที่รู้จักร่างกายตัวเองถูกต้องจะถูกหลอกหรือทำร้ายได้ยากกว่า</p>
          {[
            ["กายวิภาคที่ถูกต้อง", "ชื่อเรียกอวัยวะตามหลักการแพทย์ ทั้งชาย หญิง และอินเตอร์เซ็กซ์ ไม่ใช้คำแทนที่อาย"],
            ["วัยรุ่นและฮอร์โมน", "ฮอร์โมนเพศทำงานยังไง ทำไมร่างกายและอารมณ์เปลี่ยน"],
            ["การมีประจำเดือน", "วงจรประจำเดือน อาการ วิธีดูแลตัวเอง เป็นเรื่องปกติ ไม่ใช่เรื่องน่าอาย"],
            ["การแข็งตัวและการหลั่ง", "เป็นเรื่องปกติของร่างกาย เกิดขึ้นได้โดยไม่ได้ตั้งใจ"],
            ["การเปลี่ยนแปลงที่หลากหลาย", "เด็กแต่ละคนเข้าสู่วัยรุ่นเร็วช้าต่างกัน ไม่มีผิดปกติ"],
          ].map(([h, d]) => (
            <div key={h} style={{ padding: "10px 0", borderBottom: "1px solid " + C.ln }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.pink, marginBottom: 3 }}>{h}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      );
    if (i === 1)
      return (
        <div>
          <div style={{ background: C.purple + "08", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 6 }}>เพศกำเนิด ≠ อัตลักษณ์ทางเพศ ≠ รสนิยมทางเพศ</div>
            {[
              ["เพศกำเนิด", "ลักษณะทางชีววิทยา", "ชาย หญิง อินเตอร์เซ็กซ์"],
              ["อัตลักษณ์ทางเพศ", "ความรู้สึกภายในว่าเป็นใคร", "ชาย หญิง นอนไบนารี ทรานส์"],
              ["การแสดงออก", "วิธีแสดงออกต่อโลก", "เสื้อผ้า ทรงผม พฤติกรรม"],
              ["รสนิยมทางเพศ", "คนที่รู้สึกดึงดูดไปหา", "ตรงข้าม/เดียวกัน/ทั้งสอง/ไม่ดึงดูด"],
            ].map(([a, b, c]) => (
              <div key={a} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 3, borderRadius: 2, background: C.purple, flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 12 }}>{a}</strong> <span style={{ fontSize: 12, color: C.su }}>({b}) — {c}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            {LGBT_DATA.map((l) => (
              <div key={l.k} style={{ background: l.c + "12", borderRadius: 12, padding: "10px 12px", border: "1px solid " + l.c + "25" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 8, background: l.c, color: "#FFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{l.k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: l.c }}>{l.n}</span>
                </div>
                <div style={{ fontSize: 11, color: C.tx, marginBottom: 2 }}>{l.d}</div>
                <div style={{ fontSize: 10, color: C.su }}>{l.note}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.purple + "08", borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 1.6 }}>
            Coming out ไม่ใช่หน้าที่ ไม่มีใครต้องประกาศถ้าตัวเองยังไม่พร้อม การ bully เรื่องเพศมีผลต่อสุขภาพจิตจริงและมีผลทางกฎหมาย
          </div>
        </div>
      );
    if (i === 2)
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              <div style={{ background: C.green + "10", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 6 }}>ความสัมพันธ์ที่ดี</div>
                {["เคารพขอบเขตกันและกัน", "สื่อสารตรง ๆ ได้", "รู้สึกปลอดภัย", "เป็นตัวเองได้", "รู้สึกดีขึ้นเมื่ออยู่ด้วย"].map((x) => (
                  <div key={x} style={{ fontSize: 11, marginBottom: 3 }}>✓ {x}</div>
                ))}
              </div>
              <div style={{ background: C.red + "10", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6 }}>ความสัมพันธ์ที่เป็นพิษ</div>
                {["กดดัน บังคับ ขู่", "ต้องเดา ต้องทน", "รู้สึกกลัว เดินไข่", "ต้องเปลี่ยนตัวเองตลอด", "รู้สึกเหนื่อยและหมดแรง"].map((x) => (
                  <div key={x} style={{ fontSize: 11, marginBottom: 3 }}>✗ {x}</div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#3A0512,#5C0E21)", borderRadius: 16, padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FFF", textAlign: "center", marginBottom: 14, letterSpacing: ".05em" }}>กฎ FRIES ของความยินยอม</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FRIES_DATA.map((f) => (
                  <div key={f.k} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: f.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#FFF" }}>{f.k}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#FFF" }}>
                        {f.full} <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>— {f.th}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.red + "08", borderRadius: 12, padding: 12, border: "1px solid " + C.red + "20" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>ข้อกฎหมายสำคัญ</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>เด็กต่ำกว่า 15 ปีในไทยไม่สามารถให้ความยินยอมทางเพศได้ตามกฎหมาย แม้ตัวเองจะรู้สึกว่าเต็มใจก็ตาม คู่กรณีมีความผิดทางอาญาทันที</div>
            </div>
          </div>
        </div>
      );
    if (i === 3)
      return (
        <div>
          <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 14 }}>ความรู้ที่ป้องกันชีวิตได้จริง ไม่ใช่การส่งเสริมให้มีเพศสัมพันธ์ แต่เพื่อให้รู้จักป้องกันตัวเองเมื่อถึงเวลา</p>
          {STI_DATA.map(([h, d]) => (
            <div key={h} style={{ padding: "10px 0", borderBottom: "1px solid " + C.ln }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 3 }}>{h}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      );
    if (i === 4)
      return (
        <div>
          <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 14 }}>ภัยที่เด็กยุคนี้เจอมากที่สุดแต่รู้น้อยที่สุด</p>
          <div style={{ marginBottom: 16 }}>
            {[
              ["Pornography", "ภาพลักษณ์ในสื่อลามกไม่ตรงกับความจริง", "ความยินยอม ร่างกาย ความสัมพันธ์จริง ๆ ไม่เป็นแบบนั้น", C.purple],
              ["Sexting", "การส่งภาพหรือข้อความทางเพศ", "เมื่อส่งออกไปแล้วควบคุมไม่ได้อีก และอาจผิดกฎหมาย", C.pink],
              ["Grooming", "ผู้ใหญ่สร้างความไว้วางใจเพื่อล่อลวงเด็ก", "มีสัญญาณเตือน เรียนรู้วิธีสังเกตและหยุดการสนทนา", C.gold],
              ["Non-consensual", "แชร์ภาพส่วนตัวโดยไม่ยินยอม", "ผิดกฎหมาย Cyber ของไทย มีโทษจำคุกจริง", C.orange],
              ["CSAM", "สื่อลามกเด็ก", "ผิดกฎหมายทั้งการดู การส่ง และการเก็บไว้", C.red],
            ].map(([danger, desc, note, c]) => (
              <div key={danger} style={{ background: c + "0a", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1px solid " + c + "25" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ background: c, borderRadius: 8, padding: "3px 8px", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF" }}>{danger}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{desc}</div>
                    <div style={{ fontSize: 11, color: C.su, lineHeight: 1.45 }}>{note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.tx, marginBottom: 8 }}>จำลองการ Grooming — รู้เท่าทันก่อนตกเป็นเหยื่อ</div>
          {[
            { type: "sys", msg: "[Grooming เริ่มต้น]", sub: "ผู้ล่อลวงมักปลอมตัวเป็นคนอายุใกล้เคียงและมีความสนใจเหมือนกัน" },
            ["left", "สวัสดี อยากคุยด้วยได้มั้ย ผมชอบเกมเดียวกันเลย"],
            { type: "sys", msg: "[สร้างความไว้วางใจ]", sub: "คุยกันเป็นเดือน สร้างความผูกพันทางอารมณ์ก่อน" },
            ["left", "แกเป็นคนเดียวที่เข้าใจผมเลย แกพิเศษมาก..."],
            { type: "sys", msg: "[ขั้นตอนอันตราย]", sub: "เมื่อสร้างความไว้วางใจแล้ว จะเริ่มขอสิ่งที่ไม่เหมาะสม" },
            ["left", "เราใกล้ชิดกันมากแล้ว ขอรูปหน่อยได้มั้ย?"],
            { type: "danger", msg: "อย่าส่ง! รูปที่ส่งออกไปแล้วควบคุมไม่ได้อีก" },
            ["left", "ถ้าไม่ส่ง แสดงว่าไม่ไว้ใจกัน..."],
            { type: "danger", msg: "Sextortion: ถ้าได้รูปแล้วจะข่มขู่ต่อ — แจ้งผู้ใหญ่ทันที อย่าลบหลักฐาน" },
          ].map((item, idx) => {
            if (typeof item === "object" && !Array.isArray(item)) {
              return (
                <div key={idx} style={{ textAlign: "center", padding: "6px 0", margin: "4px 0" }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: item.type === "danger" ? C.red + "10" : C.li,
                      border: "1px solid " + (item.type === "danger" ? C.red + "30" : C.ln),
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 11,
                      color: item.type === "danger" ? C.red : C.su,
                      fontWeight: 600,
                    }}
                  >
                    {item.msg}
                  </div>
                  {item.sub && <div style={{ fontSize: 10, color: C.su, marginTop: 2 }}>{item.sub}</div>}
                </div>
              );
            }
            return (
              <div key={idx} style={{ display: "flex", justifyContent: "flex-start", marginBottom: 6 }}>
                <div style={{ background: C.li, borderRadius: "18px 18px 18px 4px", padding: "8px 12px", maxWidth: "75%", fontSize: 13, lineHeight: 1.5 }}>{(item as string[])[1]}</div>
              </div>
            );
          })}
        </div>
      );
    if (i === 5)
      return (
        <div>
          <div style={{ marginBottom: 14 }}>
            {LAW_DATA.map(([h, d]) => (
              <div key={h} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.ln, gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{h}</div>
                <div style={{ fontSize: 12, color: C.blue, textAlign: "right", flexShrink: 0, maxWidth: "55%" }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>กรณีศึกษา</div>
          <p style={{ fontSize: 12, color: C.su, marginBottom: 12 }}>หมายเหตุ: ทุกเคสเป็นเรื่องสมมติ สร้างขึ้นเพื่อการเรียนรู้</p>
          {CASES.map((c, ci) => (
            <div
              key={ci}
              onClick={() => setOpenCase(openCase === ci ? null : ci)}
              style={{
                background: C.bg,
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 6,
                cursor: "pointer",
                border: "1.5px solid " + (openCase === ci ? C.blue + "40" : "rgba(0,0,0,.05)"),
                boxShadow: openCase === ci ? "0 4px 12px rgba(0,0,0,.06)" : "0 1px 2px rgba(0,0,0,.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {c.tags.map((t) => (
                      <span key={t} style={{ background: C.blue + "14", color: C.blue, borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={13} color={C.su} style={{ transform: openCase === ci ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
              </div>
              {openCase === ci && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.ln }}>
                  <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>{c.story}</p>
                  <div style={{ background: C.red + "08", borderRadius: 10, padding: 10, border: "1px solid " + C.red + "20", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>กฎหมายที่เกี่ยวข้อง</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>{c.law}</div>
                  </div>
                  {c.q && (
                    <div style={{ background: C.blue + "08", borderRadius: 10, padding: 10, border: "1px solid " + C.blue + "20" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8 }}>คำถามสำหรับถกเถียง</div>
                      {c.q.map((q, qi) => (
                        <div key={qi} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, flexShrink: 0, minWidth: 16 }}>{["ก", "ข", "ค", "ง", "จ", "ฉ"][qi]}.</span>
                          <span style={{ fontSize: 12, lineHeight: 1.55 }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <Gl style={{ padding: 14, marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
            <AlertTriangle size={16} color={C.red} strokeWidth={1.5} />
            <div style={{ fontSize: 12 }}>
              ถ้าเกิดเหตุ: <strong>อย่าลบหลักฐาน</strong> ถ่ายหน้าจอเก็บไว้ แล้วโทร <strong>1300</strong> หรือแจ้งความ
            </div>
          </Gl>
        </div>
      );
    return null;
  }

  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>เพศศึกษา</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 20 }}>ความรู้ที่ถูกต้องคือเกราะป้องกันที่ดีที่สุด แตะแต่ละหัวข้อเพื่อดูเนื้อหา</p>
      {units.map((u, i) => (
        <Gl key={u.t} onClick={() => setS(s === i ? null : i)} style={{ padding: "14px 16px", marginBottom: 8, cursor: "pointer", border: s === i ? "1.5px solid " + u.c + "30" : "1px solid rgba(255,255,255,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: u.c + "10", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <u.Icon size={18} color={u.c} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{u.t}</div>
            <ChevronRight size={14} color={C.su} style={{ transform: s === i ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
          </div>
          <div style={{ overflow: "hidden", maxHeight: s === i ? "3000px" : "0", transition: `max-height .4s ${EASE_REVEAL}` }}>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + C.ln }} onClick={(e) => e.stopPropagation()}>
              {renderUnit(i)}
            </div>
          </div>
        </Gl>
      ))}
      <Gl style={{ padding: 14, marginTop: 4, display: "flex", gap: 10, alignItems: "center" }}>
        <Phone size={16} color={C.pink} strokeWidth={1.5} />
        <div>
          <div style={{ fontSize: 12, color: C.pink, fontWeight: 700 }}>ขอความช่วยเหลือ</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>
            สายด่วน <strong>1300</strong> / <strong>1323</strong> / มูลนิธิปวีณา <strong>02-802-2599</strong>
          </div>
        </div>
      </Gl>
    </div>
  );
}

function MentalDetail() {
  const [sec, setSec] = useState<string | null>(null);
  const [tl, setTl] = useState<string | null>(null);
  const [em, setEm] = useState<number | null>(null);
  const STRESS_SRC: string[][] = [
    ["เลือกเส้นทางหลัง ม.3 ไม่ถูก", "กลัวเลือกผิดแล้วชีวิตพัง"],
    ["ความคาดหวังจากครอบครัว", "อยากให้ภูมิใจ แต่ความฝันอาจไม่ตรงกัน"],
    ["เปรียบตัวเองกับเพื่อน", "เพื่อนรู้แล้วว่าจะทำอะไร ทำไมเรายังไม่รู้"],
    ["กลัวสอบ O-NET", "รู้สึกว่าคะแนนวันนั้นตัดสินทุกอย่าง"],
    ["โซเชียลมีเดีย", "เห็นคนอื่นดูประสบความสำเร็จตลอด"],
    ["ความสัมพันธ์", "เพื่อน แฟน ครอบครัว ดึงพลังงานไปมาก"],
    ["ข่าวโลก", "เศรษฐกิจ AI สภาพอากาศ อนาคตไม่แน่นอน"],
  ];
  const TRAPS: string[][] = [
    ["All-or-nothing", "ถ้าไม่ได้ที่ 1 ก็ล้มเหลว", "ผลลัพธ์ส่วนใหญ่ในชีวิตอยู่ตรงกลาง"],
    ["Catastrophizing", "ถ้าเลือกผิดชีวิตจะพังตลอดไป", "คนเราเปลี่ยนเส้นทางได้ตลอดชีวิต"],
    ["Mind reading", "ครูคงคิดว่าฉันโง่", "เราไม่รู้จริง ๆ ว่าคนอื่นคิดอะไร"],
    ["Should statements", "ฉันควรรู้แล้วว่าจะเรียนอะไร", "ใครบอกว่าต้องรู้ตอนอายุ 15?"],
    ["Comparing highlights", "เพื่อนทุกคนดูมั่นใจหมด", "สิ่งที่เห็นบนโซเชียลคือภาพที่เลือกมาแสดง"],
  ];
  const EMOTIONS: [string, string, string[]][] = [
    ["โกรธ", C.red, ["ถูกมองข้าม", "อิจฉา", "อับอาย", "กลัว"]],
    ["เศร้า", C.blue, ["โดดเดี่ยว", "ผิดหวัง", "คิดถึง", "สูญเสีย"]],
    ["กลัว", C.gold, ["กังวล", "ไม่มั่นใจ", "กดดัน", "สับสน"]],
    ["สุข", C.green, ["ภูมิใจ", "โล่งใจ", "ตื่นเต้น", "อบอุ่น"]],
  ];
  const tools = [
    { k: "breathe", n: "Breathing Box", d: "หายใจ 4-4-4-4 ลดเครียดใน 2 นาที", Icon: Sparkles },
    { k: "ground", n: "5-4-3-2-1 Grounding", d: "ดึงจิตใจกลับมาอยู่กับปัจจุบัน", Icon: Target },
    { k: "body", n: "Body Scan", d: "สำรวจร่างกายตั้งแต่เท้าถึงหัว", Icon: Eye },
    { k: "journal", n: "Journaling", d: "เขียนความคิดออกมาก่อนนอน", Icon: BookOpen },
    { k: "gratitude", n: "Gratitude", d: "จดสิ่งดี 3 อย่างทุกวัน", Icon: Star },
    { k: "worry", n: "Worry Time", d: "กำหนด 15 นาที/วัน สำหรับกังวล", Icon: Clock },
  ];

  function renderTool(k: string) {
    if (k === "breathe") return <BreathCircle />;
    if (k === "body") return <BodyScan />;
    if (k === "journal") return <JournalBox />;
    if (k === "gratitude") return <GratBox />;
    if (k === "ground")
      return (
        <div style={{ padding: "10px 0" }}>
          <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.6, marginBottom: 14 }}>เมื่อวิตกกังวลจนจิตล่องลอย ให้สำรวจสิ่งรอบตัว เพื่อดึงสมองกลับมาอยู่กับปัจจุบัน</p>
          {[["5", "สิ่งที่มองเห็น", C.blue], ["4", "สิ่งที่สัมผัสได้", C.green], ["3", "เสียงที่ได้ยิน", C.gold], ["2", "กลิ่นที่ได้กลิ่น", C.pink], ["1", "รสชาติที่รู้สึก", C.purple]].map(([n, l, c]) => (
            <div key={n} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: c, flexShrink: 0 }}>{n}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      );
    return (
      <div style={{ padding: "10px 0" }}>
        <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.7 }}>
          กำหนด 15 นาทีต่อวันสำหรับกังวลโดยเฉพาะ นอกจากนั้นถ้าความคิดวิตกเข้ามา ให้จดลงกระดาษแล้วบอกตัวเองว่าเก็บไว้คิดตอน Worry Time เมื่อถึงเวลาให้คิดอย่างจริงจัง แต่พอครบ 15 นาทีหยุดทันที
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>สุขภาพจิต</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 16 }}>ความเครียดไม่ใช่ศัตรู แต่ความเครียดที่ไม่ได้จัดการคือปัญหา</p>
      <Gl style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Eustress (ดี)", "กดดันพอให้ลงมือทำ ตื่นเต้นก่อนนำเสนอ หายหลังผ่านเหตุการณ์", C.green], ["Distress (เสีย)", "กดดันจนทำอะไรไม่ได้ นอนไม่หลับหลายสัปดาห์ สะสมไม่หาย", C.red]].map(([h, d, c]) => (
            <div key={h} style={{ padding: 12, background: c + "08", borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c, marginBottom: 4 }}>{h}</div>
              <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </Gl>
      {[
        { k: "what", title: "สุขภาพจิตคืออะไร?" },
        { k: "emotion", title: "Emotion Wheel — อารมณ์ที่ซ่อนอยู่" },
        { k: "stress", title: "แหล่งความเครียดของเด็ก ม.3" },
        { k: "trap", title: "กับดักความคิดที่ตกบ่อย" },
        { k: "social", title: "โซเชียลมีเดียและสุขภาพจิต" },
      ].map((item) => (
        <Gl key={item.k} onClick={() => setSec(sec === item.k ? null : item.k)} style={{ padding: "12px 14px", marginBottom: 6, cursor: "pointer", border: sec === item.k ? "1.5px solid " + C.purple + "30" : "1px solid rgba(255,255,255,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>{item.title}</div>
            <ChevronRight size={13} color={C.su} style={{ transform: sec === item.k ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
          </div>
          <div style={{ overflow: "hidden", maxHeight: sec === item.k ? "2000px" : "0", transition: `max-height .4s ${EASE_REVEAL}` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.ln }}>
              {item.k === "what" && (
                <div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                    หลายคนได้ยินคำว่า &quot;สุขภาพจิต&quot; แล้วนึกถึงแต่คนที่ป่วยหนัก แต่จริง ๆ แล้วสุขภาพจิตคือสภาวะที่ทุกคนมีและเปลี่ยนแปลงได้ทุกวัน เหมือนสุขภาพร่างกายที่วันนึงอาจเป็นไข้ วันนึงหายดี
                  </p>
                  {[
                    ["สุขภาพจิต ≠ ความบ้า", "ทุกคนมีสุขภาพจิต เหมือนทุกคนมีสุขภาพกาย"],
                    ["Mental Health Spectrum", "จากดีมากไปถึงวิกฤต ทุกคนอยู่ที่จุดไหนจุดหนึ่งตลอดเวลา"],
                    ["ตีตราและอคติ", "ทำไมคนถึงกลัวพูดถึงสุขภาพจิต มันทำให้อะไรแย่ลง"],
                    ["สัญญาณที่ต้องสังเกต", "สุขภาพจิตที่ดีหน้าตาเป็นยังไง ไม่ดีหน้าตาเป็นยังไง"],
                  ].map(([h, d]) => (
                    <div key={h} style={{ padding: "8px 0", borderBottom: "1px solid " + C.ln }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 2 }}>{h}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>{d}</div>
                    </div>
                  ))}
                </div>
              )}
              {item.k === "emotion" && (
                <div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>ไม่มีอารมณ์ไหนที่ &quot;ผิด&quot; แต่การแสดงออกบางอย่างอาจทำร้ายตัวเองหรือคนอื่นได้ ฝึกอ่านอารมณ์ตัวเองให้ละเอียดขึ้น</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {EMOTIONS.map(([name, c, subs], ei) => (
                      <div
                        key={name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEm(em === ei ? null : ei);
                        }}
                        style={{ borderRadius: 12, padding: 10, background: c + "10", border: "1px solid " + c + "20", cursor: "pointer" }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: c, marginBottom: 4 }}>{name}</div>
                        {em === ei ? (
                          subs.map((sub) => (
                            <div key={sub} style={{ fontSize: 11, color: C.su, marginBottom: 2 }}>
                              · {sub}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 11, color: C.su }}>แตะดูอารมณ์ที่ซ่อนอยู่</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {item.k === "stress" && (
                <div>
                  {STRESS_SRC.map(([src, feel]) => (
                    <div key={src} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.ln }}>
                      <div style={{ width: 3, borderRadius: 2, background: C.purple, flexShrink: 0, alignSelf: "stretch" }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{src}</div>
                        <div style={{ fontSize: 11, color: C.su }}>{feel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {item.k === "trap" && (
                <div>
                  {TRAPS.map(([t, eg, r]) => (
                    <div key={t} style={{ padding: "8px 0", borderBottom: "1px solid " + C.ln }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 2 }}>{t}</div>
                      <div style={{ fontSize: 11, color: C.su, marginBottom: 2 }}>ตัวอย่าง: &quot;{eg}&quot;</div>
                      <div style={{ fontSize: 11, color: C.tx }}>ความจริง: {r}</div>
                    </div>
                  ))}
                </div>
              )}
              {item.k === "social" && (
                <div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>โซเชียลมีเดียไม่ใช่ศัตรู แต่ถ้าใช้แบบไม่รู้ทัน มันดูดพลังงานและความมั่นใจออกไปโดยที่ไม่รู้สึกตัว</p>
                  {[
                    ["Doomscrolling ก่อนนอน", "รบกวนการนอนหลับ สมองตื่นตัวในเวลาที่ควรพัก"],
                    ["เปรียบตัวเองกับคนที่ดูสำเร็จ", "ความมั่นใจลดลง แม้จะรู้ว่าภาพนั้นถูกคัดมา"],
                    ["Seek validation จาก likes", "ความรู้สึกดีเกี่ยวกับตัวเองผูกกับตัวเลข"],
                    ["Passive scrolling นาน ๆ", "รู้สึกเปล่าว่างและสูญเสียเวลา"],
                  ].map(([b, e]) => (
                    <div key={b} style={{ padding: "6px 0", borderBottom: "1px solid " + C.ln }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{b}</div>
                      <div style={{ fontSize: 11, color: C.su }}>{e}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Gl>
      ))}
      <div style={{ height: 1, background: C.ln, margin: "16px 0" }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: C.purple, marginBottom: 12 }}>เครื่องมือ 6 อย่างที่ใช้ได้จริง</div>
      {tools.map((t) => (
        <Gl key={t.k} onClick={() => setTl(tl === t.k ? null : t.k)} style={{ padding: "14px 16px", marginBottom: 8, cursor: "pointer", border: tl === t.k ? "1.5px solid " + C.purple + "30" : "1px solid rgba(255,255,255,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.purple + "10", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <t.Icon size={18} color={C.purple} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t.n}</div>
              <div style={{ fontSize: 12, color: C.su }}>{t.d}</div>
            </div>
            <ChevronRight size={14} color={C.su} style={{ transform: tl === t.k ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
          </div>
          {tl === t.k && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + C.ln }} onClick={(e) => e.stopPropagation()}>
              {renderTool(t.k)}
            </div>
          )}
        </Gl>
      ))}
      <h4 style={{ fontSize: 15, fontWeight: 700, margin: "16px 0 10px" }}>ขอความช่วยเหลือ</h4>
      {[["1323", "กรมสุขภาพจิต", "โทรฟรี 24 ชม.", C.purple], ["1300", "กระทรวง พม.", "คุ้มครองเด็กและสตรี", C.pink], ["1387", "สายด่วนสุขภาพ", "กรมการแพทย์", C.green]].map(([n, nm, d, c]) => (
        <Gl key={n} style={{ padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <Phone size={16} color={c} strokeWidth={1.5} />
          <span style={{ fontSize: 18, fontWeight: 800, color: c }}>{n}</span>
          <span style={{ fontSize: 12, color: C.su, marginLeft: 4 }}>
            {nm} · {d}
          </span>
        </Gl>
      ))}
      <Gl style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <MessageCircle size={16} color={C.blue} strokeWidth={1.5} />
        <div>
          <strong style={{ fontSize: 14 }}>Ooca</strong>
          <span style={{ fontSize: 12, color: C.su }}> — แอปพลิเคชันปรึกษานักจิตวิทยาออนไลน์</span>
        </div>
      </Gl>
    </div>
  );
}

function MIDetail() {
  const [sc, setSc] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [sk, setSk] = useState<number | null>(null);
  const tops = MI_D.filter((m) => (sc[m.n] || 0) >= 4);
  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>พหุปัญญา 8 ด้าน</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 16 }}>Howard Gardner (Harvard 1983) พิสูจน์ว่าความฉลาดมี 8 ด้าน ทุกคนมีครบ แต่สัดส่วนต่างกัน ให้คะแนน 1-5</p>
      {tops.length > 0 && (
        <Gl style={{ padding: 14, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.su, fontWeight: 600, marginBottom: 8 }}>ด้านที่คุณโดดเด่น</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {tops.map((m) => (
              <Pill key={m.n} label={m.n} color={m.c} />
            ))}
          </div>
        </Gl>
      )}
      {MI_D.map((m, i) => (
        <Gl key={m.n} style={{ padding: "12px 14px", marginBottom: 6, border: sel === i ? "1.5px solid " + m.c + "30" : "1px solid rgba(255,255,255,.5)" }}>
          <div onClick={() => setSel(sel === i ? null : i)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: m.c + "10", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <m.Icon size={16} color={m.c} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.n}</div>
              <div style={{ fontSize: 11, color: C.su }}>{m.desc}</div>
            </div>
            <ChevronRight size={13} color={C.su} style={{ transform: sel === i ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSc((p) => ({ ...p, [m.n]: n }))}
                style={{ flex: 1, height: 30, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: F, fontSize: 12, fontWeight: 700, background: (sc[m.n] || 0) >= n ? m.c : C.li, color: (sc[m.n] || 0) >= n ? "#FFF" : C.su, transition: `all .15s ${EASE_MORPH}` }}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ overflow: "hidden", maxHeight: sel === i ? "1000px" : "0", transition: `max-height .4s ${EASE_REVEAL}` }}>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.ln }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>{m.detail}</p>
              <div style={{ fontSize: 12, color: C.su }}>
                สัญญาณ: <span style={{ color: C.tx }}>{m.signs}</span>
              </div>
              <div style={{ fontSize: 12, color: C.su, marginTop: 4 }}>
                อาชีพ: <span style={{ color: m.c }}>{m.jobs}</span>
              </div>
            </div>
          </div>
        </Gl>
      ))}
      <h4 style={{ fontSize: 16, fontWeight: 700, margin: "20px 0 12px" }}>ทักษะสำคัญแห่งศตวรรษที่ 21</h4>
      {SK21.map(([n, c, d], i) => (
        <Gl key={n} onClick={() => setSk(sk === i ? null : i)} style={{ padding: "12px 14px", marginBottom: 6, cursor: "pointer", border: sk === i ? "1.5px solid " + c + "30" : "1px solid rgba(255,255,255,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c }}>{n}</div>
            <ChevronRight size={13} color={C.su} style={{ transform: sk === i ? "rotate(90deg)" : "none", transition: `transform .25s ${EASE_MORPH}` }} />
          </div>
          <div style={{ overflow: "hidden", maxHeight: sk === i ? "500px" : "0", transition: `max-height .35s ${EASE_REVEAL}` }}>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.ln, fontSize: 13, lineHeight: 1.7 }}>{d}</div>
          </div>
        </Gl>
      ))}
    </div>
  );
}

function TimeDetail() {
  return (
    <div style={{ padding: "24px 20px 60px" }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Time Blocking</h3>
      <p style={{ fontSize: 14, color: C.su, lineHeight: 1.6, marginBottom: 20 }}>วิธีบริหารเวลาที่ดีกว่าการทำ To-do list</p>
      <Gl style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>ทำไมต้อง Time Blocking?</div>
        <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.75, marginBottom: 10 }}>
          สมองมนุษย์ทำงานได้ดีที่สุดเมื่อโฟกัสทีละอย่าง งานวิจัยของ American Psychological Association พบว่า Multitasking ลดประสิทธิภาพลง 40% เพราะสมองต้องใช้พลังงานสลับระหว่างงานตลอดเวลา
        </p>
        <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.75, marginBottom: 10 }}>
          To-do list บอกว่า &quot;ต้องทำอะไร&quot; แต่ไม่บอกว่า &quot;จะทำเมื่อไหร่&quot; ทำให้วันผ่านไปโดยรู้สึกยุ่งแต่ไม่ได้ผลิตผลจริง Time Blocking คือการ &quot;จอง&quot; เวลาในปฏิทินให้กับแต่ละงาน เหมือนนัดกับตัวเอง
        </p>
        <p style={{ fontSize: 13, color: C.tx, lineHeight: 1.75 }}>Cal Newport จาก MIT พิสูจน์ว่า Deep Work 4 ชั่วโมงต่อวัน ให้ผลลัพธ์มากกว่าการทำงานตื้น ๆ 8-10 ชั่วโมงอย่างมีนัยสำคัญ</p>
      </Gl>
      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>ตัวอย่างตารางวัน</h4>
      <CalendarDay />
      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>ภาพรวม 24 ชั่วโมง</h4>
      <Clock24h />
      <Gl style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>หมวดหมู่และทฤษฎีสี</div>
        {[
          ["การเรียนและพัฒนา", "#AF52DE", "ม่วง — กระตุ้นความคิดสร้างสรรค์และสมาธิ เหมาะกับ Deep Work ปิดการแจ้งเตือนทั้งหมดระหว่างบล็อกนี้"],
          ["อาหารและสุขภาพ", "#34C759", "เขียว — สื่อถึงชีวิตและความสมดุล ช่วยให้รู้สึกผ่อนคลาย เหมาะกับช่วงพักฟื้นพลังงาน"],
          ["ออกกำลังกาย", "#FF3B30", "แดง — กระตุ้นระบบประสาทและพลังงาน เหมาะกับกิจกรรมที่ต้องใช้แรงและความมุ่งมั่น"],
          ["เวลาส่วนตัวและความสัมพันธ์", "#007AFF", "น้ำเงิน — สื่อถึงความไว้วางใจและความสงบ เหมาะกับช่วงเชื่อมต่อกับคนที่รัก"],
          ["ทบทวนและวางแผน", "#FFD60A", "เหลือง — ความชัดเจนและปัญญา เหมาะกับการคิดวิเคราะห์และจดบันทึก"],
          ["พักผ่อนและนอนหลับ", "#8E8E93", "เทา — ความเป็นกลางและการพัก วัยรุ่นต้องนอน 8-9 ชั่วโมง ไม่ใช่ความขี้เกียจ"],
        ].map(([l, c, d]) => (
          <div key={l} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: c, flexShrink: 0 }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>{l}</div>
            </div>
            <div style={{ fontSize: 12, color: C.su, lineHeight: 1.55, paddingLeft: 22 }}>{d}</div>
          </div>
        ))}
      </Gl>
      <Gl style={{ padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>เริ่มต้นอย่างไร?</div>
        {["เริ่มจากบล็อกตายตัวก่อน ได้แก่ เวลานอน เวลากิน และเวลาเรียน", "เพิ่ม Buffer 15-30 นาทีระหว่างแต่ละบล็อกเพื่อรองรับความล่าช้า", "ทบทวนทุกสัปดาห์ว่าปฏิทินที่วางไว้ตรงกับความเป็นจริงหรือไม่", "อย่าพยายามทำให้สมบูรณ์แบบตั้งแต่วันแรก เริ่มจากกรอบหยาบ ๆ แล้วค่อยปรับ"].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: C.orange + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.orange, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{tip}</div>
          </div>
        ))}
      </Gl>
    </div>
  );
}

const DM: Record<string, React.ComponentType> = {
  pathways: PathDetail,
  finance: FinDetail,
  sex: SexDetail,
  mental: MentalDetail,
  mi: MIDetail,
  time: TimeDetail,
};

function Overlay({ id, closing, onClose }: { id: string; closing: boolean; onClose: () => void }) {
  const Comp = DM[id];
  const topic = TOPICS.find((t) => t.id === id);
  if (!Comp) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: C.bg,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        animation: closing ? `closeDown .38s ${EASE_MORPH} forwards` : `openUp .5s ${EASE_REVEAL}`,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(255,255,255,.9)",
          borderBottom: "1px solid " + C.ln,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onClose}
          style={{ background: C.li, border: "none", borderRadius: 999, padding: "8px 14px 8px 10px", fontSize: 14, fontWeight: 600, color: C.tx, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 3 }}
        >
          <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} /> กลับ
        </button>
        {topic && <Pill label={topic.label} color={topic.color} />}
      </div>
      <Comp />
    </div>
  );
}

export default function GuidanceApp() {
  const [active, setActive] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active && !closing ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active, closing]);

  function open(id: string) {
    setActive(id);
    setClosing(false);
  }
  function close() {
    setClosing(true);
    setTimeout(() => {
      setActive(null);
      setClosing(false);
    }, 380);
  }

  const ha = (d: number): CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "none" : "translateY(24px)",
    transition: `all .85s ${EASE_REVEAL} ${d}s`,
  });

  const spotRef = useRef<HTMLDivElement>(null);
  const [ctr, setCtr] = useState(2);
  const onScroll = useCallback(() => {
    const el = spotRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let b = 0,
      m = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const el2 = c as HTMLElement;
      const d = Math.abs(mid - el2.offsetLeft - el2.offsetWidth / 2);
      if (d < m) {
        m = d;
        b = i;
      }
    });
    setCtr(b);
  }, []);
  useEffect(() => {
    const el = spotRef.current;
    const child = el?.children[2] as HTMLElement | undefined;
    if (el && child) el.scrollLeft = child.offsetLeft - el.clientWidth / 2 + 70;
  }, []);

  return (
    <div style={{ fontFamily: F, color: C.tx, background: "var(--snow)", maxWidth: 640, margin: "0 auto", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes openUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:none}}
        @keyframes closeDown{from{opacity:1;transform:none}to{opacity:0;transform:translateY(50px)}}
        .bob{animation:bob 2.2s ease-in-out infinite}
        .expand-enter{animation:expandIn .3s ${EASE_MORPH}}
        @keyframes expandIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        .spotRow{display:flex;gap:6px;overflow-x:auto;padding:24px calc(50% - 70px);-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x mandatory;position:relative;z-index:2}
        .spotRow::-webkit-scrollbar{display:none}
        button:active{opacity:.7}
        textarea::placeholder,input::placeholder{color:#C7C7CC}
      `}</style>

      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "80px 24px 48px" }}>
        <div style={ha(0.15)}>
          <Pill label="LEARN & GROW" />
        </div>
        <h1 style={{ fontSize: "clamp(48px,12vw,84px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-.045em", margin: "24px 0 0", ...ha(0.3) }}>
          เรียนรู้
          <br />
          ที่จะ<span className="text-gradient-rp">เติบโต</span>
        </h1>
        <p style={{ fontSize: "clamp(15px,3.5vw,18px)", color: C.su, lineHeight: 1.6, maxWidth: 360, margin: "16px 0 0", ...ha(0.45) }}>ก้าวต่อไปของชีวิต เริ่มต้นที่การรู้จักตัวเอง</p>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, ...ha(0.6) }}>
          <ChevronDown size={20} color="#D2D2D7" />
          <ChevronDown size={20} color="#AEAEB2" />
          <ChevronDown size={24} color={C.ln} className="bob" />
        </div>
      </section>

      <Rv style={{ padding: "0 20px 52px" }}>
        <Gl style={{ maxWidth: 480, margin: "0 auto", padding: "22px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
          {[["6", "หัวข้อหลัก"], ["20+", "กิจกรรม"], ["∞", "ประโยชน์"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.red }}>{n}</div>
              <div style={{ fontSize: 12, color: C.su, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </Gl>
      </Rv>

      <section style={{ padding: "48px 0 56px", position: "relative", zIndex: 1 }}>
        <Rv>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: C.red, letterSpacing: ".08em", marginBottom: 8, textTransform: "uppercase" }}>EXPLORE</div>
        </Rv>
        <Rv delay={0.06}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(26px,6vw,40px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 8px" }}>หัวข้อทั้งหมด</h2>
        </Rv>
        <div ref={spotRef} onScroll={onScroll} className="spotRow">
          {TOPICS.map((t, i) => {
            const on = i === ctr;
            const r = toRgb(t.color);
            return (
              <div
                key={t.id}
                onClick={() => open(t.id)}
                style={{
                  flexShrink: 0,
                  width: 148,
                  padding: "24px 14px",
                  borderRadius: 22,
                  background: on ? `rgba(${r},.07)` : "transparent",
                  boxShadow: on ? "0 4px 20px rgba(0,0,0,.07)" : "none",
                  transform: on ? "scale(1.06)" : "scale(.88)",
                  opacity: on ? 1 : 0.3,
                  transition: `all .35s ${EASE_REVEAL}`,
                  textAlign: "center",
                  cursor: "pointer",
                  scrollSnapAlign: "center",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: on ? t.color + "18" : C.li, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", transition: `all .3s ${EASE_MORPH}` }}>
                  <t.Icon size={20} color={on ? t.color : C.su} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: on ? C.tx : C.su }}>{t.label}</div>
                <div style={{ fontSize: 10, color: C.su, marginTop: 4, lineHeight: 1.3, opacity: on ? 1 : 0, transition: `opacity .3s ${EASE_MORPH}` }}>{t.sub}</div>
                <div style={{ marginTop: 8, width: 18, height: 3, borderRadius: 2, background: on ? t.color : "transparent", margin: "8px auto 0", transition: `background .3s ${EASE_MORPH}` }} />
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "0 0 52px" }}>
        <Rv>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: C.red, letterSpacing: ".08em", marginBottom: 8, textTransform: "uppercase" }}>CURRICULUM</div>
        </Rv>
        <Rv delay={0.06}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 22px" }}>6 หัวข้อการเรียนรู้</h2>
        </Rv>
        {TOPICS.map((t, i) => {
          const r = toRgb(t.color);
          return (
            <Rv key={t.id} delay={i * 0.04} style={{ padding: "0 20px", marginBottom: 12 }}>
              <Gl onClick={() => open(t.id)} style={{ padding: "18px 20px", cursor: "pointer", background: `rgba(${r},.05)`, border: `1px solid rgba(${r},.12)` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: t.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <t.Icon size={20} color={t.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: C.su, marginBottom: 10 }}>{t.sub}</div>
                    {t.preview.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                        <div style={{ width: 4, height: 4, borderRadius: 2, background: t.color, flexShrink: 0, marginTop: 6 }} />
                        <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.5 }}>{p}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Gl>
            </Rv>
          );
        })}
      </section>

      <section style={{ padding: "52px 20px" }}>
        <Rv>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: C.red, letterSpacing: ".08em", marginBottom: 8, textTransform: "uppercase" }}>WHAT YOU GET</div>
        </Rv>
        <Rv delay={0.06}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(28px,6vw,42px)", fontWeight: 800, letterSpacing: "-.03em", margin: "0 0 32px" }}>สิ่งที่จะได้เรียนรู้</h2>
        </Rv>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { Icon: MapPin, t: "8 เส้นทางการศึกษา", d: "ทุกทางเลือกหลัง ม.3 พร้อมข้อดีข้อเสีย" },
            { Icon: Wallet, t: "ทักษะการเงิน", d: "สร้างนิสัยการเงินก่อนเข้าสู่โลกจริง" },
            { Icon: Heart, t: "เพศศึกษา", d: "รู้จักตัวเอง รักษาสิทธิ์ ปลอดภัยออนไลน์" },
            { Icon: Brain, t: "สุขภาพจิต", d: "รับมือกับความกดดันและอารมณ์" },
            { Icon: Puzzle, t: "พหุปัญญา", d: "ค้นพบว่าคุณฉลาดแบบไหน" },
            { Icon: Calendar, t: "Time Blocking", d: "ออกแบบ 24 ชั่วโมงของคุณเอง" },
          ].map((b, i) => (
            <Rv key={b.t} delay={i * 0.04}>
              <div style={{ textAlign: "center", padding: "22px 12px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.red + "0c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <b.Icon size={22} color={C.red} strokeWidth={1.3} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{b.t}</div>
                <div style={{ fontSize: 12, color: C.su, lineHeight: 1.4 }}>{b.d}</div>
              </div>
            </Rv>
          ))}
        </div>
      </section>

      <footer style={{ padding: "40px 20px 28px", background: C.li, textAlign: "center" }}>
        <Rv>
          <div style={{ fontSize: 13, fontWeight: 600 }}>โรงเรียนเบญจมราชูทิศ ราชบุรี</div>
          <div style={{ fontSize: 12, color: C.su, marginTop: 4 }}>หลักสูตรแนะแนว</div>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: C.red, margin: "14px auto 0" }} />
        </Rv>
      </footer>

      {active && <Overlay id={active} closing={closing} onClose={close} />}
    </div>
  );
}
