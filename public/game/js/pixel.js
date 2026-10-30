/* =============================================================================
 * THE GAME OF LIFE — PIXEL ENGINE
 * Same brand palette + chibi characters as the suvicha.life pixel shorts (Ep 01–20)
 * Exposes window.PX
 * ========================================================================== */
(function () {
  'use strict';

  // ---- 12-color brand palette (identical to the video series) ----
  const C = {
    BLACK: '#293239', DGREY: '#8b9891', LGREY: '#e5e5e5', WHITE: '#f2f6f9',
    RED: '#d21245', DPINK: '#e37995', SALMON: '#fe7b83', SPINK: '#f6ced7',
    YELLOW: '#fed820', PURPLE: '#4844ce', LGREEN: '#37db68', DGREEN: '#10505a'
  };
  const TEAR = C.PURPLE;

  let ctx = null, W = 0, H = 0;
  function use(c) { ctx = c; W = c.canvas.width; H = c.canvas.height; ctx.imageSmoothingEnabled = false; }

  function rect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function gameBox(x, y, w, h, fill, border = C.BLACK, shadow = C.BLACK, hi = null) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (shadow) { rect(x + 2, y + 2, w - 2, h - 1, shadow); rect(x + 1, y + 2, w, h - 2, shadow); }
    rect(x + 1, y, w - 2, h, border); rect(x, y + 1, w, h - 2, border);
    rect(x + 1, y + 1, w - 2, h - 2, fill);
    if (hi) { rect(x + 2, y + 1, w - 4, 1, hi); rect(x + 1, y + 2, 1, h - 4, hi); }
  }
  function shadeOf(c) {
    const m = {
      [C.SPINK]: C.DPINK, [C.DPINK]: '#c25f7c', [C.SALMON]: '#e0636c', [C.YELLOW]: '#d9b400',
      [C.PURPLE]: '#3733a8', [C.LGREY]: C.DGREY, [C.WHITE]: C.SPINK, [C.BLACK]: '#1a2024',
      [C.DGREEN]: '#0b3a42', [C.LGREEN]: '#25a84d', [C.RED]: '#9e0b32'
    };
    return m[c] || C.DGREY;
  }

  // ===========================================================================
  // BACKGROUND / FLOOR
  // modes: LIGHT (normal day), DARK (crisis/night), RED (finale/celebration), HOSPITAL, GOLD (windfall)
  // ===========================================================================
  function dither(y0, h, a, b, d = .5) {
    rect(0, y0, W, h, a); ctx.fillStyle = b;
    for (let y = y0; y < y0 + h; y++) for (let x = 0; x < W; x++) {
      if (d === .25 && x % 2 === 0 && y % 2 === 0) ctx.fillRect(x, y, 1, 1);
      else if (d === .5 && (x + y) % 2 === 0) ctx.fillRect(x, y, 1, 1);
    }
  }
  function cloud(cx, cy, w, mode) {
    cx = Math.round(cx); cy = Math.round(cy); w = Math.round(w);
    const body = mode === 'DARK' ? '#3a4650' : (mode === 'RED' ? C.SPINK : C.WHITE);
    const shade = mode === 'DARK' ? C.BLACK : (mode === 'RED' ? C.DPINK : C.SPINK);
    rect(cx - w / 2 + 4, cy - 6, w - 8, 12, C.BLACK); rect(cx - w / 2, cy - 3, w, 8, C.BLACK); rect(cx - w / 4, cy - 10, w / 2, 6, C.BLACK);
    rect(cx - w / 2 + 5, cy - 5, w - 10, 10, body); rect(cx - w / 2 + 1, cy - 2, w - 2, 6, body); rect(cx - w / 4 + 1, cy - 9, w / 2 - 2, 5, body);
    rect(cx - w / 2 + 2, cy + 2, w - 4, 2, shade);
  }
  function pineTree(cx, by, mode) {
    const leaf = mode === 'DARK' ? C.DGREEN : (mode === 'RED' ? C.BLACK : C.DPINK);
    const hi = mode === 'DARK' ? C.LGREEN : (mode === 'RED' ? C.SALMON : C.SPINK);
    rect(cx - 2, by - 6, 4, 6, C.BLACK);
    for (const [tw, th, yo] of [[14, 7, 6], [12, 7, 12], [8, 6, 17], [4, 5, 21]]) {
      rect(cx - tw / 2, by - yo - th, tw, th, C.BLACK);
      rect(cx - tw / 2 + 1, by - yo - th + 1, tw - 2, th - 2, leaf);
      rect(cx - tw / 2 + 1, by - yo - th + 1, 2, th - 3, hi);
    }
  }
  function streetLamp(cx, by, mode, t) {
    rect(cx - 1, by - 40, 2, 40, mode === 'DARK' ? C.DGREY : C.BLACK);
    rect(cx - 3, by - 4, 6, 4, C.BLACK); rect(cx - 4, by - 42, 8, 2, C.BLACK);
    gameBox(cx - 4, by - 49, 8, 7, mode === 'LIGHT' || mode === 'HOSPITAL' ? C.WHITE : C.YELLOW, C.BLACK, null);
    if (mode === 'DARK' && Math.sin(t * 5) > -0.3) { rect(cx - 6, by - 47, 2, 3, C.YELLOW); rect(cx + 4, by - 47, 2, 3, C.YELLOW); }
  }
  function hospitalBuilding(cx, by) {
    const w = 64, h = 46, x = cx - w / 2, y = by - h;
    gameBox(x, y, w, h, C.WHITE, C.BLACK, C.BLACK, C.WHITE);
    rect(x + 2, y + 2, w - 4, 5, C.SPINK);
    gameBox(cx - 9, y - 14, 18, 16, C.WHITE, C.BLACK, null);
    rect(cx - 2, y - 11, 4, 10, C.RED); rect(cx - 5, y - 8, 10, 4, C.RED);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      if (c === 1 || c === 2) { if (r === 1) continue; }
      gameBox(x + 5 + c * 15, y + 11 + r * 14, 10, 9, C.SPINK, C.BLACK, null);
    }
    gameBox(cx - 8, by - 16, 16, 16, C.BLACK, C.BLACK, null); rect(cx - 6, by - 14, 12, 14, '#7fd3e6'); rect(cx, by - 14, 1, 14, C.BLACK);
  }

  function drawBackground(mode, t, floorY) {
    if (mode === 'LIGHT' || mode === 'HOSPITAL') {
      rect(0, 0, W, floorY, C.WHITE);
      dither(0, 18, C.SPINK, C.WHITE, .5); dither(18, 8, C.SPINK, C.WHITE, .25);
      dither(floorY - 40, 10, C.WHITE, C.SPINK, .25); dither(floorY - 30, 12, C.WHITE, C.SPINK, .5);
      rect(0, floorY - 18, W, 18, C.SPINK);
    } else if (mode === 'DARK') {
      rect(0, 0, W, floorY, C.BLACK);
      dither(floorY - 36, 10, C.BLACK, '#1d2429', .5); rect(0, floorY - 26, W, 26, '#1d2429');
      gameBox(W - 28, 10, 12, 12, C.YELLOW, C.BLACK, null, C.WHITE);
      [[14, 14], [44, 22], [80, 10], [120, 26], [150, 16], [30, 40], [100, 44], [168, 38]].forEach(([sx, sy], i) => {
        const b = Math.sin(t * 4 + i * 1.7) > .1; rect(sx, sy, 1, 1, b ? C.WHITE : C.DGREY);
        if (b && i % 2 === 0) { rect(sx - 2, sy, 5, 1, C.YELLOW); rect(sx, sy - 2, 1, 5, C.YELLOW); }
      });
    } else if (mode === 'GOLD') {
      rect(0, 0, W, floorY, '#fff4b8');
      dither(0, 20, C.YELLOW, '#fff4b8', .5); dither(20, 8, C.YELLOW, '#fff4b8', .25);
      rect(0, floorY - 18, W, 18, C.YELLOW);
      for (let i = 0; i < 10; i++) {
        const a = t * .6 + i * Math.PI / 5; const r = 60;
        const x = W / 2 + Math.cos(a) * r, y = floorY - 30 + Math.sin(a) * r * .5;
        rect(x, y, 2, 2, C.WHITE);
      }
    } else { // RED
      rect(0, 0, W, floorY, C.RED);
      dither(0, 22, '#9e0b32', C.RED, .5); dither(floorY - 32, 12, C.RED, C.SALMON, .25);
      rect(0, floorY - 20, W, 20, C.SALMON);
    }

    cloud(((30 + t * 4) % (W + 60)) - 30, 24, 34, mode);
    cloud(((120 + t * 3) % (W + 60)) - 30, 38, 28, mode);

    const bc = mode === 'DARK' ? '#13181c' : (mode === 'RED' ? '#8f0a2d' : (mode === 'GOLD' ? '#ffe680' : C.LGREY));
    const bo = mode === 'DARK' || mode === 'RED' ? C.BLACK : C.DGREY;
    const wc = mode === 'DARK' || mode === 'RED' ? C.YELLOW : C.WHITE;
    const blds = [[2, 18, 30], [20, 16, 22], [36, 20, 38], [134, 18, 28], [152, 22, 40], [174, 16, 26]];
    blds.forEach(([bx, bw, bh], bi) => {
      if (bx > W) return;
      const by = floorY - bh;
      rect(bx, by, bw, bh, bc); rect(bx, by, bw, 1, bo); rect(bx, by, 1, bh, bo); rect(bx + bw - 1, by, 1, bh, bo);
      if (bi === 2 || bi === 4) {
        rect(bx + 3, by - 4, bw - 6, 4, bo); rect(bx + 4, by - 3, bw - 8, 3, bc);
        rect(bx + Math.floor(bw / 2) - 1, by - 10, 2, 6, bo); rect(bx + Math.floor(bw / 2) - 1, by - 11, 2, 2, C.RED);
      }
      for (let wy = by + 4; wy < floorY - 6; wy += 6) for (let wx = bx + 3; wx < bx + bw - 4; wx += 5)
        if ((wx + wy + bi) % 3 !== 0) rect(wx, wy, 2, 3, wc);
    });
    if (mode === 'HOSPITAL') hospitalBuilding(W / 2 + 46, floorY);
    streetLamp(8, floorY, mode, t);
    streetLamp(W - 8, floorY, mode, t);
    pineTree(18, floorY, mode);
  }

  function drawFloor(y, mode) {
    const dark = mode === 'DARK', red = mode === 'RED', gold = mode === 'GOLD';
    const base = red ? '#a80f38' : dark ? '#1d2429' : gold ? '#f3d75a' : C.LGREY;
    const hi = red ? C.SALMON : dark ? '#34414a' : C.WHITE;
    const speck = red ? '#c4123f' : dark ? '#2a343b' : gold ? '#d9b400' : C.DGREY;
    rect(0, y, W, H - y, base); rect(0, y, W, 1, C.BLACK); rect(0, y + 1, W, 2, hi);
    for (let i = 0; i < 18; i++) rect((i * 53 + 17) % W, y + 6 + ((i * 29) % Math.max(1, H - y - 8)), 2, 1, speck);
    for (let ly = y + 10; ly < H; ly += 12) for (let x = (ly * 7) % 28; x < W; x += 30) rect(x, ly, 12, 1, speck);
  }

  // ===========================================================================
  // CHIBI CHARACTERS (same sprite as video series)
  // roles: neighbor, agent, ceo, office, doctor
  // ===========================================================================
  const CAST = {
    office: { role: 'office', shirt: C.WHITE, hairCol: C.BLACK, hairStyle: 'bowl', seed: 1 },
    owner: { role: 'ceo', shirt: C.PURPLE, hairCol: C.BLACK, hairStyle: 'exec', briefcase: true, seed: 2 },
    freelance: { role: 'neighbor', shirt: C.LGREEN, hairCol: C.BLACK, hairStyle: 'spike', headphones: true, seed: 3 },
    parent: { role: 'neighbor', shirt: C.SALMON, hairCol: C.DPINK, hairStyle: 'long', necklace: true, seed: 4 },
    agent: { role: 'agent', hairCol: C.BLACK, hairStyle: 'bowl', glasses: true, clipboard: true, seed: 5 },
    spouseF: { role: 'neighbor', shirt: C.SPINK, hairCol: C.BLACK, hairStyle: 'long', seed: 6 },
    spouseM: { role: 'neighbor', shirt: C.DGREEN, hairCol: C.BLACK, hairStyle: 'bowl', seed: 7 },
    kid: { role: 'neighbor', shirt: C.YELLOW, hairCol: C.BLACK, hairStyle: 'spike', seed: 8 },
    doctor: { role: 'doctor', hairCol: C.DGREY, hairStyle: 'bowl', glasses: true, seed: 9 },
    friend: { role: 'neighbor', shirt: C.YELLOW, hairCol: C.DGREEN, hairStyle: 'exec', seed: 10 },
    boss: { role: 'ceo', shirt: C.BLACK, hairCol: C.DGREY, hairStyle: 'exec', seed: 11 }
  };

  function drawChibi(cx, bottomY, o = {}) {
    const { role = 'neighbor', shirt = C.DPINK, hairCol = C.BLACK, hairStyle = 'bowl', mood = 'normal',
      walk = 0, facing = 1, time = 0, seed = 0, clipboard = false, briefcase = false, necklace = false,
      glasses = false, headphones = false } = o;
    cx = Math.round(cx); bottomY = Math.round(bottomY);
    const step = Math.sin(walk);
    const bob = walk !== 0 ? Math.abs(Math.round(step * 1.5)) : (Math.sin(time * 4 + seed * 1.3) > .65 ? 1 : 0);
    const jump = mood === 'jump' ? Math.round(Math.abs(Math.sin(time * 8)) * 5) : 0;
    const y = bottomY - bob - jump;
    rect(cx - 7, bottomY - 1, 14, 2, C.BLACK); rect(cx - 5, bottomY, 10, 1, C.BLACK);

    const pants = (role === 'agent' || role === 'ceo' || role === 'office') ? '#3d4a53' : C.DGREY;
    const lL = walk ? Math.max(0, Math.round(step * 2)) : 0, lR = walk ? Math.max(0, Math.round(-step * 2)) : 0;
    rect(cx - 5, y - 6 - lL, 4, 6, C.BLACK); rect(cx - 4, y - 5 - lL, 2, 3, pants);
    rect(cx + 1, y - 6 - lR, 4, 6, C.BLACK); rect(cx + 2, y - 5 - lR, 2, 3, pants);

    const body = role === 'agent' ? C.BLACK : (role === 'doctor' ? C.WHITE : shirt), bshade = shadeOf(body);
    rect(cx - 6, y - 16, 12, 11, C.BLACK); rect(cx - 7, y - 15, 14, 9, C.BLACK);
    rect(cx - 5, y - 15, 10, 9, body); rect(cx - 6, y - 14, 12, 7, body);
    rect(cx + 3, y - 14, 3, 7, bshade); rect(cx - 4, y - 7, 9, 1, bshade);
    if (role === 'agent') {
      rect(cx - 2, y - 15, 4, 8, C.WHITE); rect(cx - 1, y - 14, 2, 7, C.RED);
      rect(cx - 3, y - 15, 1, 6, C.DGREY); rect(cx + 2, y - 15, 1, 6, C.DGREY); rect(cx + 3, y - 12, 2, 2, C.YELLOW);
    } else if (role === 'ceo') {
      rect(cx - 2, y - 15, 4, 8, C.WHITE); rect(cx - 1, y - 14, 2, 7, C.YELLOW); rect(cx - 4, y - 12, 2, 2, C.YELLOW);
    } else if (role === 'office') {
      rect(cx - 1, y - 15, 2, 7, C.RED); rect(cx + 2, y - 12, 3, 4, C.PURPLE); rect(cx + 3, y - 11, 1, 2, C.WHITE);
    } else if (role === 'doctor') {
      rect(cx - 1, y - 15, 2, 8, C.LGREY); rect(cx - 5, y - 12, 3, 1, C.RED); rect(cx - 4, y - 13, 1, 3, C.RED);
      rect(cx + 2, y - 15, 1, 5, C.BLACK); rect(cx + 1, y - 10, 3, 2, C.DGREY);
    } else {
      rect(cx - 2, y - 15, 4, 1, C.WHITE);
      if (necklace) { rect(cx - 3, y - 14, 6, 1, C.YELLOW); rect(cx - 1, y - 13, 2, 1, C.WHITE); }
    }

    const armsUp = mood === 'jump' || mood === 'cheer';
    if (armsUp) {
      rect(cx - 10, y - 22, 3, 8, C.BLACK); rect(cx - 9, y - 21, 2, 6, body);
      rect(cx + 7, y - 22, 3, 8, C.BLACK); rect(cx + 7, y - 21, 2, 6, bshade);
    } else {
      rect(cx - 9, y - 14, 3, 6, C.BLACK); rect(cx - 8, y - 13, 2, 4, body);
      rect(cx + 6, y - 14, 3, 6, C.BLACK); rect(cx + 6, y - 13, 2, 4, bshade);
    }
    if (clipboard && !armsUp) {
      gameBox(cx + 7, y - 20, 10, 13, C.WHITE, C.BLACK, null);
      rect(cx + 9, y - 17, 6, 1, C.DGREY); rect(cx + 9, y - 14, 6, 1, C.DGREY); rect(cx + 9, y - 11, 4, 1, C.DGREY);
      rect(cx + 10, y - 22, 4, 2, C.BLACK);
    }
    if (briefcase && !armsUp) {
      const bx = facing < 0 ? cx - 16 : cx + 7;
      gameBox(bx, y - 13, 10, 8, C.BLACK, C.BLACK, null, C.DGREY);
      rect(bx + 3, y - 15, 4, 2, C.BLACK); rect(bx + 4, y - 10, 2, 2, C.YELLOW);
    }

    const hy = y - 29;
    rect(cx - 5, hy, 10, 14, C.BLACK); rect(cx - 7, hy + 1, 14, 12, C.BLACK); rect(cx - 8, hy + 3, 16, 8, C.BLACK);
    rect(cx - 4, hy + 1, 8, 12, C.WHITE); rect(cx - 6, hy + 2, 12, 10, C.WHITE); rect(cx - 7, hy + 4, 14, 6, C.WHITE);
    rect(cx + 4, hy + 3, 2, 8, C.SPINK); rect(cx + 5, hy + 4, 2, 6, C.SPINK); rect(cx - 4, hy + 11, 9, 2, C.SPINK); rect(cx + 2, hy + 10, 3, 2, C.SPINK);

    rect(cx - 5, hy - 2, 10, 1, C.BLACK);
    rect(cx - 7, hy - 1, 1, 1, C.BLACK); rect(cx + 6, hy - 1, 1, 1, C.BLACK); rect(cx - 6, hy - 1, 12, 1, hairCol);
    rect(cx - 8, hy, 1, 5, C.BLACK); rect(cx + 7, hy, 1, 5, C.BLACK); rect(cx - 7, hy, 14, 4, hairCol);
    rect(cx - 7, hy + 4, 4, 1, hairCol); rect(cx - 1, hy + 4, 3, 1, hairCol); rect(cx + 4, hy + 4, 3, 1, hairCol);
    if (hairStyle === 'long') {
      rect(cx - 8, hy + 5, 3, 6, C.BLACK); rect(cx - 7, hy + 5, 2, 6, hairCol);
      rect(cx + 5, hy + 5, 3, 6, C.BLACK); rect(cx + 5, hy + 5, 2, 6, hairCol);
    } else if (hairStyle === 'spike') {
      rect(cx - 2, hy - 5, 5, 3, C.BLACK); rect(cx - 1, hy - 4, 3, 2, hairCol); rect(cx + 3, hy - 4, 2, 2, C.BLACK); rect(cx + 3, hy - 3, 1, 1, hairCol);
    } else if (hairStyle === 'exec') {
      rect(cx - 5, hy - 3, 10, 2, C.BLACK); rect(cx - 4, hy + 4, 2, 1, C.WHITE);
    }
    rect(cx - 6, hy - 1, 12, 1, hairCol); rect(cx - 3, hy, 3, 1, C.WHITE);
    if (headphones) {
      rect(cx - 7, hy - 3, 14, 1, C.BLACK);
      rect(cx - 9, hy + 3, 3, 5, C.BLACK); rect(cx - 8, hy + 4, 1, 3, C.RED);
      rect(cx + 6, hy + 3, 3, 5, C.BLACK); rect(cx + 7, hy + 4, 1, 3, C.RED);
    }

    const look = facing >= 0 ? 1 : -1, exL = cx - 4 + look, exR = cx + 2 + look, ey = hy + 7;
    const happyMouth = () => { rect(cx - 1, ey + 4, 3, 1, C.BLACK); rect(cx - 2, ey + 3, 1, 1, C.BLACK); rect(cx + 2, ey + 3, 1, 1, C.BLACK); };
    if (glasses || role === 'agent') {
      for (const ex of [exL, exR]) {
        rect(ex - 1, ey - 1, 4, 3, C.WHITE);
        rect(ex - 1, ey - 2, 4, 1, C.BLACK); rect(ex - 1, ey + 2, 4, 1, C.BLACK);
        rect(ex - 2, ey - 1, 1, 3, C.BLACK); rect(ex + 3, ey - 1, 1, 3, C.BLACK);
        rect(ex - 1, ey - 1, 1, 1, C.LGREY);
      }
      rect(exL + 3, ey - 1, 2, 1, C.BLACK); rect(cx - 7, ey - 1, 2, 1, C.BLACK); rect(cx + 6, ey - 1, 2, 1, C.BLACK);
      rect(exL, ey - 1, 2, 2, C.BLACK); rect(exR, ey - 1, 2, 2, C.BLACK);
      if (mood === 'happy' || mood === 'jump' || mood === 'cheer') happyMouth();
      else if (mood === 'shock') rect(cx - 1 + look, ey + 4, 2, 2, C.RED);
      return;
    }
    if (mood === 'happy' || mood === 'jump' || mood === 'cheer') {
      for (const ex of [exL, exR]) { rect(ex - 1, ey + 1, 1, 1, C.BLACK); rect(ex, ey, 2, 1, C.BLACK); rect(ex + 2, ey + 1, 1, 1, C.BLACK); }
      happyMouth();
    } else if (mood === 'shock') {
      rect(exL, ey - 1, 2, 4, C.BLACK); rect(exR, ey - 1, 2, 4, C.BLACK); rect(cx - 1 + look, ey + 4, 2, 2, C.RED);
      rect(cx + 6, hy + 4, 2, 3, TEAR);
    } else if (mood === 'cry' || mood === 'sick') {
      for (const ex of [exL, exR]) rect(ex - 1, ey + 1, 4, 1, C.BLACK);
      rect(exL - 1, ey - 1, 1, 1, C.BLACK); rect(exL, ey - 2, 2, 1, C.BLACK); rect(exR, ey - 2, 2, 1, C.BLACK); rect(exR + 2, ey - 1, 1, 1, C.BLACK);
      if (mood === 'cry') for (const ex of [exL, exR]) {
        rect(ex, ey + 2, 1, 7, TEAR);
        const d = (time * 16 + ex) % 8; rect(ex - 1, ey + 3 + d, 3, 2, TEAR);
      } else {
        rect(cx - 6, hy + 1, 12, 2, C.LGREEN); // pale forehead
        rect(cx - 7, hy + 2, 14, 1, C.WHITE); rect(cx - 2, hy + 1, 4, 2, C.WHITE); // bandage
      }
      rect(cx - 2, ey + 5, 5, 1, C.BLACK); rect(cx - 3, ey + 6, 1, 1, C.BLACK); rect(cx + 3, ey + 6, 1, 1, C.BLACK);
    } else {
      rect(exL, ey, 2, 3, C.BLACK); rect(exR, ey, 2, 3, C.BLACK);
      rect(exL - 2, ey + 2, 2, 1, C.SALMON); rect(exR + 2, ey + 2, 2, 1, C.SALMON);
    }
  }

  // ===========================================================================
  // PROPS
  // ===========================================================================
  function drawCoin(x, y, t, size = 6) {
    x = Math.round(x); y = Math.round(y);
    const phase = Math.floor(t * 10) % 4;
    const w = [size, size - 2, 2, size - 2][phase];
    const ox = Math.round((size - w) / 2);
    rect(x + ox, y, w, size, C.BLACK);
    if (w > 2) {
      rect(x + ox + 1, y + 1, w - 2, size - 2, C.YELLOW);
      rect(x + ox + 1, y + 1, 1, size - 3, C.WHITE);
      if (w >= 4) rect(x + ox + Math.floor(w / 2), y + 2, 1, size - 4, '#d9b400');
    }
  }
  function drawBill(x, y, col = C.LGREEN) {
    gameBox(x, y, 12, 7, col, C.BLACK, null); rect(x + 5, y + 2, 2, 3, C.DGREEN);
  }
  function drawShield(cx, cy, s = 1, col = C.LGREEN) {
    const p = (dx, dy, w, h, c) => rect(cx + dx * s, cy + dy * s, w * s, h * s, c);
    p(-8, -9, 16, 2, C.BLACK); p(-9, -8, 18, 9, C.BLACK); p(-8, 1, 16, 3, C.BLACK); p(-6, 4, 12, 2, C.BLACK); p(-4, 6, 8, 2, C.BLACK); p(-2, 8, 4, 2, C.BLACK);
    p(-7, -8, 14, 9, col); p(-6, 1, 12, 3, col); p(-4, 4, 8, 2, col); p(-2, 6, 4, 2, col);
    p(-6, -7, 2, 7, C.WHITE);
    p(-3, -2, 2, 2, C.WHITE); p(-1, 0, 2, 2, C.WHITE); p(1, -2, 2, 2, C.WHITE); p(3, -4, 2, 2, C.WHITE);
  }
  function drawHeart(x, y, col = C.RED) {
    rect(x + 1, y, 2, 1, C.BLACK); rect(x + 4, y, 2, 1, C.BLACK);
    rect(x, y + 1, 7, 3, C.BLACK); rect(x + 1, y + 4, 5, 1, C.BLACK); rect(x + 2, y + 5, 3, 1, C.BLACK); rect(x + 3, y + 6, 1, 1, C.BLACK);
    rect(x + 1, y + 1, 2, 3, col); rect(x + 4, y + 1, 2, 3, col); rect(x + 3, y + 2, 1, 2, col); rect(x + 2, y + 4, 3, 1, col);
    rect(x + 1, y + 1, 1, 1, C.WHITE);
  }
  function drawHouse(cx, bottomY, scale = .6) {
    cx = Math.round(cx); bottomY = Math.round(bottomY);
    const w = Math.round(56 * scale), h = Math.round(34 * scale), x = cx - Math.round(w / 2), y = bottomY - h;
    gameBox(x, y, w, h, C.WHITE, C.BLACK, C.BLACK, C.WHITE);
    const dw = Math.max(5, Math.round(13 * scale)), dh = Math.max(7, Math.round(20 * scale));
    gameBox(cx - Math.round(dw / 2), bottomY - dh, dw, dh, C.BLACK, C.BLACK); rect(cx - Math.round(dw / 2) + 1, bottomY - dh + 1, dw - 2, dh - 2, C.DPINK);
    const ww = Math.max(6, Math.round(12 * scale));
    gameBox(x + 3, y + 4, ww, ww, C.SPINK, C.BLACK); gameBox(x + w - 3 - ww, y + 4, ww, ww, C.SPINK, C.BLACK);
    const roofH = Math.round(24 * scale);
    for (let r = 0; r < roofH; r += 3) {
      const rw = Math.round((w + 14 * scale) * (1 - r / roofH)), rx = cx - Math.round(rw / 2);
      gameBox(rx, y - r - 2, rw, 4, r % 6 === 0 ? C.RED : C.DPINK, C.BLACK, null, C.SALMON);
    }
  }
  function drawCar(cx, by) {
    const x = cx - 20;
    gameBox(x + 7, by - 17, 24, 9, C.RED, C.BLACK, null, C.SALMON);
    rect(x + 10, by - 15, 8, 6, '#7fd3e6'); rect(x + 20, by - 15, 8, 6, '#7fd3e6');
    gameBox(x, by - 10, 40, 8, C.RED, C.BLACK, C.BLACK, C.SALMON);
    rect(x + 36, by - 8, 3, 2, C.YELLOW);
    for (const wx of [x + 6, x + 28]) { rect(wx, by - 4, 8, 5, C.BLACK); rect(wx + 2, by - 3, 4, 3, C.DGREY); }
  }
  function drawSparkle(x, y, col = C.YELLOW) {
    rect(x, y - 2, 1, 5, col); rect(x - 2, y, 5, 1, col); rect(x, y, 1, 1, C.WHITE);
  }
  function drawBed(cx, by) {
    gameBox(cx - 20, by - 10, 40, 8, C.WHITE, C.BLACK, C.BLACK); rect(cx - 19, by - 9, 12, 6, C.SPINK);
    rect(cx - 21, by - 18, 3, 18, C.BLACK); rect(cx + 18, by - 13, 3, 13, C.BLACK);
    rect(cx - 18, by - 2, 2, 2, C.BLACK); rect(cx + 16, by - 2, 2, 2, C.BLACK);
  }

  // ---- pixel dice (drawn into any 2D context) ----
  function drawDice(value, x, y, s) {
    gameBox(x, y, s, s, C.WHITE, C.BLACK, C.BLACK, C.WHITE);
    const pip = Math.max(2, Math.round(s / 7));
    const at = (fx, fy) => rect(x + Math.round(fx * s) - Math.floor(pip / 2), y + Math.round(fy * s) - Math.floor(pip / 2), pip, pip, value === 1 ? C.RED : C.BLACK);
    const L = .28, M = .5, R = .72;
    const map = {
      1: [[M, M]], 2: [[L, L], [R, R]], 3: [[L, L], [M, M], [R, R]],
      4: [[L, L], [R, L], [L, R], [R, R]], 5: [[L, L], [R, L], [M, M], [L, R], [R, R]],
      6: [[L, L], [R, L], [L, M], [R, M], [L, R], [R, R]]
    };
    (map[value] || map[1]).forEach(([a, b]) => at(a, b));
  }

  window.PX = {
    C, CAST, use, rect, gameBox, shadeOf, dither,
    drawBackground, drawFloor, drawChibi, drawCoin, drawBill, drawShield, drawHeart,
    drawHouse, drawCar, drawSparkle, drawBed, drawDice
  };
})();
