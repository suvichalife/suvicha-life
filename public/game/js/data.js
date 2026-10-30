/* =============================================================================
 * THE GAME OF LIFE — GAME DATA
 * Personas, products, stocks and the life-event deck (all Thai)
 * Every round = 1 life stage of 5 years (age 25 → 65, 8 rounds)
 * Exposes window.GOL_DATA
 * ========================================================================== */
(function () {
  'use strict';

  const ROUNDS = 8;          // 25-29, 30-34, ... 60-64 → retire at 65
  const START_AGE = 25;
  const YEARS_PER_ROUND = 5;

  // ---------------------------------------------------------------------------
  // PERSONAS (income / expense are per round = 5 years)
  // ---------------------------------------------------------------------------
  const PERSONAS = [
    {
      id: 'office', cast: 'office', name: 'มนุษย์เงินเดือน', tag: 'ออฟฟิศ • มั่นคง',
      desc: 'รายได้สม่ำเสมอ มีสวัสดิการพื้นฐาน แต่รายได้โตช้า ต้องวางแผนเองถ้าอยากเกษียณสบาย',
      income: 1500000, expense: 1000000, cash: 200000, volatility: 0.05, growth: 0.08,
      health: 75, happy: 55, married: false, kids: 0,
      stats: { income: 3, stable: 5, health: 3 }
    },
    {
      id: 'owner', cast: 'owner', name: 'เจ้าของกิจการ', tag: 'ผู้บริหาร • รายได้สูง',
      desc: 'รายได้สูงแต่ขึ้นลงตามเศรษฐกิจ ไม่มีสวัสดิการบริษัท ถ้าหยุดทำงาน รายได้ก็หยุดด้วย',
      income: 2600000, expense: 1700000, cash: 500000, volatility: 0.35, growth: 0.10,
      health: 60, happy: 50, married: false, kids: 0,
      stats: { income: 5, stable: 2, health: 2 }
    },
    {
      id: 'freelance', cast: 'freelance', name: 'ฟรีแลนซ์สายครีเอทีฟ', tag: 'อิสระ • คล่องตัว',
      desc: 'เป็นนายตัวเอง ใช้ชีวิตยืดหยุ่น สุขภาพดี แต่รายได้ไม่แน่นอนและไม่มีใครจ่ายค่ารักษาให้',
      income: 1200000, expense: 800000, cash: 100000, volatility: 0.30, growth: 0.09,
      health: 85, happy: 65, married: false, kids: 0,
      stats: { income: 2, stable: 1, health: 4 }
    },
    {
      id: 'parent', cast: 'parent', name: 'คุณแม่นักวางแผน', tag: 'ครอบครัว • มีคนพึ่งพา',
      desc: 'มีครอบครัวและลูกตั้งแต่เริ่ม ค่าใช้จ่ายสูง ทุกการตัดสินใจส่งผลถึงคนที่คุณรัก',
      income: 1900000, expense: 1450000, cash: 300000, volatility: 0.06, growth: 0.08,
      health: 70, happy: 60, married: true, kids: 1,
      stats: { income: 3, stable: 4, health: 3 }
    }
  ];

  // ---------------------------------------------------------------------------
  // INSURANCE PRODUCTS (premium per round, depends on age)
  // ---------------------------------------------------------------------------
  const ageF = (age, k) => 1 + (age - START_AGE) * k;
  const r1000 = v => Math.round(v / 1000) * 1000;

  const INSURANCE = {
    health: {
      name: 'ประกันสุขภาพเหมาจ่าย', short: 'สุขภาพ', icon: 'hospital',
      desc: 'จ่ายค่ารักษาในโรงพยาบาลแทนคุณ วงเงิน 5 ล้านบาท/ช่วง • คุ้มครอง 1 ช่วง ต้องต่ออายุทุกช่วง',
      limit: 5000000, term: 'short', premium: age => r1000(90000 * ageF(age, 0.08))
    },
    ci: {
      name: 'ประกันโรคร้ายแรง', short: 'โรคร้ายแรง', icon: 'ribbon',
      desc: 'ตรวจพบโรคร้ายแรง รับเงินก้อน 1,000,000 บาททันที ไว้ทดแทนรายได้ที่หายไป • ต่ออายุทุกช่วง',
      payout: 1000000, term: 'short', premium: age => r1000(30000 * ageF(age, 0.10))
    },
    pa: {
      name: 'ประกันอุบัติเหตุ (PA)', short: 'อุบัติเหตุ', icon: 'bandage',
      desc: 'ค่ารักษาจากอุบัติเหตุสูงสุด 100,000 บาท + ทุนประกัน 500,000 บาท • เบี้ยถูก ต่ออายุทุกช่วง',
      limit: 100000, payout: 500000, term: 'short', premium: () => 20000
    },
    life: {
      name: 'ประกันชีวิต (ทุน 1 ล้าน/หน่วย)', short: 'ชีวิต', icon: 'shield',
      desc: 'ถ้าเกิดเหตุไม่คาดฝัน ครอบครัวได้รับเงิน 1,000,000 บาท/หน่วย • สะสมมูลค่าเงินสด • ลดหย่อนภาษีได้',
      sum: 1000000, term: 'long', maxUnits: 10, cashValueRate: 0.55, premium: age => r1000(60000 * ageF(age, 0.05))
    },
    annuity: {
      name: 'ประกันบำนาญ (หน่วยละ 250,000/ช่วง)', short: 'บำนาญ', icon: 'coin',
      desc: 'จ่ายถึงอายุ 60 แล้วรับเงินบำนาญหลังเกษียณ ประมาณ 1.5 เท่าของเบี้ยที่จ่าย • ลดหย่อนภาษีได้',
      term: 'long', maxUnits: 6, payoutRate: 1.5, premium: () => 250000
    }
  };

  // ---------------------------------------------------------------------------
  // INVESTMENTS (per round return model: mean + sd * N(0,1))
  // ---------------------------------------------------------------------------
  const INVEST = {
    deposit: { name: 'เงินฝากประจำ', unit: 50000, desc: 'ปลอดภัย ผลตอบแทนน้อย ~8% ต่อช่วง', mean: 0.08, sd: 0 },
    fund: { name: 'กองทุนรวมหุ้น', price: 10000, desc: 'กระจายความเสี่ยง ผลตอบแทนเฉลี่ยดีในระยะยาว', mean: 0.22, sd: 0.25, floor: 0.25 },
    gold: { name: 'ทองคำ (บาทละ)', price: 40000, desc: 'สินทรัพย์ปลอดภัย มักขึ้นเมื่อเศรษฐกิจแย่', mean: 0.12, sd: 0.15, floor: 0.5 },
    crypto: { name: 'คริปโตเคอร์เรนซี', price: 50000, desc: 'ผันผวนสูงมาก อาจรวยหรือหมดตัว', mean: 0.35, sd: 0.9, floor: 0.05 },
    loan: { name: 'กู้เงิน (ดอกเบี้ย 20%/ช่วง)', unit: 100000, rate: 0.20, desc: 'ได้เงินสดทันที แต่ต้องจ่ายดอกเบี้ยทุกช่วง' }
  };

  const STOCKS = [
    { id: 'bank', name: 'กลุ่มธนาคาร', price: 50, mean: 0.10, sd: 0.20 },
    { id: 'prop', name: 'กลุ่มอสังหาริมทรัพย์', price: 20, mean: 0.08, sd: 0.30 },
    { id: 'tech', name: 'กลุ่มเทคโนโลยี', price: 100, mean: 0.25, sd: 0.45 },
    { id: 'cons', name: 'กลุ่มอุปโภคบริโภค', price: 30, mean: 0.12, sd: 0.15 },
    { id: 'agri', name: 'กลุ่มเกษตรกรรม', price: 10, mean: 0.06, sd: 0.35 }
  ];

  // ---------------------------------------------------------------------------
  // LIFE EVENT DECK
  // type: simple | dice | choice | claim
  // pool: life (good/choice/fate) | risk (health/market)
  // G = helper API from game.js (cash, claim, fmt, shockMarket, ...)
  // ---------------------------------------------------------------------------
  const isWorker = s => s.persona.id === 'office' || s.persona.id === 'parent';

  const EVENTS = [
    // ===================== GOOD =====================
    {
      id: 'bonus', pool: 'life', type: 'dice', who: 'self', mood: 'happy', scene: 'GOLD',
      title: 'โบนัสพิเศษ',
      text: s => isWorker(s) ? 'ผลงานโดดเด่น บริษัทมอบโบนัสพิเศษให้คุณ ทอยลูกเต๋าเพื่อดูว่าจะได้เท่าไร'
        : 'ปิดดีลลูกค้ารายใหญ่ได้สำเร็จ ทอยลูกเต๋าเพื่อดูกำไรพิเศษ',
      diceNote: s => `ผลจากการทอยเต๋า × ${G_fmt(bonusUnit(s))}`,
      weight: () => 9,
      run: (s, G, die) => {
        const amt = die * bonusUnit(s);
        return { lines: [G.cash(s, amt, `โบนัส (เต๋า ${die} × ${G.fmt(bonusUnit(s))})`)], fx: 'coins', mood: 'jump' };
      }
    },
    {
      id: 'promotion', pool: 'life', type: 'simple', who: 'boss', mood: 'happy', scene: 'LIGHT',
      title: 'ได้เลื่อนตำแหน่ง',
      text: s => isWorker(s) ? 'หัวหน้าเห็นความตั้งใจ คุณได้เลื่อนตำแหน่ง รายได้เพิ่มขึ้น 15% ตั้งแต่ช่วงนี้เป็นต้นไป'
        : 'ชื่อเสียงของคุณเริ่มเป็นที่รู้จัก ลูกค้าเพิ่มขึ้น รายได้เพิ่มขึ้น 15% ตั้งแต่ช่วงนี้เป็นต้นไป',
      when: s => s.stage <= 6, weight: () => 6,
      run: s => { s.income = Math.round(s.income * 1.15); s.happy += 5; return { lines: [{ label: 'รายได้ต่อช่วงเพิ่มเป็น', amount: s.income, kind: 'info' }], fx: 'jump' }; }
    },
    {
      id: 'lottery', pool: 'life', type: 'dice', who: 'self', mood: 'happy', scene: 'GOLD',
      title: 'ถูกรางวัลเลขท้าย',
      text: () => 'ซื้อสลากกินแบ่งไว้ใบเดียว ดันถูกรางวัลเลขท้าย ทอยลูกเต๋าดูว่าได้กี่ใบ',
      diceNote: () => 'ผลจากการทอยเต๋า × 4,000',
      weight: () => 4,
      run: (s, G, die) => ({ lines: [G.cash(s, die * 4000, `รางวัลสลาก (เต๋า ${die} × 4,000)`)], fx: 'coins', mood: 'jump' })
    },
    {
      id: 'inherit', pool: 'life', type: 'simple', once: true, who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'มรดกจากญาติผู้ใหญ่',
      text: () => 'ญาติผู้ใหญ่ที่รักคุณมากได้ทำประกันชีวิตไว้และระบุชื่อคุณเป็นผู้รับประโยชน์ คุณได้รับเงินก้อน 300,000 บาท',
      when: s => s.age >= 40, weight: () => 3,
      run: (s, G) => ({ lines: [G.cash(s, 300000, 'เงินจากกรมธรรม์ของญาติ')], fx: 'coins', text: 'ประกันชีวิตคือการส่งต่อความรักที่จับต้องได้' })
    },

    // ===================== CHOICES =====================
    {
      id: 'course', pool: 'life', type: 'choice', once: true, who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'คอร์สเรียนต่อ',
      text: () => 'คุณเจอโฆษณาคอร์สเรียนต่อปริญญาโทออนไลน์ ค่าเรียน 200,000 บาท จบแล้วมีโอกาสได้รายได้เพิ่มขึ้น 20%',
      when: s => s.age <= 45, weight: () => 6,
      options: () => [
        { label: 'สมัครเรียน', cost: 200000, run: (s, G) => { s.income = Math.round(s.income * 1.2); s.happy += 3; return { lines: [G.cash(s, -200000, 'ค่าเรียน'), { label: 'รายได้ต่อช่วงใหม่', amount: s.income, kind: 'info' }], fx: 'jump', text: 'การลงทุนในตัวเองให้ผลตอบแทนดีที่สุด' }; } },
        { label: 'ไม่สมัคร', ghost: true, run: () => ({ text: 'คุณเลือกเก็บเงินไว้ก่อน' }) }
      ]
    },
    {
      id: 'business', pool: 'life', type: 'choice', once: true, who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'เปิดธุรกิจเสริม',
      text: () => 'คุณอยากเปิดร้านกาแฟเล็ก ๆ เป็นธุรกิจเสริม ต้องใช้เงินลงทุน 400,000 บาท ความสำเร็จขึ้นอยู่กับโชคและจังหวะ',
      when: s => s.age >= 30 && s.age <= 50, weight: () => 5,
      options: () => [
        {
          label: 'ลงทุนเลย (ทอยเต๋าวัดดวง)', cost: 400000, dice: true,
          diceNote: 'เต๋า 1–2 ขาดทุนหมด • 3–4 ได้ทุนคืน • 5–6 ได้ 3 เท่า',
          run: (s, G, die) => {
            const lines = [G.cash(s, -400000, 'เงินลงทุนธุรกิจ')];
            if (die <= 2) return { lines, fx: 'loss', mood: 'cry', text: 'ร้านไปไม่รอด ต้องปิดกิจการ' };
            if (die <= 4) { lines.push(G.cash(s, 400000, 'ขายกิจการได้ทุนคืน')); return { lines, text: 'เสมอตัว ได้ประสบการณ์กลับมา' }; }
            lines.push(G.cash(s, 1200000, 'กำไรจากธุรกิจ')); s.income = Math.round(s.income * 1.1);
            return { lines, fx: 'coins', mood: 'jump', text: 'ร้านดังในโซเชียล รายได้เพิ่มอีก 10% ทุกช่วง' };
          }
        },
        { label: 'ทำงานประจำต่อ', ghost: true, run: () => ({ text: 'คุณเลือกเส้นทางที่มั่นคงกว่า' }) }
      ]
    },
    {
      id: 'car', pool: 'life', type: 'choice', once: true, who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'อยากได้รถใหม่',
      text: () => 'รถคันเก่าเริ่มงอแง เพื่อนร่วมงานเพิ่งถอยรถใหม่ป้ายแดง คุณจะทำอย่างไร',
      when: s => !s.flags.car, weight: () => 6,
      options: () => [
        { label: 'ซื้อเงินสด 700,000', cost: 700000, run: (s, G) => { s.flags.car = true; s.happy += 10; return { lines: [G.cash(s, -700000, 'ซื้อรถใหม่')], mood: 'jump', text: 'ขับรถใหม่ ความสุขเพิ่มขึ้น' }; } },
        { label: 'ผ่อน 3 ช่วง ช่วงละ 300,000', run: s => { s.flags.car = true; s.happy += 10; s.installments.push({ name: 'ค่างวดรถ', amount: 300000, left: 3 }); return { lines: [{ label: 'ค่างวดรถ/ช่วง (3 ช่วง)', amount: -300000, kind: 'info' }], mood: 'happy', text: 'ผ่อนสบายตอนนี้ แต่จ่ายรวมแพงกว่า' }; } },
        { label: 'ซ่อมใช้ต่อ 50,000', ghost: true, cost: 50000, run: (s, G) => ({ lines: [G.cash(s, -50000, 'ค่าซ่อมรถ')], text: 'ประหยัดไว้ก่อน เงินเก็บยังอยู่' }) }
      ]
    },
    {
      id: 'wedding', pool: 'life', type: 'choice', once: true, who: 'spouse', mood: 'happy', scene: 'RED',
      title: 'ถึงเวลาแต่งงาน',
      text: () => 'คุณพบคนที่ใช่ และตัดสินใจใช้ชีวิตร่วมกัน คู่ชีวิตช่วยหารายได้ แต่ค่าใช้จ่ายครอบครัวก็เพิ่มขึ้นด้วย',
      when: s => !s.married && s.age <= 40, weight: () => 8,
      options: () => [
        { label: 'จัดงานใหญ่ 600,000', cost: 600000, run: (s, G) => { marry(s); s.happy += 20; return { lines: [G.cash(s, -600000, 'ค่าจัดงานแต่งงาน')], fx: 'hearts', mood: 'jump', text: 'งานแต่งในฝัน ทุกคนมีความสุข' }; } },
        { label: 'จัดเล็ก ๆ อบอุ่น 150,000', cost: 150000, run: (s, G) => { marry(s); s.happy += 15; return { lines: [G.cash(s, -150000, 'ค่าจัดงานแต่งงาน')], fx: 'hearts', mood: 'jump', text: 'อบอุ่น เรียบง่าย และมีเงินเหลือเริ่มต้นชีวิตคู่' }; } },
        { label: 'ยังไม่พร้อม', ghost: true, run: s => { s.happy -= 5; return { text: 'คุณขอโฟกัสที่ตัวเองไปก่อน' }; } }
      ]
    },
    {
      id: 'baby', pool: 'life', type: 'simple', who: 'kid', mood: 'happy', scene: 'RED',
      title: 'สมาชิกใหม่ของครอบครัว',
      text: () => 'ยินดีด้วย คุณได้เป็นพ่อแม่ ค่าใช้จ่ายเพิ่มขึ้น 250,000 บาท/ช่วง และตอนนี้มีคนตัวเล็ก ๆ ที่ต้องพึ่งพาคุณแล้ว',
      when: s => s.married && s.kids < 2 && s.age <= 42, weight: () => 7,
      run: s => { s.kids += 1; s.expense += 250000; s.happy += 15; return { lines: [{ label: 'ค่าใช้จ่ายต่อช่วงเพิ่มเป็น', amount: s.expense, kind: 'info' }], fx: 'hearts', mood: 'jump', text: 'ถ้าวันหนึ่งคุณไม่อยู่ ใครจะดูแลเขาต่อ' }; }
    },
    {
      id: 'ponzi', pool: 'life', type: 'choice', once: true, who: 'friend', mood: 'happy', scene: 'LIGHT',
      title: 'เพื่อนชวนลงทุน',
      text: () => 'เพื่อนสนิทชวนลงทุนโปรเจกต์ใหม่ การันตีผลตอบแทน 10% ทุกเดือน ไม่มีความเสี่ยง ขั้นต่ำ 300,000 บาท',
      weight: () => 5,
      options: () => [
        { label: 'ลงทุน 300,000', cost: 300000, run: (s, G) => { s.happy -= 10; return { lines: [G.cash(s, -300000, 'เงินลงทุน (แชร์ลูกโซ่ล่ม)')], fx: 'loss', mood: 'cry', scene: 'DARK', text: 'ผ่านไป 3 เดือน เพื่อนติดต่อไม่ได้ ระบบล่ม เงินหายทั้งหมด' }; } },
        { label: 'ปฏิเสธ', ghost: true, run: () => ({ text: 'รอดตัว ผลตอบแทนสูงผิดปกติแบบไม่มีความเสี่ยงคือสัญญาณอันตราย', mood: 'happy' }) }
      ]
    },
    {
      id: 'condo', pool: 'life', type: 'choice', once: true, who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'คอนโดปล่อยเช่า',
      text: () => 'มีคอนโดใกล้รถไฟฟ้าขายราคา 1,500,000 บาท ปล่อยเช่าได้ราว 90,000 บาท/ช่วง และราคามีแนวโน้มขึ้น',
      when: s => s.age >= 30 && s.age <= 55 && !s.property, weight: () => 5,
      options: () => [
        { label: 'ซื้อ 1,500,000', cost: 1500000, run: (s, G) => { s.property = 1500000; return { lines: [G.cash(s, -1500000, 'ซื้อคอนโด')], mood: 'happy', text: 'คุณมีรายได้ค่าเช่าทุกช่วง' }; } },
        { label: 'ไม่ซื้อ', ghost: true, run: () => ({ text: 'คุณเก็บสภาพคล่องไว้ก่อน' }) }
      ]
    },
    {
      id: 'trip', pool: 'life', type: 'choice', who: 'friend', mood: 'happy', scene: 'LIGHT',
      title: 'ทริปญี่ปุ่นกับเพื่อน',
      text: () => 'แก๊งเพื่อนชวนไปเที่ยวญี่ปุ่นช่วงซากุระบาน งบประมาณคนละ 120,000 บาท',
      weight: () => 5,
      options: () => [
        { label: 'ไปเลย 120,000', cost: 120000, run: (s, G) => { s.happy += 12; s.health += 3; return { lines: [G.cash(s, -120000, 'ค่าเที่ยว')], mood: 'jump', fx: 'hearts', text: 'ความทรงจำดี ๆ ที่เงินซื้อได้' }; } },
        { label: 'ไม่ไป เก็บเงิน', ghost: true, run: s => { s.happy -= 3; return { text: 'เพื่อน ๆ ส่งรูปมาอวดทั้งทริป' }; } }
      ]
    },
    {
      id: 'lend', pool: 'life', type: 'choice', once: true, who: 'friend', mood: 'cry', scene: 'LIGHT',
      title: 'เพื่อนขอยืมเงิน',
      text: () => 'เพื่อนเก่าโทรมาขอยืมเงิน 100,000 บาท บอกว่าจะคืนให้ภายในปีนี้แน่นอน',
      weight: () => 4,
      options: () => [
        {
          label: 'ให้ยืม (ทอยเต๋าดูว่าได้คืนไหม)', cost: 100000, dice: true, diceNote: 'เต๋า 4–6 ได้เงินคืน • 1–3 ไม่ได้คืน',
          run: (s, G, die) => {
            const lines = [G.cash(s, -100000, 'ให้เพื่อนยืม')];
            if (die >= 4) { lines.push(G.cash(s, 100000, 'เพื่อนคืนเงิน')); s.happy += 5; return { lines, mood: 'happy', text: 'เพื่อนคืนครบ มิตรภาพแน่นแฟ้นขึ้น' }; }
            s.happy -= 5; return { lines, fx: 'loss', mood: 'cry', text: 'เพื่อนเงียบหายไป ทั้งเงินและเพื่อน' };
          }
        },
        { label: 'ปฏิเสธอย่างสุภาพ', ghost: true, run: s => { s.happy -= 2; return { text: 'คุณรักษาเงินเก็บไว้ได้' }; } }
      ]
    },
    {
      id: 'burnout', pool: 'life', type: 'choice', who: 'self', mood: 'sick', scene: 'DARK',
      title: 'ภาวะหมดไฟ',
      text: () => 'ทำงานหนักติดต่อกันหลายปี คุณรู้สึกเหนื่อยล้า นอนไม่หลับ ไม่อยากตื่นไปทำงาน',
      when: s => s.health < 70 || s.happy < 45, weight: () => 4,
      options: () => [
        { label: 'พักฟื้นใจ 3 เดือน (รายได้ลด 10%)', run: s => { s.round.incomeMult *= 0.9; s.health += 10; s.happy += 12; return { lines: [{ label: 'รายได้ช่วงนี้ลดลง', amount: -10, kind: 'pct' }], mood: 'happy', text: 'กลับมาสดชื่น พร้อมลุยต่อ' }; } },
        { label: 'ฝืนทำงานต่อ', ghost: true, run: s => { s.health -= 15; s.happy -= 8; return { mood: 'sick', text: 'ร่างกายเริ่มส่งสัญญาณเตือน สุขภาพลดลง' }; } }
      ]
    },

    // ===================== FATE =====================
    {
      id: 'layoff', pool: 'life', type: 'simple', who: 'boss', mood: 'shock', scene: 'DARK',
      title: s => isWorker(s) ? 'บริษัทปรับโครงสร้าง' : 'ธุรกิจซบเซา',
      text: s => isWorker(s) ? 'บริษัทปรับโครงสร้างองค์กร คุณต้องหางานใหม่ รายได้ช่วงนี้หายไปครึ่งหนึ่ง'
        : 'เศรษฐกิจชะลอตัว ลูกค้าหายไปครึ่งหนึ่ง รายได้ช่วงนี้ลดลง 50%',
      weight: () => 5,
      run: s => { s.round.incomeMult *= 0.5; s.happy -= 8; return { lines: [{ label: 'รายได้ช่วงนี้ลดลง', amount: -50, kind: 'pct' }], fx: 'loss', mood: 'cry', text: 'เงินสำรองฉุกเฉินสำคัญแค่ไหน ตอนนี้รู้แล้ว' }; }
    },
    {
      id: 'parentsIll', pool: 'life', type: 'dice', who: 'doctor', mood: 'normal', scene: 'HOSPITAL',
      title: 'คุณพ่อคุณแม่ล้มป่วย',
      text: () => 'คุณพ่อคุณแม่เข้าโรงพยาบาล และไม่มีประกันสุขภาพ คุณต้องช่วยออกค่ารักษา ทอยลูกเต๋าดูค่าใช้จ่าย',
      diceNote: () => 'ผลจากการทอยเต๋า × 50,000',
      when: s => s.age >= 35, weight: () => 5,
      run: (s, G, die) => { s.happy -= 5; s.stats.familyCost += die * 50000; return { lines: [G.cash(s, -die * 50000, `ค่ารักษาพ่อแม่ (เต๋า ${die} × 50,000)`)], fx: 'loss', mood: 'cry', text: 'ประกันสุขภาพสำหรับพ่อแม่ ก็คือประกันสำหรับเงินเก็บของคุณ' }; }
    },
    {
      id: 'departure', pool: 'life', type: 'simple', once: true, who: 'self', mood: 'cry', scene: 'DARK', fatal: true,
      title: 'เหตุไม่คาดฝัน',
      text: () => 'ชีวิตไม่มีใครรู้ล่วงหน้า เกิดเหตุไม่คาดฝันขึ้นกะทันหัน คุณต้องจากครอบครัวไปก่อนวัยอันควร',
      when: s => s.age >= 30, weight: s => 0.5 + Math.max(0, 70 - s.health) / 40,
      run: s => { s.over = true; s.endReason = 'departure'; return { mood: 'cry', text: 'เรื่องราวของคุณจบลงที่นี่ มาดูกันว่าคุณทิ้งอะไรไว้ให้คนข้างหลัง' }; }
    },

    // ===================== HEALTH (claims) =====================
    {
      id: 'flu', pool: 'risk', type: 'claim', who: 'doctor', scene: 'HOSPITAL',
      title: 'ไข้หวัดใหญ่ลงปอด', text: () => 'ไข้ขึ้นสูงหลายวัน หมอให้นอนโรงพยาบาล 3 คืน',
      weight: s => 6 * healthRisk(s),
      claim: { cost: 45000, healthHit: 5 }
    },
    {
      id: 'dengue', pool: 'risk', type: 'claim', who: 'doctor', scene: 'HOSPITAL',
      title: 'ไข้เลือดออก', text: () => 'ยุงลายตัวเดียวทำพิษ เกล็ดเลือดต่ำ ต้องนอนโรงพยาบาล 5 วัน',
      weight: s => 5 * healthRisk(s),
      claim: { cost: 90000, healthHit: 8 }
    },
    {
      id: 'appendix', pool: 'risk', type: 'claim', once: true, who: 'doctor', scene: 'HOSPITAL',
      title: 'ไส้ติ่งอักเสบ', text: () => 'ปวดท้องรุนแรงกลางดึก หมอวินิจฉัยว่าไส้ติ่งอักเสบ ต้องผ่าตัดด่วน',
      weight: s => 4 * healthRisk(s),
      claim: { cost: 160000, healthHit: 8 }
    },
    {
      id: 'accident', pool: 'risk', type: 'claim', who: 'doctor', scene: 'HOSPITAL',
      title: 'อุบัติเหตุบนท้องถนน', text: () => 'ระหว่างเดินทางกลับบ้าน รถถูกชนท้าย แขนหัก ต้องผ่าตัดใส่เหล็กและพักฟื้น',
      weight: s => 5 * healthRisk(s),
      claim: { cost: 280000, healthHit: 15, accident: true, incomeLoss: 0.1 }
    },
    {
      id: 'spine', pool: 'risk', type: 'claim', once: true, who: 'doctor', scene: 'HOSPITAL',
      title: 'หมอนรองกระดูกทับเส้น', text: () => 'นั่งทำงานนานหลายปี ปวดหลังร้าวลงขา หมอแนะนำให้ผ่าตัดส่องกล้อง',
      when: s => s.age >= 35, weight: s => 4 * healthRisk(s),
      claim: { cost: 350000, healthHit: 10 }
    },
    {
      id: 'cancer', pool: 'risk', type: 'claim', once: true, who: 'doctor', scene: 'HOSPITAL',
      title: 'ตรวจพบมะเร็ง', text: () => 'ผลตรวจสุขภาพประจำปีพบมะเร็งระยะเริ่มต้น ต้องผ่าตัดและให้คีโม รักษาต่อเนื่องหลายเดือน',
      when: s => s.age >= 35, weight: s => 3 * healthRisk(s) * (1 + (s.age - 35) / 20),
      claim: { cost: 1800000, healthHit: 30, ci: true, serious: true, incomeLoss: 0.4 }
    },
    {
      id: 'heart', pool: 'risk', type: 'claim', once: true, who: 'doctor', scene: 'HOSPITAL',
      title: 'หลอดเลือดหัวใจตีบ', text: () => 'เจ็บแน่นหน้าอกขณะประชุม ต้องทำบอลลูนและใส่ขดลวดหัวใจด่วน',
      when: s => s.age >= 45, weight: s => 3 * healthRisk(s) * (1 + (s.age - 45) / 15),
      claim: { cost: 1500000, healthHit: 30, ci: true, serious: true, incomeLoss: 0.5 }
    },

    // ===================== MARKET =====================
    {
      id: 'crisis', pool: 'risk', type: 'simple', who: 'self', mood: 'shock', scene: 'DARK',
      title: 'วิกฤตเศรษฐกิจโลก',
      text: () => 'เศรษฐกิจโลกเข้าสู่ภาวะถดถอย ตลาดหุ้นร่วงหนัก หุ้นทุกกลุ่มลดลง 60% คริปโตลด 70% แต่ทองคำพุ่งขึ้น',
      weight: () => 4,
      run: (s, G) => { G.shock(s, { stocks: 0.4, fund: 0.6, crypto: 0.3, gold: 1.3 }); return { lines: [{ label: 'หุ้น −60% • กองทุน −40% • คริปโต −70% • ทอง +30%', kind: 'note' }], fx: 'loss', text: 'คนที่มีเงินสดสำรอง จะได้ซื้อของดีราคาถูก' }; }
    },
    {
      id: 'bull', pool: 'risk', type: 'simple', who: 'self', mood: 'jump', scene: 'GOLD',
      title: 'ตลาดกระทิง',
      text: () => 'เศรษฐกิจฟื้นตัวแรง นักลงทุนต่างชาติไหลเข้า หุ้นทุกกลุ่มพุ่งขึ้น 60% กองทุนรวม +30%',
      weight: () => 4,
      run: (s, G) => { G.shock(s, { stocks: 1.6, fund: 1.3, crypto: 1.5 }); return { lines: [{ label: 'หุ้น +60% • กองทุน +30% • คริปโต +50%', kind: 'note' }], fx: 'coins' }; }
    },
    {
      id: 'cryptoSwing', pool: 'risk', type: 'dice', who: 'self', mood: 'shock', scene: 'DARK',
      title: 'คริปโตผันผวนรุนแรง',
      text: () => 'ข่าวลือเรื่องกฎหมายควบคุมคริปโตทำให้ราคาเหวี่ยงแรง ทอยลูกเต๋าเพื่อดูทิศทาง',
      diceNote: () => 'เต๋า 1–3 ราคาทุบ ×0.15 • 4–6 ราคาบูม ×3',
      weight: () => 3,
      run: (s, G, die) => {
        if (die <= 3) { G.shock(s, { crypto: 0.15 }); return { lines: [{ label: 'ราคาคริปโต −85%', kind: 'note' }], fx: 'loss', mood: 'cry' }; }
        G.shock(s, { crypto: 3 }); return { lines: [{ label: 'ราคาคริปโต ×3', kind: 'note' }], fx: 'coins', mood: 'jump' };
      }
    },
    {
      id: 'inflation', pool: 'risk', type: 'simple', who: 'self', mood: 'shock', scene: 'LIGHT',
      title: 'เงินเฟ้อพุ่ง',
      text: () => 'ข้าวของแพงขึ้นทุกอย่าง ค่าครองชีพเพิ่มขึ้น 10% ถาวร เงินสดที่เก็บไว้เฉย ๆ มีค่าน้อยลง',
      weight: () => 3,
      run: s => { s.expense = Math.round(s.expense * 1.1); return { lines: [{ label: 'ค่าใช้จ่ายต่อช่วงใหม่', amount: s.expense, kind: 'info' }] }; }
    },
    {
      id: 'aiWave', pool: 'risk', type: 'simple', once: true, who: 'self', mood: 'shock', scene: 'LIGHT',
      title: 'คลื่นปัญญาประดิษฐ์',
      text: () => 'AI เข้ามาเปลี่ยนโลกการทำงาน หุ้นกลุ่มเทคโนโลยีพุ่ง 120% แต่หลายอาชีพต้องปรับตัว',
      weight: () => 3,
      run: (s, G) => { G.shock(s, { tech: 2.2 }); return { lines: [{ label: 'หุ้นกลุ่มเทคโนโลยี +120%', kind: 'note' }], fx: 'coins' }; }
    },
    {
      id: 'rateHike', pool: 'risk', type: 'simple', who: 'self', mood: 'normal', scene: 'LIGHT',
      title: 'ดอกเบี้ยขาขึ้น',
      text: () => 'ธนาคารกลางขึ้นดอกเบี้ยสู้เงินเฟ้อ หุ้นธนาคาร +30% แต่หุ้นอสังหาริมทรัพย์ −25%',
      weight: () => 3,
      run: (s, G) => { G.shock(s, { bank: 1.3, prop: 0.75 }); return { lines: [{ label: 'ธนาคาร +30% • อสังหาฯ −25%', kind: 'note' }] }; }
    }
  ];

  // helpers used inside event text
  function bonusUnit(s) { return Math.max(10000, Math.round(s.income * 0.02 / 5000) * 5000); }
  function G_fmt(n) { return Math.round(n).toLocaleString('th-TH'); }
  function healthRisk(s) { return 1 + Math.max(0, 80 - s.health) / 35 + (s.age - 25) / 40; }
  function marry(s) {
    s.married = true;
    s.income = Math.round(s.income * 1.25);   // dual income
    s.expense = Math.round(s.expense * 1.2);
  }

  window.GOL_DATA = { ROUNDS, START_AGE, YEARS_PER_ROUND, PERSONAS, INSURANCE, INVEST, STOCKS, EVENTS };
})();
