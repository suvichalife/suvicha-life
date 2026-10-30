/* =============================================================================
 * THE GAME OF LIFE — GAME LOGIC + UI
 * Depends on: pixel.js (PX), sound.js (SFX), data.js (GOL_DATA)
 * ========================================================================== */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONFIG — change these when embedding into suvicha.life
  // ---------------------------------------------------------------------------
  const CONFIG = {
    HOME_URL: '/',                                   // "กลับหน้าหลัก"
    LINE_URL: 'https://line.me/R/ti/p/@657wxzul',    // ปรึกษาฟรี
    AGENT_NAME: 'สุวิชชา'
  };

  const D = window.GOL_DATA, C = PX.C, INS = D.INSURANCE, INV = D.INVEST;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const I = (name, opt) => ICON.html(name, opt);   // pixel-art icons (no OS emoji)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1000 = v => Math.round(v / 1000) * 1000;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const rollDie = () => 1 + Math.floor(Math.random() * 6);

  function fmt(n) { n = Math.round(n); return (n < 0 ? '−' : '') + '฿' + Math.abs(n).toLocaleString('th-TH'); }
  function fmtSigned(n) { n = Math.round(n); return (n > 0 ? '+' : n < 0 ? '−' : '') + '฿' + Math.abs(n).toLocaleString('th-TH'); }
  function fmtShort(n) {
    const a = Math.abs(n); let s;
    if (a >= 1e6) s = (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + ' ล้าน';
    else s = Math.round(a).toLocaleString('th-TH');
    return (n < 0 ? '−' : '') + '฿' + s;
  }
  const ageLabel = age => `${age}–${age + D.YEARS_PER_ROUND - 1} ปี`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  let S = null;
  let tab = 'overview';
  let busy = false;
  let asking = false;   // the "พร้อมหรือยัง" confirmation is open (prevents stacked dialogs / concurrent rounds)
  const qty = {};   // quantity inputs per stock/asset

  function freshRound() { return { incomeMult: 1, prem: { life: 0, health: 0, annuity: 0 }, gym: false, rest: false }; }

  function newState(p) {
    return {
      persona: p, stage: 0, age: D.START_AGE,
      cash: p.cash, income: p.income, expense: p.expense, health: p.health, happy: p.happy,
      married: p.married, kids: p.kids,
      ins: { health: false, ci: false, pa: false, life: 0, lifePaid: 0, annuity: 0, annuityPaid: 0 },
      insurable: { health: true, ci: true, life: true },
      inv: { deposit: 0, fund: 0, gold: 0, crypto: 0 },
      invCost: { fund: 0, gold: 0, crypto: 0 },
      prices: { fund: INV.fund.price, gold: INV.gold.price, crypto: INV.crypto.price },
      prevPrices: null,
      stocks: Object.fromEntries(D.STOCKS.map(st => [st.id, { price: st.price, qty: 0, cost: 0, prev: st.price }])),
      debt: 0, property: 0, installments: [],
      flags: {}, seen: {}, round: freshRound(),
      stats: { claimsPaid: 0, oop: 0, taxPaid: 0, taxSaved: 0, familyCost: 0, premiums: 0, claimsCount: 0 },
      history: [], expiredNotice: [], over: false, endReason: null
    };
  }

  function normalize(s) {
    s.health = clamp(Math.round(s.health), 0, 100);
    s.happy = clamp(Math.round(s.happy), 0, 100);
  }

  // ---------------------------------------------------------------------------
  // VALUATION
  // ---------------------------------------------------------------------------
  const lifeCashValue = s => Math.round(s.ins.lifePaid * INS.life.cashValueRate);
  const stockValue = s => D.STOCKS.reduce((a, st) => a + s.stocks[st.id].qty * s.stocks[st.id].price, 0);
  const investValue = s => s.inv.deposit + s.inv.fund * s.prices.fund + s.inv.gold * s.prices.gold + s.inv.crypto * s.prices.crypto + stockValue(s) + s.property;
  const installmentDebt = s => s.installments.reduce((a, i) => a + i.amount * i.left, 0);
  function netWorth(s, final = false) {
    const pension = final ? s.ins.annuityPaid * INS.annuity.payoutRate : s.ins.annuityPaid;
    return Math.round(s.cash + investValue(s) + lifeCashValue(s) + pension - s.debt - installmentDebt(s));
  }
  const premium = (k, s) => INS[k].premium(s.age);

  // ---------------------------------------------------------------------------
  // TAX (Thai personal income tax, simplified)
  // ---------------------------------------------------------------------------
  function taxOn(y) {
    const br = [[150000, 0], [300000, .05], [500000, .10], [750000, .15], [1000000, .20], [2000000, .25], [5000000, .30], [Infinity, .35]];
    let tax = 0, prev = 0;
    for (const [cap, rate] of br) { if (y <= prev) break; tax += (Math.min(y, cap) - prev) * rate; prev = cap; }
    return tax;
  }
  function computeTax(s, roundIncome) {
    const Y = D.YEARS_PER_ROUND, yi = roundIncome / Y;
    const base = 60000 + Math.min(yi * 0.5, 100000) + s.kids * 30000 + (s.married ? 0 : 0);
    const lifeY = Math.min(s.round.prem.life / Y, 100000);
    const healthY = Math.min(s.round.prem.health / Y, 25000);
    const annY = Math.min(s.round.prem.annuity / Y, 200000, yi * 0.15);
    const withIns = taxOn(Math.max(0, yi - base - lifeY - healthY - annY)) * Y;
    const without = taxOn(Math.max(0, yi - base)) * Y;
    return { tax: r1000(withIns), saved: r1000(without - withIns) };
  }

  // ---------------------------------------------------------------------------
  // HELPER API passed to events (G)
  // ---------------------------------------------------------------------------
  const G = {
    fmt: n => Math.round(n).toLocaleString('th-TH'),
    cash(s, amt, label) { s.cash += amt; return { label, amount: amt, kind: amt >= 0 ? 'good' : 'bad', cash: true }; },
    shock(s, m) {
      const stockAll = m.stocks || 1;
      D.STOCKS.forEach(st => {
        const k = (m[st.id] || 1) * stockAll;
        s.stocks[st.id].price = Math.max(0.5, +(s.stocks[st.id].price * k).toFixed(2));
      });
      if (m.fund) s.prices.fund = Math.round(s.prices.fund * m.fund);
      if (m.gold) s.prices.gold = Math.round(s.prices.gold * m.gold);
      if (m.crypto) s.prices.crypto = Math.max(100, Math.round(s.prices.crypto * m.crypto));
    }
  };

  // Medical claim engine — the heart of the insurance lesson
  function runClaim(s, c) {
    const lines = [];
    let remaining = c.cost, covered = 0, bonus = 0;
    lines.push({ label: 'ค่ารักษาพยาบาล', amount: -c.cost, kind: 'bad' });
    if (s.ins.health) {
      const pay = Math.min(remaining, INS.health.limit);
      remaining -= pay; covered += pay;
      lines.push({ label: 'ประกันสุขภาพจ่ายแทน', amount: pay, kind: 'shield' });
    }
    if (c.accident && s.ins.pa && remaining > 0) {
      const pay = Math.min(remaining, INS.pa.limit);
      remaining -= pay; covered += pay;
      lines.push({ label: 'ประกันอุบัติเหตุจ่ายค่ารักษา', amount: pay, kind: 'shield' });
    }
    if (c.ci && s.ins.ci) {
      bonus += INS.ci.payout;
      lines.push({ label: 'ประกันโรคร้ายแรงจ่ายเงินก้อน', amount: INS.ci.payout, kind: 'shield' });
      s.ins.ci = false; s.insurable.ci = false;
    }
    if (remaining > 0) lines.push({ label: 'คุณต้องจ่ายเอง', amount: -remaining, kind: 'bad', strong: true });
    else lines.push({ label: 'คุณต้องจ่ายเอง', amount: 0, kind: 'good', strong: true });

    s.cash += bonus - remaining;
    s.stats.claimsPaid += covered + bonus; s.stats.oop += remaining;
    if (covered + bonus > 0) s.stats.claimsCount++;
    s.health -= c.healthHit || 0;

    const notes = [];
    if (c.incomeLoss) {
      s.round.incomeMult *= (1 - c.incomeLoss);
      notes.push(`ต้องหยุดงานรักษาตัว รายได้ช่วงนี้ลดลง ${Math.round(c.incomeLoss * 100)}%`);
    }
    if (c.serious) {
      if (!s.ins.health && s.insurable.health) { s.insurable.health = false; notes.push('มีประวัติป่วยหนักแล้ว บริษัทประกันจะไม่รับทำประกันสุขภาพให้คุณอีก'); }
      if (s.insurable.life) { s.insurable.life = false; notes.push('ไม่สามารถซื้อประกันชีวิตเพิ่มได้แล้ว (กรมธรรม์เดิมยังคุ้มครองตามปกติ)'); }
      if (s.insurable.ci && !c.ci) s.insurable.ci = false;
      if (c.ci && s.insurable.ci) { s.insurable.ci = false; notes.push('ไม่สามารถซื้อประกันโรคร้ายแรงได้อีกแล้ว'); }
    }
    const protectedAll = remaining === 0;
    return {
      lines, notes, covered: covered + bonus > 0,
      fx: covered + bonus > 0 ? 'shield' : 'loss',
      mood: protectedAll ? 'happy' : 'cry',
      text: protectedAll ? 'ประกันดูแลค่ารักษาให้ทั้งหมด เงินเก็บของคุณยังอยู่ครบ'
        : (covered > 0 ? 'ประกันช่วยแบ่งเบาไปได้บางส่วน' : 'ไม่มีประกัน ต้องใช้เงินเก็บจ่ายเองทั้งหมด')
    };
  }

  // ---------------------------------------------------------------------------
  // EVENT DECK
  // ---------------------------------------------------------------------------
  function pickEvent(pool, exclude) {
    const cands = D.EVENTS.filter(e => e.pool === pool && !exclude.has(e.id) && !(e.once && S.seen[e.id]) && (!e.when || e.when(S)));
    if (!cands.length) return null;
    const w = cands.map(e => Math.max(0, e.weight(S)));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < cands.length; i++) { r -= w[i]; if (r <= 0) return cands[i]; }
    return cands[cands.length - 1];
  }
  function drawEvents() {
    const ex = new Set(), list = [];
    const a = pickEvent('life', ex); if (a) { list.push(a); ex.add(a.id); }
    const b = pickEvent('risk', ex); if (b) { list.push(b); ex.add(b.id); }
    if (Math.random() < 0.35) { const c = pickEvent(Math.random() < .5 ? 'life' : 'risk', ex); if (c) list.push(c); }
    // fatal events always resolve last so other events of the round still play
    list.sort((x, y) => (x.fatal ? 1 : 0) - (y.fatal ? 1 : 0));
    return list;
  }

  // ---------------------------------------------------------------------------
  // END OF ROUND SETTLEMENT
  // ---------------------------------------------------------------------------
  function settle(s) {
    const lines = [], notes = [];
    const fromAge = s.age;
    const cashBefore = s.cash;

    // income
    const vol = Math.max(0.3, 1 + s.persona.volatility * randn());
    const inc = r1000(s.income * s.round.incomeMult * vol);
    lines.push(G.cash(s, inc, 'รายได้ช่วงนี้'));
    let rent = 0;
    if (s.property) { rent = r1000(s.property * 0.06); lines.push(G.cash(s, rent, 'ค่าเช่าคอนโด')); }

    // spending
    lines.push(G.cash(s, -s.expense, 'ค่าครองชีพ' + (s.kids ? ` (รวมค่าเลี้ยงลูก ${s.kids} คน)` : '')));
    s.installments.forEach(i => { lines.push(G.cash(s, -i.amount, i.name)); i.left--; });
    s.installments = s.installments.filter(i => i.left > 0);

    // tax
    const tx = computeTax(s, inc + rent);
    if (tx.tax > 0) lines.push(G.cash(s, -tx.tax, 'ภาษีเงินได้'));
    s.stats.taxPaid += tx.tax; s.stats.taxSaved += tx.saved;
    if (tx.saved > 0) notes.push({ t: `ประกันชีวิต/สุขภาพ/บำนาญ ช่วยลดหย่อนภาษีได้ ${fmt(tx.saved)}`, kind: 'good' });

    // loan interest
    if (s.debt > 0) lines.push(G.cash(s, -r1000(s.debt * INV.loan.rate), 'ดอกเบี้ยเงินกู้ 20%'));

    // markets move
    const before = investValue(s);
    s.prevPrices = { ...s.prices };
    s.inv.deposit = Math.round(s.inv.deposit * (1 + INV.deposit.mean));
    ['fund', 'gold', 'crypto'].forEach(k => {
      const m = Math.max(INV[k].floor, 1 + INV[k].mean + INV[k].sd * randn());
      s.prices[k] = Math.max(100, Math.round(s.prices[k] * m));
    });
    D.STOCKS.forEach(st => {
      const h = s.stocks[st.id]; h.prev = h.price;
      const m = Math.max(0.3, 1 + st.mean + st.sd * randn());
      h.price = Math.max(0.5, +(h.price * m).toFixed(2));
    });
    if (s.property) s.property = Math.round(s.property * 1.1);
    const investDelta = investValue(s) - before;

    // body ages
    s.health -= 4 + (fromAge >= 45 ? 3 : 0);
    if (s.married) s.happy += 2;
    normalize(s);

    // history (net worth at end of this stage)
    s.history.push({ age: fromAge + D.YEARS_PER_ROUND, nw: netWorth(s) });

    // short-term insurance expires
    const expired = ['health', 'ci', 'pa'].filter(k => s.ins[k]);
    expired.forEach(k => { s.ins[k] = false; });
    s.expiredNotice = expired.slice();

    // advance stage
    s.stage++; s.age += D.YEARS_PER_ROUND; s.round = freshRound();

    // long-term premiums for the coming stage
    if (s.stage < D.ROUNDS) {
      if (s.ins.life > 0) {
        const p = premium('life', s) * s.ins.life;
        if (s.cash >= p) { lines.push(G.cash(s, -p, `เบี้ยประกันชีวิตต่อเนื่อง (${s.ins.life} หน่วย)`)); s.ins.lifePaid += p; s.round.prem.life += p; s.stats.premiums += p; }
        else { const cv = lifeCashValue(s); s.cash += cv; notes.push({ t: `เงินสดไม่พอจ่ายเบี้ย ประกันชีวิตขาดอายุ ได้เงินคืน ${fmt(cv)}`, kind: 'bad' }); s.ins.life = 0; s.ins.lifePaid = 0; }
      }
      if (s.ins.annuity > 0 && s.age < 60) {
        const p = premium('annuity', s) * s.ins.annuity;
        if (s.cash >= p) { lines.push(G.cash(s, -p, `เบี้ยประกันบำนาญต่อเนื่อง (${s.ins.annuity} หน่วย)`)); s.ins.annuityPaid += p; s.round.prem.annuity += p; s.stats.premiums += p; }
        else notes.push({ t: 'เงินสดไม่พอ หยุดจ่ายเบี้ยบำนาญช่วงนี้ (สิทธิ์เดิมยังอยู่)', kind: 'bad' });
      }
    }

    // emergency loan
    if (s.cash < 0) {
      const need = Math.ceil(-s.cash / INV.loan.unit) * INV.loan.unit;
      s.debt += need; s.cash += need;
      notes.push({ t: `เงินสดติดลบ ระบบกู้ฉุกเฉินให้อัตโนมัติ ${fmt(need)} (ดอกเบี้ย 20%/ช่วง)`, kind: 'bad' });
    }

    if (expired.length) notes.push({ t: `${expired.map(k => INS[k].short).join(' • ')} หมดอายุแล้ว อย่าลืมต่ออายุในแท็บประกัน`, kind: 'warn' });

    if (netWorth(s) < -3000000 || s.debt > 8000000) { s.over = true; s.endReason = 'bankrupt'; }
    else if (s.stage >= D.ROUNDS) { s.over = true; s.endReason = 'retire'; }

    return { fromAge, lines, notes, investDelta, cashDelta: s.cash - cashBefore };
  }

  // ===========================================================================
  // PIXEL SCENE (main game canvas, 180×96 logical)
  // ===========================================================================
  const Scene = {
    canvas: null, ctx: null, W: 180, H: 96, floorY: 80,
    t: 0, mode: 'LIGHT', particles: [], flash: 0, flashCol: C.RED,
    agentT: 0, shieldT: 0, walkT: 0, moodOverride: null, moodT: 0, persona: null,
    init(cv) { this.canvas = cv; this.ctx = cv.getContext('2d'); this.ctx.imageSmoothingEnabled = false; },
    setMode(m) { this.mode = m || 'LIGHT'; },
    mood(m, secs = 2.5) { this.moodOverride = m; this.moodT = secs; },
    coins(n = 16) {
      for (let i = 0; i < n; i++) this.particles.push({ k: 'coin', x: 20 + Math.random() * 140, y: -10 - Math.random() * 40, vx: (Math.random() - .5) * .3, vy: Math.random(), life: 3 + Math.random() });
    },
    loss(n = 10) {
      this.flash = .35; this.flashCol = C.RED;
      for (let i = 0; i < n; i++) this.particles.push({ k: 'bill', x: 70 + Math.random() * 20, y: 50, vx: (Math.random() - .5) * 2.4, vy: -1.5 - Math.random() * 1.5, life: 1.6 });
    },
    hearts(n = 8) { for (let i = 0; i < n; i++) this.particles.push({ k: 'heart', x: 60 + Math.random() * 60, y: 70, vx: (Math.random() - .5) * .4, vy: -.5 - Math.random() * .5, life: 2.2 }); },
    shield() { this.shieldT = 2.6; this.agentT = 4; this.flash = .25; this.flashCol = C.LGREEN; },
    sparks(n = 10) { for (let i = 0; i < n; i++) this.particles.push({ k: 'spark', x: 20 + Math.random() * 140, y: 10 + Math.random() * 60, vx: 0, vy: 0, life: .5 + Math.random() }); },
    fx(kind) {
      if (kind === 'coins') { this.coins(); SFX.coins(4); }
      else if (kind === 'loss') { this.loss(); SFX.bad(); }
      else if (kind === 'shield') { this.shield(); this.sparks(); SFX.shield(); say('ผมดูแลเรื่องเคลมให้เองครับ', 2600); }
      else if (kind === 'hearts') { this.hearts(); SFX.good(); }
      else if (kind === 'jump') { this.mood('jump', 1.6); SFX.good(); }
    },
    update(dt) {
      this.t += dt;
      if (this.moodT > 0) { this.moodT -= dt; if (this.moodT <= 0) this.moodOverride = null; }
      if (this.agentT > 0) this.agentT -= dt;
      if (this.shieldT > 0) this.shieldT -= dt;
      if (this.walkT > 0) this.walkT -= dt;
      if (this.flash > 0) this.flash -= dt;
      for (const p of this.particles) {
        p.life -= dt;
        if (p.k === 'coin') {
          p.vy += 0.12; p.x += p.vx; p.y += p.vy;
          if (p.y > this.floorY - 6) { p.y = this.floorY - 6; p.vy *= -0.45; p.vx *= .8; }
        } else if (p.k === 'bill') { p.vy += 0.06; p.x += p.vx; p.y += p.vy; }
        else { p.x += p.vx; p.y += p.vy; }
      }
      this.particles = this.particles.filter(p => p.life > 0 && p.y < this.H + 10);
    },
    baseMood() {
      if (!S) return 'normal';
      if (S.health < 35) return 'sick';
      if (S.happy >= 70) return 'happy';
      return 'normal';
    },
    draw() {
      PX.use(this.ctx);
      const t = this.t, fy = this.floorY;
      PX.drawBackground(this.mode, t, fy);
      PX.drawFloor(fy, this.mode);
      if (!S) return;

      if (S.property) PX.drawHouse(150, fy, .55);
      if (S.flags.car) PX.drawCar(34, fy + 1);

      const walking = this.walkT > 0;
      const mood = this.moodOverride || this.baseMood();
      const selfCast = PX.CAST[S.persona.cast];
      let x = 76;
      // family
      if (S.married) {
        const sp = S.persona.id === 'parent' ? PX.CAST.spouseM : PX.CAST.spouseF;
        PX.drawChibi(x + 18, fy + 2, { ...sp, time: t, mood: mood === 'sick' ? 'normal' : mood, walk: walking ? t * 10 + 1 : 0, facing: -1 });
      }
      for (let k = 0; k < S.kids; k++) {
        PX.drawChibi(x - 18 - k * 15, fy + 2, { ...PX.CAST.kid, seed: 8 + k, shirt: k ? C.SPINK : C.YELLOW, time: t, mood: mood === 'cry' ? 'cry' : (mood === 'jump' ? 'jump' : 'happy'), walk: walking ? t * 10 + k : 0 });
      }
      PX.drawChibi(x, fy + 2, { ...selfCast, time: t, mood, walk: walking ? t * 10 : 0, facing: 1 });

      if (this.shieldT > 0) {
        const pulse = Math.sin(t * 12) > 0 ? 1 : 0;
        PX.drawShield(x, fy - 48 - pulse, 1, C.LGREEN);
        if (Math.floor(t * 8) % 2 === 0) { PX.rect(x - 16, fy - 36, 1, 30, C.LGREEN); PX.rect(x + 16, fy - 36, 1, 30, C.LGREEN); }
      }
      if (this.agentT > 0) {
        const slide = clamp((4 - this.agentT) / .5, 0, 1), out = clamp(this.agentT / .5, 0, 1);
        const ax = Math.round(200 - 64 * Math.min(slide, out));
        PX.drawChibi(ax, fy + 2, { ...PX.CAST.agent, time: t, mood: 'happy', facing: -1, walk: slide < 1 || out < 1 ? t * 10 : 0 });
      }
      for (const p of this.particles) {
        if (p.k === 'coin') PX.drawCoin(p.x, p.y, t + p.x);
        else if (p.k === 'bill') PX.drawBill(p.x, p.y);
        else if (p.k === 'heart') PX.drawHeart(p.x, p.y);
        else if (p.k === 'spark') PX.drawSparkle(Math.round(p.x), Math.round(p.y), Math.floor(p.life * 6) % 2 ? C.YELLOW : C.WHITE);
      }
      if (this.flash > 0 && Math.floor(this.flash * 20) % 2 === 0) {
        this.ctx.globalAlpha = .35; PX.rect(0, 0, this.W, this.H, this.flashCol); this.ctx.globalAlpha = 1;
      }
    }
  };

  // ---- small animated portraits (character cards / event cards) ----
  const portraits = new Set();
  function makePortrait(cv, drawFn) {
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const p = { cv, ctx, drawFn }; portraits.add(p); return p;
  }
  function portraitDraw(p, t) {
    PX.use(p.ctx); p.drawFn(t, p.cv.width, p.cv.height);
  }
  function castFor(who) {
    if (who === 'self') return PX.CAST[S.persona.cast];
    if (who === 'spouse') return S.persona.id === 'parent' ? PX.CAST.spouseM : PX.CAST.spouseF;
    return PX.CAST[who] || PX.CAST.friend;
  }
  function eventPortraitFn(ev, state) {
    return (t, w, h) => {
      const mode = state.scene || ev.scene || 'LIGHT';
      const bg = { LIGHT: C.SPINK, DARK: C.BLACK, RED: C.RED, HOSPITAL: '#d9f2ec', GOLD: C.YELLOW }[mode] || C.SPINK;
      PX.rect(0, 0, w, h, bg);
      PX.dither(h - 16, 4, bg, C.WHITE, .25);
      PX.rect(0, h - 12, w, 12, mode === 'DARK' ? '#1d2429' : C.LGREY); PX.rect(0, h - 12, w, 1, C.BLACK);
      const mood = state.mood || ev.mood || 'normal';
      const self = PX.CAST[S.persona.cast];
      if (ev.who === 'doctor') {
        PX.drawBed(w / 2 - 12, h - 9);
        PX.drawChibi(w / 2 - 14, h - 12, { ...self, time: t, mood: state.mood || 'sick' });
        PX.drawChibi(w / 2 + 18, h - 10, { ...PX.CAST.doctor, time: t, mood: 'normal', facing: -1 });
        if (state.covered) PX.drawShield(w / 2 - 14, 12, 1);
      } else if (ev.who === 'self') {
        PX.drawChibi(w / 2, h - 10, { ...self, time: t, mood });
        if (state.fx === 'coins') for (let i = 0; i < 4; i++) PX.drawCoin(8 + i * 14, 8 + ((t * 40 + i * 13) % 30), t + i);
      } else {
        PX.drawChibi(w / 2 - 14, h - 10, { ...self, time: t, mood: state.mood || 'normal' });
        PX.drawChibi(w / 2 + 14, h - 10, { ...castFor(ev.who), time: t, mood: ev.mood || 'normal', facing: -1 });
        if (ev.who === 'spouse' || ev.who === 'kid') PX.drawHeart(w / 2 - 3, 6 + Math.round(Math.sin(t * 4)));
      }
    };
  }

  // ---- master animation loop ----
  let lastTs = 0;
  function loop(ts) {
    const dt = Math.min(.05, (ts - lastTs) / 1000 || 0); lastTs = ts;
    if ($('#screen-game').classList.contains('active') || $('#screen-end').classList.contains('active')) {
      Scene.update(dt); Scene.draw();
    }
    const t = ts / 1000;
    for (const p of portraits) { if (!p.cv.isConnected) { portraits.delete(p); continue; } portraitDraw(p, t); }
    requestAnimationFrame(loop);
  }

  // ---- floating texts + speech bubble over scene ----
  function floatText(text, kind = 'good') {
    const layer = $('#floatLayer'); if (!layer) return;
    const el = document.createElement('div');
    el.className = 'float ' + kind; el.textContent = text;
    el.style.left = (20 + Math.random() * 50) + '%';
    el.style.top = (25 + Math.random() * 25) + '%';
    layer.appendChild(el); setTimeout(() => el.remove(), 1600);
  }
  function say(text, ms = 2200) {
    const layer = $('#floatLayer'); if (!layer) return;
    layer.querySelectorAll('.bubble').forEach(b => b.remove());
    const el = document.createElement('div'); el.className = 'bubble'; el.textContent = text;
    layer.appendChild(el); setTimeout(() => el.remove(), ms);
  }
  function toast(text, kind = '') {
    const el = $('#toast'); el.textContent = text; el.className = 'show ' + kind;
    clearTimeout(toast._t); toast._t = setTimeout(() => { el.className = ''; }, 2200);
  }

  // ===========================================================================
  // SCREENS
  // ===========================================================================
  function show(id) {
    $$('.screen').forEach(s => { s.classList.toggle('active', s.id === id); s.scrollTop = 0; });
    document.documentElement.dataset.screen = id;
    $('#homeBtn').hidden = id === 'screen-title';
  }

  // ---- title ----
  function initTitle() {
    const cv = $('#titleCanvas');
    makePortrait(cv, (t, w, h) => {
      PX.drawBackground('LIGHT', t, h - 16); PX.drawFloor(h - 16, 'LIGHT');
      const order = ['office', 'owner', 'freelance', 'parent'];
      order.forEach((k, i) => {
        const x = ((t * 14 + i * 40) % (w + 40)) - 20;
        PX.drawChibi(x, h - 14, { ...PX.CAST[k], time: t, walk: t * 9 + i, mood: 'happy' });
      });
      PX.drawChibi(w - 24, h - 14, { ...PX.CAST.agent, time: t, mood: 'happy', facing: -1 });
      const c = Math.floor(t * 2) % 2;
      PX.drawCoin(w / 2 - 3, 10 + c, t);
    });
  }

  // ---- character select ----
  function initSelect() {
    const list = $('#personaList'); list.innerHTML = '';
    const colors = { office: 'c-purple', owner: 'c-red', freelance: 'c-green', parent: 'c-pink' };
    D.PERSONAS.forEach(p => {
      const card = document.createElement('div');
      card.className = 'persona px-box ' + colors[p.id];
      const bars = (label, v) => `<div class="stat"><span>${label}</span><i>${'<b class="on"></b>'.repeat(v)}${'<b></b>'.repeat(5 - v)}</i></div>`;
      card.innerHTML = `
        <canvas width="64" height="56" class="portrait"></canvas>
        <div class="persona-body">
          <div class="persona-tag">${esc(p.tag)}</div>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          ${bars('รายได้', p.stats.income)}${bars('ความมั่นคง', p.stats.stable)}${bars('สุขภาพ', p.stats.health)}
          <div class="persona-nums"><span>เงินเริ่มต้น <b>${fmtShort(p.cash)}</b></span><span>รายได้/ช่วง <b>${fmtShort(p.income)}</b></span></div>
        </div>`;
      makePortrait(card.querySelector('canvas'), (t, w, h) => {
        PX.rect(0, 0, w, h, C.SPINK); PX.dither(0, 10, C.SPINK, C.WHITE, .5);
        PX.rect(0, h - 10, w, 10, C.LGREY); PX.rect(0, h - 10, w, 1, C.BLACK);
        if (p.married) {
          PX.drawChibi(w / 2 - 12, h - 8, { ...PX.CAST[p.cast], time: t, mood: 'happy' });
          PX.drawChibi(w / 2 + 14, h - 8, { ...PX.CAST.kid, time: t, mood: 'happy', facing: -1 });
        } else PX.drawChibi(w / 2, h - 8, { ...PX.CAST[p.cast], time: t, mood: 'happy' });
      });
      card.addEventListener('click', () => { SFX.click(); confirmPersona(p); });
      list.appendChild(card);
    });
  }
  async function confirmPersona(p) {
    const ok = await dialog({
      head: 'ยืนยันตัวละคร', headCls: 'h-black',
      body: `<p class="center">คุณต้องการใช้ชีวิตเป็น <b>${esc(p.name)}</b> ใช่หรือไม่</p>`,
      buttons: [{ label: 'ไม่', cls: 'btn-grey', value: false }, { label: 'ใช่ เริ่มเลย', cls: 'btn-green', value: true }]
    });
    if (ok) startGame(p);
  }

  function startGame(p) {
    S = newState(p); tab = 'overview';
    Scene.setMode('LIGHT'); Scene.particles = []; Scene.walkT = 1.2;
    show('screen-game'); renderGame();
    setTimeout(() => say(`สวัสดีครับ ผม${CONFIG.AGENT_NAME} ลองวางแผนการเงินก่อนกดใช้ชีวิตต่อนะครับ`, 3800), 400);
    Scene.agentT = 4;
  }

  // ===========================================================================
  // GAME UI RENDER
  // ===========================================================================
  function renderGame() {
    if (!S) return;
    const nw = netWorth(S);
    $('#hudStage').textContent = `ช่วงที่ ${Math.min(S.stage + 1, D.ROUNDS)}/${D.ROUNDS}`;
    $('#hudAge').textContent = `อายุ ${ageLabel(S.age)}`;
    $('#hudHealth').innerHTML = meter(S.health, 'h');
    $('#hudHappy').innerHTML = meter(S.happy, 'j');
    $('#mCash').textContent = fmtShort(S.cash);
    $('#mNet').textContent = fmtShort(nw);
    $('#mDebt').textContent = fmtShort(S.debt + installmentDebt(S));
    $('#mDebt').parentElement.classList.toggle('alert', S.debt > 0);
    $('#progressFill').style.width = (S.stage / D.ROUNDS * 100) + '%';
    const needIns = !S.ins.health && S.insurable.health;
    $$('.tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
      if (b.dataset.tab === 'insurance') b.classList.toggle('dot', needIns);
    });
    const panel = $('#panel');
    const scroll = panel.scrollTop;
    panel.innerHTML = tab === 'overview' ? panelOverview() : tab === 'insurance' ? panelInsurance() : tab === 'invest' ? panelInvest() : panelStocks();
    panel.scrollTop = scroll;
    $('#btnGo').innerHTML = (S.stage === D.ROUNDS - 1 ? 'ใช้ชีวิตช่วงสุดท้าย ' : 'ใช้ชีวิตต่อ ') + I('play');
  }
  function meter(v, kind) {
    const n = Math.round(v / 20);
    return `<span class="meter ${kind}">${'<b class="on"></b>'.repeat(n)}${'<b></b>'.repeat(5 - n)}</span>`;
  }

  function sectionHead(title, cls) { return `<div class="sec-head ${cls}">${title}</div>`; }
  // premiums are per stage (= 5 years); show the per-year equivalent so players don't read them as yearly
  const perYr = n => `<small class="yr">(${fmt(n / D.YEARS_PER_ROUND)}/ปี)</small>`;
  function kv(label, value, cls = '') { return `<div class="kv ${cls}"><span>${label}</span><b>${value}</b></div>`; }

  function agentTip() {
    const s = S, tips = [];
    if (!s.ins.health && s.insurable.health) tips.push('ยังไม่มีประกันสุขภาพนะครับ ค่ารักษาครั้งเดียวอาจกินเงินเก็บหลายปี');
    if (!s.insurable.health && !s.ins.health) tips.push('ตอนนี้ทำประกันสุขภาพไม่ได้แล้ว ต้องใช้เงินสำรองดูแลตัวเองครับ');
    if ((s.married || s.kids) && s.ins.life === 0 && s.insurable.life) tips.push('ตอนนี้มีคนที่รักพึ่งพาคุณแล้ว ลองดูประกันชีวิตไว้ปกป้องเขานะครับ');
    if (s.cash < s.expense * 0.3) tips.push('เงินสดสำรองน้อยไปหน่อย ถ้ามีเหตุฉุกเฉินอาจต้องกู้ดอกเบี้ยสูงครับ');
    if (s.debt > 0) tips.push('มีหนี้ดอกเบี้ย 20% อยู่ ปิดหนี้ก่อนลงทุนจะคุ้มกว่าครับ');
    if (s.age >= 35 && !s.ins.ci && s.insurable.ci) tips.push('อายุ 35+ ความเสี่ยงโรคร้ายแรงเริ่มสูงขึ้น ประกันโรคร้ายแรงช่วยทดแทนรายได้ครับ');
    if (s.ins.annuity === 0 && s.age < 60 && s.age >= 30) tips.push('อย่าลืมเตรียมเงินเกษียณ ประกันบำนาญช่วยทั้งเกษียณและลดหย่อนภาษีครับ');
    if (!tips.length) tips.push('แผนดูดีมากครับ ลองกระจายการลงทุนเพิ่มเพื่อให้เงินทำงานแทนคุณ');
    return tips[s.stage % tips.length];
  }

  function panelOverview() {
    const s = S;
    const instal = s.installments.reduce((a, i) => a + i.amount, 0);
    const lt = (s.ins.life ? premium('life', s) * s.ins.life : 0) + (s.ins.annuity && s.age < 60 ? premium('annuity', s) * s.ins.annuity : 0);
    const est = s.income - s.expense - instal - (s.debt * INV.loan.rate);
    return `
      <div class="agent-tip px-box"><canvas width="32" height="36" class="tip-face" data-agent></canvas><p><b>${CONFIG.AGENT_NAME}:</b> ${esc(agentTip())}</p></div>
      <div class="card">
        ${sectionHead('ภาพรวม', 'h-orange')}
        <div class="grid2">
          ${kv('รายได้ต่อช่วง', fmt(s.income))}
          ${kv('ค่าครองชีพต่อช่วง', fmt(s.expense))}
          ${kv('ค่างวด/ดอกเบี้ย', fmt(instal + s.debt * INV.loan.rate))}
          ${kv('เบี้ยระยะยาว/ช่วง', lt ? fmt(lt) + ' ' + perYr(lt) : fmt(lt))}
          ${kv('คาดว่าเหลือ (ก่อนภาษี)', fmt(est), est < 0 ? 'neg' : '')}
          ${kv('มูลค่าทรัพย์สินสุทธิ', fmt(netWorth(s)))}
        </div>
        <div class="cash-big"><span>${I('cash')} เงินสด</span><b>${fmt(s.cash)}</b></div>
      </div>
      <div class="card">
        ${sectionHead('ชีวิตและครอบครัว', 'h-pink')}
        <div class="grid2">
          ${kv('สถานะ', s.married ? 'แต่งงานแล้ว' : 'โสด')}
          ${kv('ลูก', s.kids ? s.kids + ' คน' : '—')}
          ${kv('สุขภาพ', s.health + '/100', s.health < 40 ? 'neg' : '')}
          ${kv('ความสุข', s.happy + '/100', s.happy < 40 ? 'neg' : '')}
          ${kv('คอนโด', s.property ? fmt(s.property) : '—')}
          ${kv('ภาษีที่ประหยัดได้รวม', fmt(s.stats.taxSaved))}
        </div>
      </div>
      <div class="card">
        ${sectionHead('กิจกรรมช่วงนี้ (เลือกได้อย่างละครั้ง)', 'h-black')}
        <div class="act-row">
          <div><b>ตรวจสุขภาพ + ออกกำลังกาย</b><small>สุขภาพ +12 • ลดโอกาสเจ็บป่วย</small></div>
          <button class="btn btn-green sm" data-act="gym" ${s.round.gym ? 'disabled' : ''}>${s.round.gym ? 'ทำแล้ว' : fmt(60000)}</button>
        </div>
        <div class="act-row">
          <div><b>พักผ่อนกับครอบครัว</b><small>ความสุข +10</small></div>
          <button class="btn btn-green sm" data-act="rest" ${s.round.rest ? 'disabled' : ''}>${s.round.rest ? 'ทำแล้ว' : fmt(100000)}</button>
        </div>
      </div>`;
  }

  function insCard(k) {
    const s = S, p = INS[k], prem = premium(k, s);
    let status = '', btns = '';
    if (k === 'life' || k === 'annuity') {
      const units = s.ins[k];
      const canBuy = k === 'life' ? s.insurable.life && units < p.maxUnits : s.age < 60 && units < p.maxUnits;
      status = units ? `<span class="badge on">ถืออยู่ ${units} หน่วย</span>` : '<span class="badge">ยังไม่มี</span>';
      if (k === 'life' && !s.insurable.life) status += ' <span class="badge off">ซื้อเพิ่มไม่ได้</span>';
      if (k === 'annuity' && s.age >= 60) status += ' <span class="badge off">ปิดรับ (อายุ 60+)</span>';
      const extra = k === 'life'
        ? kv('ทุนประกันรวม', fmt(units * p.sum)) + kv('มูลค่าเงินสด', fmt(lifeCashValue(s)))
        : kv('เบี้ยที่จ่ายแล้ว', fmt(s.ins.annuityPaid)) + kv('บำนาญคาดว่าจะได้', fmt(s.ins.annuityPaid * p.payoutRate));
      btns = `<div class="btn-row">
        ${units ? `<button class="btn btn-grey sm" data-ins-sell="${k}">${k === 'life' ? 'เวนคืน 1 หน่วย' : 'หยุดเพิ่ม'}</button>` : ''}
        <button class="btn btn-red sm" data-ins-buy="${k}" ${canBuy ? '' : 'disabled'}>ซื้อ 1 หน่วย ${fmt(prem)}${perYr(prem)}</button></div>`;
      if (k === 'annuity' && units) btns = btns.replace(`<button class="btn btn-grey sm" data-ins-sell="annuity">หยุดเพิ่ม</button>`, '');
      return `<div class="prod">
        <div class="prod-title">${I(p.icon)} ${p.name}</div>
        <p class="prod-desc">${p.desc}</p>
        <div class="prod-status">${status}</div>
        <div class="grid2">${kv('เบี้ย/หน่วย/ช่วง (อายุนี้)', fmt(prem) + ' ' + perYr(prem))}${extra}</div>
        ${btns}</div>`;
    }
    const active = s.ins[k];
    const blocked = (k === 'health' && !s.insurable.health) || (k === 'ci' && !s.insurable.ci);
    const wasExpired = s.expiredNotice.includes(k) && !active;
    status = active ? '<span class="badge on">คุ้มครองอยู่ช่วงนี้</span>'
      : blocked ? '<span class="badge off">บริษัทปฏิเสธการรับประกัน</span>'
        : wasExpired ? '<span class="badge warn">หมดอายุแล้ว — ต่ออายุ</span>' : '<span class="badge">ยังไม่มี</span>';
    btns = `<div class="btn-row"><button class="btn btn-red sm" data-ins-buy="${k}" ${active || blocked ? 'disabled' : ''}>${active ? 'คุ้มครองแล้ว' : (wasExpired ? 'ต่ออายุ ' : 'ซื้อ ') + fmt(prem) + perYr(prem)}</button></div>`;
    return `<div class="prod ${active ? 'is-on' : ''}">
      <div class="prod-title">${I(p.icon)} ${p.name}</div>
      <p class="prod-desc">${p.desc}</p>
      <div class="prod-status">${status}</div>
      <div class="grid2">${kv('เบี้ยช่วงนี้ (อายุ ' + s.age + ')', fmt(prem) + ' ' + perYr(prem))}${kv(k === 'health' ? 'วงเงินค่ารักษา' : 'ผลประโยชน์', fmt(k === 'health' ? p.limit : p.payout))}</div>
      ${btns}</div>`;
  }
  function panelInsurance() {
    return `
      <div class="card">
        ${sectionHead('ประกันระยะสั้น (คุ้มครอง 1 ช่วง ต้องต่ออายุ)', 'h-black')}
        ${insCard('health')}${insCard('ci')}${insCard('pa')}
      </div>
      <div class="card">
        ${sectionHead('ประกันระยะยาว (หักเบี้ยอัตโนมัติทุกช่วง)', 'h-black')}
        ${insCard('life')}${insCard('annuity')}
      </div>
      <p class="fineprint">* 1 ช่วง = 5 ปี เบี้ยที่แสดงเป็นยอดรวมทั้งช่วง (ในวงเล็บคือเฉลี่ยต่อปี)<br>* ตัวเลขในเกมเป็นการจำลองเพื่อการเรียนรู้ ไม่ใช่เบี้ยหรือผลประโยชน์จริงของแบบประกันใด ๆ</p>`;
  }

  function changeTag(cur, prev) {
    if (!prev) return '';
    const pct = Math.round((cur / prev - 1) * 100);
    if (!pct) return '<span class="chg">0%</span>';
    return `<span class="chg ${pct > 0 ? 'up' : 'down'}">${I(pct > 0 ? 'up' : 'down', { px: 1 })} ${Math.abs(pct)}%</span>`;
  }
  function assetCard(k) {
    const s = S, p = INV[k], price = s.prices[k], units = s.inv[k];
    const val = units * price, cost = s.invCost[k];
    const pl = cost ? Math.round((val / cost - 1) * 100) : 0;
    const q = qty[k] || 1;
    return `<div class="prod">
      <div class="prod-title">${p.name}</div>
      <p class="prod-desc">${p.desc}</p>
      <div class="grid2">
        ${kv('ราคา/หน่วย', fmt(price) + ' ' + changeTag(price, s.prevPrices && s.prevPrices[k]))}
        ${kv('จำนวนที่ถือ', units + ' หน่วย')}
        ${kv('ต้นทุน', fmt(cost))}
        ${kv('มูลค่าที่ถือ', fmt(val))}
        ${kv('กำไร', (pl > 0 ? '+' : '') + pl + '%', pl < 0 ? 'neg' : pl > 0 ? 'pos' : '')}
      </div>
      <div class="trade"><button class="btn btn-red sm" data-sell="${k}">ขาย</button><input type="number" min="1" value="${q}" data-qty="${k}"><button class="btn btn-green sm" data-buy="${k}">ซื้อ</button></div>
    </div>`;
  }
  function panelInvest() {
    const s = S;
    return `
      <div class="card">
        ${sectionHead('ผลิตภัณฑ์การลงทุน', 'h-red')}
        <div class="prod">
          <div class="prod-title">${INV.deposit.name}</div>
          <p class="prod-desc">${INV.deposit.desc} • หน่วยละ ${fmt(INV.deposit.unit)}</p>
          <div class="grid2">${kv('ยอดเงินฝาก', fmt(s.inv.deposit))}${kv('ผลตอบแทน/ช่วง', '+8%')}</div>
          <div class="btn-row"><button class="btn btn-grey sm" data-dep="-1" ${s.inv.deposit <= 0 ? 'disabled' : ''}>ถอน ${fmt(INV.deposit.unit)}</button><button class="btn btn-green sm" data-dep="1">ฝาก ${fmt(INV.deposit.unit)}</button></div>
        </div>
        ${assetCard('fund')}${assetCard('gold')}${assetCard('crypto')}
      </div>
      <div class="card">
        ${sectionHead('สินเชื่อ', 'h-black')}
        <div class="prod">
          <div class="prod-title">${INV.loan.name}</div>
          <p class="prod-desc">${INV.loan.desc}</p>
          <div class="grid2">${kv('หนี้คงค้าง', fmt(s.debt), s.debt ? 'neg' : '')}${kv('ดอกเบี้ยต่อช่วง', fmt(s.debt * INV.loan.rate))}</div>
          <div class="btn-row"><button class="btn btn-grey sm" data-loan="-1" ${s.debt <= 0 ? 'disabled' : ''}>ชำระ ${fmt(INV.loan.unit)}</button><button class="btn btn-red sm" data-loan="1">กู้ ${fmt(INV.loan.unit)}</button></div>
        </div>
      </div>`;
  }
  function panelStocks() {
    const s = S;
    return `<div class="card">
      ${sectionHead('ตลาดหุ้น', 'h-orange')}
      <p class="fineprint">ราคาต่อหุ้น • ซื้อขายทีละหลายหุ้นได้ ใส่จำนวนแล้วกดซื้อหรือขาย</p>
      ${D.STOCKS.map(st => {
        const h = s.stocks[st.id], val = h.qty * h.price, pl = h.cost ? Math.round((val / h.cost - 1) * 100) : 0, q = qty[st.id] || 100;
        return `<div class="prod">
          <div class="prod-title">ชื่อผลิตภัณฑ์: ${st.name}</div>
          <div class="grid2">
            ${kv('ต้นทุน', fmt(h.cost))}
            ${kv('มูลค่าที่ถือ', fmt(val))}
            ${kv('กำไร', (pl > 0 ? '+' : '') + pl + '%', pl < 0 ? 'neg' : pl > 0 ? 'pos' : '')}
            ${kv('ราคา', '฿' + h.price.toLocaleString('th-TH', { maximumFractionDigits: 2 }) + ' ' + changeTag(h.price, h.prev))}
          </div>
          ${kv('จำนวนที่ถือครอง', h.qty.toLocaleString('th-TH') + ' หุ้น')}
          <div class="trade"><button class="btn btn-red sm" data-ssell="${st.id}">ขาย</button><input type="number" min="1" value="${q}" data-qty="${st.id}"><button class="btn btn-green sm" data-sbuy="${st.id}">ซื้อ</button></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  // ---- panel actions ----
  function spend(amount, label) {
    if (S.cash < amount) { toast('เงินสดไม่พอ', 'bad'); SFX.bad(); return false; }
    S.cash -= amount; floatText('−' + fmtShort(amount).replace('฿', '฿'), 'bad'); SFX.pay();
    return true;
  }
  function gain(amount) { S.cash += amount; floatText('+' + fmtShort(amount), 'good'); SFX.coin(); }

  function onPanelClick(e) {
    const b = e.target.closest('button'); if (!b || b.disabled || busy) return;
    const d = b.dataset;
    if (d.act === 'gym') { if (spend(60000)) { S.round.gym = true; S.health += 12; normalize(S); Scene.mood('jump', 1.2); } }
    else if (d.act === 'rest') { if (spend(100000)) { S.round.rest = true; S.happy += 10; normalize(S); Scene.hearts(6); } }
    else if (d.insBuy) {
      const k = d.insBuy, p = premium(k, S);
      if (spend(p)) {
        if (k === 'life') { S.ins.life++; S.ins.lifePaid += p; S.round.prem.life += p; }
        else if (k === 'annuity') { S.ins.annuity++; S.ins.annuityPaid += p; S.round.prem.annuity += p; }
        else { S.ins[k] = true; if (k !== 'pa') S.round.prem.health += p; S.expiredNotice = S.expiredNotice.filter(x => x !== k); }
        S.stats.premiums += p;
        Scene.shieldT = 1.2; SFX.shield();
        say(k === 'health' ? 'เรียบร้อยครับ ป่วยเมื่อไรผมดูแลเคลมให้' : 'คุ้มครองเรียบร้อยครับ', 1800); Scene.agentT = 2.5;
      }
    }
    else if (d.insSell === 'life') {
      const per = S.ins.lifePaid / S.ins.life, refund = Math.round(per * INS.life.cashValueRate);
      S.ins.life--; S.ins.lifePaid -= per; gain(refund); toast(`เวนคืนได้ ${fmt(refund)} (ได้คืนน้อยกว่าที่จ่าย)`);
    }
    else if (d.dep) {
      const u = INV.deposit.unit;
      if (d.dep === '1') { if (spend(u)) S.inv.deposit += u; }
      else { const w = Math.min(u, S.inv.deposit); S.inv.deposit -= w; gain(w); }
    }
    else if (d.loan) {
      const u = INV.loan.unit;
      if (d.loan === '1') { S.debt += u; gain(u); toast('กู้แล้ว ดอกเบี้ย 20% ต่อช่วง', 'bad'); }
      else { const pay = Math.min(u, S.debt); if (spend(pay)) S.debt -= pay; }
    }
    else if (d.buy || d.sell) {
      const k = d.buy || d.sell, n = Math.max(1, Math.floor(qty[k] || 1)), price = S.prices[k];
      if (d.buy) { if (spend(price * n)) { S.inv[k] += n; S.invCost[k] += price * n; } }
      else {
        const m = Math.min(n, S.inv[k]); if (!m) { toast('ไม่มีหน่วยให้ขาย'); return; }
        S.invCost[k] -= S.invCost[k] * (m / S.inv[k]); S.inv[k] -= m; gain(price * m);
      }
    }
    else if (d.sbuy || d.ssell) {
      const id = d.sbuy || d.ssell, h = S.stocks[id], n = Math.max(1, Math.floor(qty[id] || 100));
      if (d.sbuy) { const cost = Math.round(h.price * n); if (spend(cost)) { h.qty += n; h.cost += cost; } }
      else {
        const m = Math.min(n, h.qty); if (!m) { toast('ไม่มีหุ้นให้ขาย'); return; }
        h.cost -= h.cost * (m / h.qty); h.qty -= m; gain(Math.round(h.price * m));
      }
    }
    else return;
    renderGame();
  }
  function onPanelInput(e) {
    const k = e.target.dataset.qty; if (!k) return;
    qty[k] = Math.max(1, parseInt(e.target.value, 10) || 1);
  }

  // ===========================================================================
  // DIALOG SYSTEM (bottom-sheet modal, promise based)
  // ===========================================================================
  function dialog({ head = 'ประกาศ', headCls = 'h-black', body = '', buttons = [], portrait = null, cls = '', onMount = null }) {
    return new Promise(resolve => {
      const root = $('#modalRoot');
      const wrap = document.createElement('div');
      wrap.className = 'modal ' + cls;
      wrap.innerHTML = `<div class="sheet px-box">
          <div class="sheet-head ${headCls}">${head}</div>
          ${portrait ? '<canvas class="ev-portrait" width="96" height="64"></canvas>' : ''}
          <div class="sheet-body">${body}</div>
          <div class="sheet-btns">${buttons.map((b, i) => `<button class="btn ${b.cls || 'btn-red'}" data-i="${i}" ${b.disabled ? 'disabled' : ''}>${b.label}</button>`).join('')}</div>
        </div>`;
      root.appendChild(wrap);
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => wrap.classList.add('in'));
      SFX.pop();
      const api = {
        el: wrap,
        close(v) {
          wrap.classList.remove('in');
          setTimeout(() => { wrap.remove(); if (!$('#modalRoot').children.length) document.body.classList.remove('modal-open'); }, 220);
          resolve(v);
        },
        setButtons(btns) {
          const box = wrap.querySelector('.sheet-btns');
          box.innerHTML = btns.map((b, i) => `<button class="btn ${b.cls || 'btn-red'}" data-i="${i}" ${b.disabled ? 'disabled' : ''}>${b.label}</button>`).join('');
          buttons = btns;
        }
      };
      if (portrait) makePortrait(wrap.querySelector('.ev-portrait'), portrait);
      wrap.querySelector('.sheet-btns').addEventListener('click', async e => {
        const btn = e.target.closest('button'); if (!btn || btn.disabled) return;
        SFX.click();
        const b = buttons[+btn.dataset.i];
        if (b.onClick) { await b.onClick(api); return; }
        api.close(b.value);
      });
      if (onMount) onMount(api);
    });
  }

  // ---- dice widget ----
  function diceHTML() { return '<div class="dice-wrap"><canvas class="dice" width="34" height="34"></canvas></div>'; }
  function drawDiceFace(cv, v) { const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; PX.use(c); c.clearRect(0, 0, 34, 34); PX.drawDice(v, 1, 1, 30); }
  async function animateDice(cv) {
    const final = rollDie();
    cv.parentElement.classList.add('rolling'); SFX.dice();
    for (let i = 0; i < 12; i++) { drawDiceFace(cv, 1 + Math.floor(Math.random() * 6)); await sleep(60 + i * 6); }
    drawDiceFace(cv, final); cv.parentElement.classList.remove('rolling'); cv.parentElement.classList.add('landed');
    SFX.diceLand(); await sleep(350);
    return final;
  }

  function resultHTML(res) {
    let h = '';
    if (res.lines && res.lines.length) {
      h += '<div class="bill">' + res.lines.map(l => {
        if (l.kind === 'note') return `<div class="bill-row note"><span>${esc(l.label)}</span></div>`;
        if (l.kind === 'pct') return `<div class="bill-row bad"><span>${esc(l.label)}</span><b>${l.amount}%</b></div>`;
        if (l.kind === 'info') return `<div class="bill-row info"><span>${esc(l.label)}</span><b>${fmt(l.amount)}</b></div>`;
        return `<div class="bill-row ${l.kind} ${l.strong ? 'strong' : ''}"><span>${l.kind === 'shield' ? I('shield') + ' ' : ''}${esc(l.label)}</span><b>${fmtSigned(l.amount)}</b></div>`;
      }).join('') + '</div>';
    }
    if (res.notes && res.notes.length) h += res.notes.map(n => `<p class="note-warn">${I('warn')} ${esc(n)}</p>`).join('');
    if (res.text) h += `<p class="res-text">${esc(res.text)}</p>`;
    return h;
  }
  function applyResultFX(res) {
    if (res.scene) Scene.setMode(res.scene);
    if (res.mood) Scene.mood(res.mood, 3);
    if (res.fx) Scene.fx(res.fx);
    (res.lines || []).forEach((l, i) => {
      if (l.cash && l.amount) setTimeout(() => floatText(fmtSigned(l.amount).replace('฿', '฿'), l.amount > 0 ? 'good' : 'bad'), i * 180);
    });
    normalize(S); renderGame();
  }

  // ---- play one event ----
  async function playEvent(ev) {
    S.seen[ev.id] = true;
    const title = typeof ev.title === 'function' ? ev.title(S) : ev.title;
    const pState = { mood: null, scene: ev.scene, covered: false, fx: null };
    Scene.setMode(ev.scene === 'GOLD' ? 'GOLD' : ev.scene);
    const headMap = { claim: ['เหตุการณ์สุขภาพ', 'h-red'], choice: ['เหตุการณ์ทางเลือก', 'h-orange'], dice: ['ทอยลูกเต๋า', 'h-purple'], simple: ['ประกาศ', 'h-black'] };
    let [head, headCls] = headMap[ev.type] || headMap.simple;
    if (ev.pool === 'risk' && ev.type !== 'claim') { head = 'ข่าวเศรษฐกิจ'; headCls = 'h-black'; }
    if (ev.fatal) { head = 'เหตุไม่คาดฝัน'; headCls = 'h-black'; SFX.sad(); }
    if (ev.type === 'claim') SFX.bad();

    const intro = `<h3 class="ev-title">${esc(title)}</h3><p class="ev-text">${esc(ev.text(S))}</p>`;
    const portrait = eventPortraitFn(ev, pState);

    if (ev.type === 'simple') {
      const res = ev.run(S, G);
      await dialog({
        head, headCls, portrait, body: intro + `<div class="res">${resultHTML(res)}</div>`,
        buttons: [{ label: ev.fatal ? 'ไปต่อ' : 'ตกลง', cls: 'btn-green' }],
        onMount: () => { pState.mood = res.mood; pState.fx = res.fx; applyResultFX(res); }
      });
      return;
    }

    if (ev.type === 'claim') {
      const res = runClaim(S, ev.claim);
      pState.covered = res.covered;
      await dialog({
        head, headCls, portrait,
        body: intro + `<div class="res">${resultHTML(res)}</div>`,
        buttons: [{ label: 'ตกลง', cls: 'btn-green' }],
        onMount: api => {
          // reveal bill rows one by one
          const rows = api.el.querySelectorAll('.bill-row, .note-warn, .res-text');
          rows.forEach(r => r.classList.add('hide'));
          rows.forEach((r, i) => setTimeout(() => {
            r.classList.remove('hide'); r.classList.add('pop');
            if (r.classList.contains('shield')) SFX.shield(); else if (r.classList.contains('bad')) SFX.pay();
          }, 300 + i * 380));
          setTimeout(() => { pState.mood = res.mood === 'happy' ? 'happy' : 'sick'; applyResultFX(res); }, 300 + rows.length * 380);
        }
      });
      return;
    }

    if (ev.type === 'dice') {
      await dialog({
        head, headCls, portrait,
        body: intro + `<p class="dice-note">${esc(ev.diceNote(S))}</p>` + diceHTML() + '<div class="res"></div>',
        buttons: [{
          label: I('die') + ' ทอยลูกเต๋า', cls: 'btn-purple',
          onClick: async api => {
            api.setButtons([{ label: 'กำลังทอย...', cls: 'btn-grey', disabled: true }]);
            const die = await animateDice(api.el.querySelector('.dice'));
            const res = ev.run(S, G, die);
            pState.mood = res.mood; pState.fx = res.fx;
            api.el.querySelector('.res').innerHTML = `<p class="dice-result">ได้แต้ม ${die}</p>` + resultHTML(res);
            applyResultFX(res);
            api.setButtons([{ label: 'ตกลง', cls: 'btn-green' }]);
          }
        }],
        onMount: api => drawDiceFace(api.el.querySelector('.dice'), 1)
      });
      return;
    }

    if (ev.type === 'choice') {
      const opts = ev.options(S);
      await dialog({
        head, headCls, portrait,
        body: intro + '<div class="res"></div>',
        buttons: opts.map(o => {
          const lacks = o.cost && S.cash < o.cost;
          return {
            label: esc(o.label) + (lacks ? ' (เงินไม่พอ)' : ''), cls: o.ghost ? 'btn-grey' : 'btn-orange', disabled: lacks,
            onClick: async api => {
              let res;
              if (o.dice) {
                api.setButtons([{ label: 'กำลังทอย...', cls: 'btn-grey', disabled: true }]);
                api.el.querySelector('.res').innerHTML = `<p class="dice-note">${esc(o.diceNote)}</p>` + diceHTML();
                const cv = api.el.querySelector('.dice'); drawDiceFace(cv, 1); await sleep(250);
                const die = await animateDice(cv);
                res = o.run(S, G, die);
                api.el.querySelector('.res').insertAdjacentHTML('beforeend', `<p class="dice-result">ได้แต้ม ${die}</p>` + resultHTML(res));
              } else {
                res = o.run(S, G);
                api.el.querySelector('.res').innerHTML = `<p class="chosen">คุณเลือก: ${esc(o.label)}</p>` + resultHTML(res);
              }
              pState.mood = res.mood; pState.fx = res.fx; if (res.scene) pState.scene = res.scene;
              applyResultFX(res);
              api.setButtons([{ label: 'ตกลง', cls: 'btn-green' }]);
            }
          };
        })
      });
    }
  }

  // ---- round summary ----
  async function showSummary(r) {
    Scene.setMode('LIGHT');
    const rows = r.lines.map(l => `<div class="bill-row ${l.kind}"><span>${l.kind === 'shield' ? I('shield') + ' ' : ''}${esc(l.label)}</span><b>${fmtSigned(l.amount)}</b></div>`).join('');
    const notes = r.notes.map(n => `<p class="note-${n.kind}">${I(n.kind === 'good' ? 'check' : 'warn')} ${esc(n.t)}</p>`).join('');
    const body = `
      <h3 class="ev-title">สรุปช่วงอายุ ${ageLabel(r.fromAge)}</h3>
      <div class="bill">${rows}
        <div class="bill-row strong ${r.cashDelta >= 0 ? 'good' : 'bad'}"><span>เงินสดเปลี่ยนแปลงสุทธิ</span><b>${fmtSigned(r.cashDelta)}</b></div>
        <div class="bill-row info ${r.investDelta >= 0 ? 'good' : 'bad'}"><span>กำไร/ขาดทุนจากการลงทุน (ยังไม่ขาย)</span><b>${fmtSigned(r.investDelta)}</b></div>
      </div>
      ${notes}
      <div class="sum-strip"><div><small>เงินสด</small><b>${fmtShort(S.cash)}</b></div><div><small>ทรัพย์สินสุทธิ</small><b>${fmtShort(netWorth(S))}</b></div></div>`;
    if (r.cashDelta > 0) { Scene.coins(10); SFX.coins(3); } else SFX.pay();
    const next = S.over ? 'ดูผลลัพธ์ชีวิต' : `เริ่มช่วงอายุ ${ageLabel(S.age)}`;
    await dialog({ head: 'สิ้นสุดช่วงชีวิต', headCls: 'h-orange', body, buttons: [{ label: next, cls: S.over ? 'btn-red' : 'btn-green' }] });
  }

  // ---- LIFE GO ----
  async function lifeGo() {
    if (busy || asking || !S || S.over) return;
    SFX.unlock();
    const warns = [];
    if (!S.ins.health && S.insurable.health) warns.push('ยังไม่มีประกันสุขภาพ');
    if (S.age >= 35 && !S.ins.ci && S.insurable.ci) warns.push('ยังไม่มีประกันโรคร้ายแรง');
    if ((S.married || S.kids) && !S.ins.life) warns.push('มีครอบครัวแต่ยังไม่มีประกันชีวิต');
    if (S.cash < 50000) warns.push('เงินสดสำรองเหลือน้อยมาก');
    asking = true;
    let ok;
    try {
      ok = await dialog({
        head: 'พร้อมหรือยัง', headCls: 'h-black',
        body: `<p class="center">คุณพร้อมออกไปใช้ชีวิตช่วงอายุ <b>${ageLabel(S.age)}</b> ที่ไม่อาจคาดเดาได้หรือยัง</p>
          ${warns.length ? '<div class="warn-list">' + warns.map(w => `<p>${I('warn')} ${w}</p>`).join('') + '</div>' : ''}`,
        buttons: [{ label: 'กลับไปวางแผน', cls: 'btn-grey', value: false }, { label: 'ไปต่อ ' + I('play'), cls: 'btn-red', value: true }]
      });
    } finally { asking = false; }
    if (!ok) return;

    busy = true; document.body.classList.add('busy');
    // try/finally: if anything throws mid-round, don't leave the game locked in
    // the "busy" state (every button ignores clicks while busy)
    try {
      Scene.walkT = 1.4; SFX.step();
      $('#sceneTag').textContent = `อายุ ${ageLabel(S.age)}`; $('#sceneTag').classList.add('show');
      await sleep(1300);
      $('#sceneTag').classList.remove('show');

      const events = drawEvents();
      for (const ev of events) {
        await playEvent(ev);
        normalize(S); renderGame();
        if (S.over) break;
        await sleep(250);
      }
      if (!S.over) {
        const r = settle(S);
        renderGame();
        await showSummary(r);
      }
    } catch (err) {
      console.error('[Game of Life] round failed', err);
      $('#modalRoot').innerHTML = ''; document.body.classList.remove('modal-open');
      $('#sceneTag').classList.remove('show');
      toast('เกิดข้อผิดพลาดบางอย่าง ลองกดใช้ชีวิตต่ออีกครั้ง', 'bad');
    } finally {
      Scene.setMode('LIGHT');
      busy = false; document.body.classList.remove('busy');
    }
    if (S.over) { showEnd(); return; }
    if (S.expiredNotice.length) { tab = 'insurance'; toast('ประกันระยะสั้นหมดอายุ ต่ออายุได้ที่แท็บประกัน', 'warn'); }
    renderGame();
  }

  // ===========================================================================
  // END SCREEN
  // ===========================================================================
  function rankFor(nw) {
    if (nw >= 25e6) return ['อิสรภาพทางการเงิน', 'คุณวางแผนได้ยอดเยี่ยม เงินทำงานแทนคุณได้อย่างสมบูรณ์'];
    if (nw >= 12e6) return ['เกษียณอย่างมั่งคั่ง', 'มีเงินเหลือใช้ ดูแลตัวเองและครอบครัวได้สบาย'];
    if (nw >= 6e6) return ['เกษียณสบาย', 'มีเงินพอใช้ตลอดวัยเกษียณ ไม่เป็นภาระลูกหลาน'];
    if (nw >= 2e6) return ['เกษียณแบบพอดี', 'พอใช้ได้ แต่ต้องระวังค่ารักษาพยาบาลในวัยชรา'];
    if (nw >= 0) return ['เกษียณแบบตึงมือ', 'เงินเก็บน้อยเกินไป อาจต้องทำงานต่อหรือพึ่งพาลูกหลาน'];
    return ['หนี้ท่วมตอนเกษียณ', 'ชีวิตหลังเกษียณจะยากลำบากมาก'];
  }

  function showEnd() {
    const s = S, reason = s.endReason;
    let head, title, sub, big, bigLabel, extra = '';
    const pension = Math.round(s.ins.annuityPaid * INS.annuity.payoutRate);
    if (reason === 'departure') {
      const lifePay = s.ins.life * INS.life.sum;
      const paPay = s.ins.pa ? INS.pa.payout : 0;
      const assets = netWorth(s) - lifeCashValue(s); // policy pays sum instead of cash value
      const legacy = Math.max(0, assets + lifePay + paPay);
      const hasDeps = s.married || s.kids > 0;
      head = 'มรดกที่ส่งต่อให้คนข้างหลัง';
      title = lifePay > 0 ? 'ความรักที่ยังดูแลครอบครัวต่อ' : (hasDeps ? 'ครอบครัวต้องสู้ต่อเพียงลำพัง' : 'เรื่องราวที่จบเร็วเกินไป');
      sub = lifePay > 0 ? 'แม้คุณจะไม่อยู่แล้ว แต่ประกันชีวิตยังทำหน้าที่ดูแลคนที่คุณรักแทนคุณ'
        : (hasDeps ? 'ไม่มีประกันชีวิต ครอบครัวต้องรับภาระค่าใช้จ่ายและหนี้สินที่เหลืออยู่ทั้งหมด' : 'ไม่มีใครรู้ว่าวันพรุ่งนี้จะเป็นอย่างไร');
      big = legacy; bigLabel = 'เงินที่ครอบครัวได้รับ';
      extra = `<div class="bill">
        <div class="bill-row ${assets >= 0 ? 'good' : 'bad'}"><span>ทรัพย์สินสุทธิ (หักหนี้แล้ว)</span><b>${fmtSigned(assets)}</b></div>
        <div class="bill-row ${lifePay ? 'shield' : 'bad'}"><span>${I('shield')} เงินจากประกันชีวิต</span><b>${fmtSigned(lifePay)}</b></div>
        ${paPay ? `<div class="bill-row shield"><span>${I('shield')} เงินจากประกันอุบัติเหตุ</span><b>${fmtSigned(paPay)}</b></div>` : ''}
        <div class="bill-row strong good"><span>รวมที่ส่งต่อ</span><b>${fmt(legacy)}</b></div></div>`;
    } else if (reason === 'bankrupt') {
      head = 'ล้มละลาย'; title = 'หนี้สินท่วมตัว'; sub = 'หนี้ดอกเบี้ยสูงพอกพูนจนไม่สามารถไปต่อได้ การมีเงินสำรองและประกันคือเกราะป้องกันไม่ให้ชีวิตสะดุด';
      big = netWorth(s, true); bigLabel = 'ทรัพย์สินสุทธิ';
    } else {
      const nw = netWorth(s, true);
      const [r, d] = rankFor(nw);
      head = 'เกษียณอายุ 65 ปี'; title = r; sub = d; big = nw; bigLabel = 'ทรัพย์สินสุทธิ ณ วันเกษียณ';
      if (pension) extra = `<div class="bill"><div class="bill-row shield"><span>${I('coin')} รวมเงินบำนาญที่จะได้รับ</span><b>${fmt(pension)}</b></div></div>`;
      try {
        const best = JSON.parse(localStorage.getItem('gol_best') || 'null');
        if (!best || nw > best.nw) localStorage.setItem('gol_best', JSON.stringify({ nw, persona: s.persona.name }));
      } catch (e) { /* ignore */ }
    }

    const happyEnd = reason === 'retire' && big >= 2e6;
    Scene.setMode(happyEnd ? 'RED' : 'DARK');
    Scene.mood(happyEnd ? 'jump' : 'cry', 999);
    if (happyEnd) { SFX.fanfare(); setTimeout(() => Scene.coins(24), 300); } else SFX.sad();

    $('#endContent').innerHTML = `
      <div class="end-head ${happyEnd ? 'h-red' : 'h-black'}">${head}</div>
      <div class="end-scene"><canvas id="endCanvas" width="180" height="96"></canvas></div>
      <div class="end-card px-box">
        <div class="rank">${esc(title)}</div>
        <p class="rank-sub">${esc(sub)}</p>
        <div class="big-num"><small>${bigLabel}</small><b>${fmt(big)}</b></div>
        ${extra}
      </div>
      <div class="end-card px-box">
        ${sectionHead('สถิติชีวิตของคุณ', 'h-orange')}
        <div class="grid2">
          ${kv('ตัวละคร', esc(s.persona.name))}
          ${kv('อายุสุดท้าย', s.age + ' ปี')}
          ${kv('ประกันจ่ายแทนคุณรวม', fmt(s.stats.claimsPaid), 'pos')}
          ${kv('ค่ารักษาที่จ่ายเอง', fmt(s.stats.oop), s.stats.oop ? 'neg' : '')}
          ${kv('ภาษีที่ประหยัดได้', fmt(s.stats.taxSaved), 'pos')}
          ${kv('เบี้ยประกันที่จ่ายรวม', fmt(s.stats.premiums))}
          ${kv('สุขภาพ', s.health + '/100')}
          ${kv('ความสุข', s.happy + '/100')}
        </div>
        <canvas id="chartCanvas" width="180" height="70" class="chart"></canvas>
        <p class="fineprint center">ทรัพย์สินสุทธิในแต่ละช่วงอายุ</p>
      </div>
      <div class="end-card px-box agent-end">
        <canvas width="40" height="44" class="tip-face big" data-agent></canvas>
        <div>
          <p><b>${CONFIG.AGENT_NAME}:</b> ${esc(endAdvice())}</p>
          <a class="btn btn-red sm" href="${CONFIG.LINE_URL}" target="_blank" rel="noopener noreferrer">วางแผนชีวิตจริง ปรึกษาฟรี</a>
        </div>
      </div>
      <div class="spacer"></div>`;
    show('screen-end');

    // re-bind scene to end canvas
    const main = Scene.canvas; Scene.init($('#endCanvas')); Scene._main = main;
    drawChart();
    bindAgentFaces();
    $('#restartSheet').classList.remove('in');
    setTimeout(() => { $('#restartSheet').classList.add('in'); SFX.pop(); }, 1600);
  }

  function endAdvice() {
    const s = S;
    if (s.endReason === 'departure') return s.ins.life ? 'ประกันชีวิตไม่ได้มีไว้เพื่อคุณ แต่มีไว้เพื่อคนที่คุณรักครับ' : 'ถ้ามีประกันชีวิต ครอบครัวจะมีเงินก้อนไว้ตั้งหลักต่อได้ครับ';
    if (s.stats.oop > 500000) return `ค่ารักษาที่จ่ายเอง ${fmtShort(s.stats.oop)} คือเงินที่ประกันสุขภาพช่วยได้ครับ`;
    if (s.stats.claimsPaid > 0) return `ประกันช่วยจ่ายแทนคุณไปแล้ว ${fmtShort(s.stats.claimsPaid)} เงินเก็บของคุณเลยยังเติบโตต่อได้ครับ`;
    if (s.debt > 0) return 'หนี้ดอกเบี้ยสูงคือศัตรูของความมั่งคั่ง ควรมีเงินสำรองฉุกเฉินอย่างน้อย 6 เดือนครับ';
    return 'ประกันไม่ได้ทำให้รวยขึ้นทันที แต่ช่วยไม่ให้จนลงเมื่อเกิดเรื่องไม่คาดฝันครับ';
  }

  function drawChart() {
    const cv = $('#chartCanvas'); if (!cv) return;
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; PX.use(ctx);
    const w = cv.width, h = cv.height;
    PX.rect(0, 0, w, h, C.WHITE);
    const data = S.history.length ? S.history : [{ age: S.age, nw: netWorth(S) }];
    const max = Math.max(1, ...data.map(d => d.nw)), min = Math.min(0, ...data.map(d => d.nw));
    const zeroY = Math.round(6 + (h - 18) * (max / (max - min)));
    PX.rect(4, zeroY, w - 8, 1, C.DGREY);
    const bw = Math.floor((w - 12) / D.ROUNDS) - 3;
    data.forEach((d, i) => {
      const x = 8 + i * (bw + 3);
      const bh = Math.round(Math.abs(d.nw) / (max - min) * (h - 18));
      const y = d.nw >= 0 ? zeroY - bh : zeroY + 1;
      const col = d.nw >= 0 ? (i === data.length - 1 ? C.RED : C.DPINK) : C.PURPLE;
      if (bh > 0) PX.gameBox(x, y, bw, Math.max(2, bh), col, C.BLACK, null, d.nw >= 0 ? C.SPINK : null);
    });
  }
  function bindAgentFaces() {
    $$('canvas[data-agent]').forEach(cv => {
      if (cv._bound) return; cv._bound = true;
      makePortrait(cv, (t, w, h) => { PX.rect(0, 0, w, h, C.SPINK); PX.drawChibi(w / 2 - 3, h + 2, { ...PX.CAST.agent, clipboard: false, time: t, mood: 'happy' }); });
    });
  }

  // ---- restart flow ----
  async function restartFlow() {
    SFX.click();
    $('#restartSheet').classList.remove('in');
    await dialog({
      head: 'ก่อนเริ่มใหม่', headCls: 'h-red', cls: 'reality',
      body: `<div class="reality-box"><div class="rewind">${I('rewind', { px: 5 })}</div>
        <p class="reality-main">ชีวิตจริง<br>คุณย้อนกลับมาเริ่มใหม่ไม่ได้</p>
        <p class="reality-sub">ในเกมกดเริ่มใหม่ได้เสมอ แต่ในชีวิตจริง ทุกการตัดสินใจมีผลตลอดไป วางแผนวันนี้ เพื่อวันที่ไม่มีโอกาสแก้ตัว</p></div>`,
      buttons: [{ label: 'เข้าใจแล้ว', cls: 'btn-red' }]
    });
    if (Scene._main) { Scene.init(Scene._main); Scene._main = null; }
    Scene.moodOverride = null; Scene.moodT = 0; Scene.particles = [];
    S = null; initSelect(); show('screen-select');
  }

  // ---- leave the game (house button) ----
  async function exitGame() {
    if (busy) { toast('รอสักครู่ แล้วลองใหม่อีกครั้ง'); return; }
    SFX.click();
    const ok = await dialog({
      head: 'ออกจากเกม', headCls: 'h-black',
      body: '<p class="ev-title">ต้องการออกจากเกมหรือไม่?</p><p class="ev-text">ความคืบหน้าของเกมนี้จะหายไป และกลับไปหน้าแรกของเกม</p>',
      buttons: [{ label: 'ไม่', cls: 'btn-grey', value: false }, { label: 'ใช่', cls: 'btn-red', value: true }]
    });
    if (!ok) return;
    $('#restartSheet').classList.remove('in');
    if (Scene._main) { Scene.init(Scene._main); Scene._main = null; }
    Scene.moodOverride = null; Scene.moodT = 0; Scene.particles = [];
    S = null; show('screen-title');
  }

  // ---- brand text: Pretendard, redrawn as hard-edged pixels ----
  function pixelBrand() {
    const cv = $('#brandText'), fallback = $('#brandFallback');
    if (!cv || !document.fonts || !document.fonts.load) return;
    const font = '800 14px "Pretendard Variable", Pretendard, sans-serif';
    const parts = [['suvicha.', '#293239'], ['life', '#d21245']];
    document.fonts.load(font).then(() => {
      if (!document.fonts.check(font)) return;
      const m = cv.getContext('2d'); m.font = font;
      const widths = parts.map(p => Math.ceil(m.measureText(p[0]).width));
      cv.width = widths[0] + widths[1] + 2; cv.height = 18;
      const c = cv.getContext('2d', { willReadFrequently: true });
      c.font = font; c.textBaseline = 'alphabetic';
      let x = 1; parts.forEach((p, i) => { c.fillStyle = p[1]; c.fillText(p[0], x, 14); x += widths[i]; });
      const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data;
      for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;   // hard pixel edges
      c.putImageData(img, 0, 0);
      cv.style.width = (cv.width * 1.5) + 'px'; cv.style.height = (cv.height * 1.5) + 'px';   // finer than 2px blocks, still clearly pixels
      cv.hidden = false; fallback.hidden = true;
    }).catch(() => { /* keep the plain text */ });
  }

  // ---- how to play ----
  function howTo() {
    dialog({
      head: 'วิธีเล่น', headCls: 'h-black',
      body: `<ol class="howto">
        <li>เลือกตัวละคร แต่ละคนมีรายได้ ค่าใช้จ่าย และความเสี่ยงต่างกัน</li>
        <li>เกมมี <b>8 ช่วงชีวิต</b> ช่วงละ 5 ปี ตั้งแต่อายุ 25 จนเกษียณที่ 65 เบี้ยประกันที่แสดงเป็นยอดรวมทั้งช่วง มีตัวเลขเฉลี่ยต่อปีกำกับในวงเล็บ</li>
        <li>ก่อนกด <b>ใช้ชีวิตต่อ</b> ให้วางแผน: ซื้อประกัน ฝากเงิน ลงทุน หรือซื้อหุ้น</li>
        <li>แต่ละช่วงจะสุ่มเหตุการณ์ทั้งดีและร้าย บางเหตุการณ์ต้อง <b>ทอยลูกเต๋า</b> หรือ <b>ตัดสินใจ</b></li>
        <li>ประกันสุขภาพ โรคร้ายแรง และอุบัติเหตุ คุ้มครองทีละช่วง <b>ต้องต่ออายุ</b> ทุกช่วง</li>
        <li>ถ้าป่วยหนักตอนไม่มีประกัน บริษัทอาจ <b>ปฏิเสธการรับประกัน</b> ในอนาคต</li>
        <li>เงินสดติดลบ ระบบจะกู้ให้อัตโนมัติ ดอกเบี้ย 20% ต่อช่วง</li>
        <li>เป้าหมาย: เกษียณพร้อมทรัพย์สินสุทธิสูงที่สุด และดูแลคนที่คุณรักได้</li>
      </ol>`,
      buttons: [{ label: 'เข้าใจแล้ว', cls: 'btn-green' }]
    });
  }

  // ===========================================================================
  // BOOT
  // ===========================================================================
  // Phone-only lock: no pinch / double-tap zoom, no rubber-band, no stray page scroll.
  // (iOS Safari ignores user-scalable=no, so the gestures are blocked explicitly.)
  function lockViewport() {
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
    document.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });
    document.addEventListener('dblclick', e => e.preventDefault());
    document.addEventListener('contextmenu', e => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
    // keep the page itself from scrolling: only .screen / #panel / .sheet-body may scroll
    document.addEventListener('touchmove', e => {
      if (e.touches.length > 1) return;
      if (!e.target.closest('.screen, #panel, .sheet-body, .sheet')) e.preventDefault();
    }, { passive: false });
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {}); } catch (err) { /* not supported in Safari tabs */ }
  }

  function boot() {
    lockViewport();
    pixelBrand();
    $('#homeBtn').innerHTML = I('house');
    $('#homeBtn').addEventListener('click', exitGame);
    if (/[?&]debug=1/.test(location.search)) {   // on-device layout diagnostics
      const d = document.createElement('pre');
      d.style.cssText = 'position:fixed;left:0;bottom:0;z-index:9999;background:#000;color:#0f0;font:10px monospace;padding:4px;pointer-events:none;max-width:100%;white-space:pre-wrap';
      document.body.appendChild(d);
      const upd = () => { const v = window.visualViewport || {}; d.textContent = 'inner ' + innerWidth + 'x' + innerHeight + ' vv ' + Math.round(v.width) + 'x' + Math.round(v.height) + ' scale ' + (v.scale || 1).toFixed(3) + ' scrollW ' + document.documentElement.scrollWidth + ' app ' + $('#app-container').offsetWidth; };
      upd(); setInterval(upd, 500);
    }
    $$('[data-icon]').forEach(el => { el.innerHTML = I(el.dataset.icon, { px: +el.dataset.px || 2 }); });
    Scene.init($('#sceneCanvas'));
    initTitle();
    $('#homeLink').href = CONFIG.HOME_URL;
    $('#btnHome').addEventListener('click', () => { SFX.click(); location.href = CONFIG.HOME_URL; });
    $('#btnHomeTitle').href = CONFIG.HOME_URL;
    $('#btnRestart').addEventListener('click', restartFlow);
    $('#btnStart').addEventListener('click', () => { SFX.unlock(); SFX.click(); initSelect(); show('screen-select'); });
    $('#btnHow').addEventListener('click', () => { SFX.unlock(); SFX.click(); howTo(); });
    $('#btnHow2').addEventListener('click', () => { SFX.click(); howTo(); });
    $('#btnBack').addEventListener('click', () => { SFX.click(); show('screen-title'); });
    $('#btnGo').addEventListener('click', lifeGo);
    $('#panel').addEventListener('click', onPanelClick);
    $('#panel').addEventListener('input', onPanelInput);
    $$('.tab').forEach(b => b.addEventListener('click', () => { if (busy) return; SFX.click(); tab = b.dataset.tab; $('#panel').scrollTop = 0; renderGame(); bindAgentFaces(); }));
    const mute = $('#muteBtn');
    const setMuteIcon = () => { mute.innerHTML = I(SFX.isMuted() ? 'mute' : 'speaker'); };
    setMuteIcon();
    mute.addEventListener('click', () => { SFX.toggle(); setMuteIcon(); });
    // re-bind agent faces whenever panel re-renders
    new MutationObserver(bindAgentFaces).observe($('#panel'), { childList: true });
    requestAnimationFrame(loop);
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
