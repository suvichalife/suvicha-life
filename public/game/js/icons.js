/* =============================================================================
 * THE GAME OF LIFE — PIXEL ICONS
 * Hand-drawn pixel-art icons rendered as crisp inline SVG, so the game never
 * falls back to the OS emoji font (which looks different on every phone).
 * Exposes window.ICON.html(name, { px, cls })
 * ========================================================================== */
(function () {
  'use strict';

  // palette letters used in the grids below ('.' = transparent, 'c' = current text colour)
  const PAL = {
    k: '#293239', r: '#d21245', p: '#e37995', s: '#fe7b83', y: '#fed820', o: '#c98f00',
    g: '#37db68', d: '#10505a', w: '#ffffff', l: '#e5e5e5', b: '#4844ce', n: '#8b9891', c: 'currentColor'
  };

  // triangle helpers (rows of widths)
  const tri = rows => rows.map(n => 'c'.repeat(n) + '.'.repeat(4 - n));
  const triL = rows => rows.map(n => '.'.repeat(4 - n) + 'c'.repeat(n));
  const up = ['...c...', '..ccc..', '.ccccc.', 'ccccccc'];

  const ICONS = {
    heart: [
      '.kkk.kkk.',
      'krwrkrrrk',
      'krrrrrrrk',
      'krrrrrrrk',
      '.krrrrrk.',
      '..krrrk..',
      '...krk...',
      '....k....'
    ],
    smile: [
      '..kkkkk..',
      '.kyyyyyk.',
      'kyyyyyyyk',
      'kykyyykyk',
      'kyyyyyyyk',
      'kykyyykyk',
      'kyykkkyyk',
      '.kyyyyyk.',
      '..kkkkk..'
    ],
    die: [
      'kkkkkkkkk',
      'kwwwwwwwk',
      'kwkwwwkwk',
      'kwwwwwwwk',
      'kwwwkwwwk',
      'kwwwwwwwk',
      'kwkwwwkwk',
      'kwwwwwwwk',
      'kkkkkkkkk'
    ],
    cash: [
      'kkkkkkkkkkk',
      'kgggggggggk',
      'kgggkkkgggk',
      'kggkyyykggk',
      'kgggkkkgggk',
      'kgggggggggk',
      'kkkkkkkkkkk'
    ],
    coin: [
      '..kkkkk..',
      '.kyyyyyk.',
      'kyyyoyyyk',
      'kyyoyyyyk',
      'kyyyoyyyk',
      'kyyyyoyyk',
      'kyyyoyyyk',
      '.kyyyyyk.',
      '..kkkkk..'
    ],
    shield: [
      'kkkkkkkkk',
      'kbbbbbbbk',
      'kbwwbbbbk',
      'kbwbbbbbk',
      'kbbbbbbbk',
      '.kbbbbbk.',
      '..kbbbk..',
      '...kbk...',
      '....k....'
    ],
    hospital: [
      'kkkkkkkkk',
      'kwwwwwwwk',
      'kwwwrwwwk',
      'kwwwrwwwk',
      'kwrrrrrwk',
      'kwwwrwwwk',
      'kwwwrwwwk',
      'kwwwwwwwk',
      'kkkkkkkkk'
    ],
    ribbon: [
      '...kkk...',
      '..kpppk..',
      '.kppkppk.',
      '.kpk.kpk.',
      '..kpkpk..',
      '...kpk...',
      '..kpkpk..',
      '.kpk.kpk.',
      '.kkk.kkk.'
    ],
    bandage: [
      '.kkkkkkkkk.',
      'ksssssssssk',
      'ksskwwwkssk',
      'ksskwkwkssk',
      'ksskwwwkssk',
      'ksssssssssk',
      '.kkkkkkkkk.'
    ],
    warn: [
      '....k....',
      '...kyk...',
      '..kykyk..',
      '.kyykyyk.',
      '.kyykyyk.',
      'kyyyyyyyk',
      'kyyykyyyk',
      'kyyyyyyyk',
      'kkkkkkkkk'
    ],
    check: [
      '......cc',
      '.....cc.',
      'c...cc..',
      'cc.cc...',
      '.ccc....',
      '..c.....'
    ],
    speaker: [
      '....k......',
      '...kk...k..',
      'kkkkk....k.',
      'kkkkk.k..k.',
      'kkkkk.k..k.',
      'kkkkk.k..k.',
      'kkkkk....k.',
      '...kk...k..',
      '....k......'
    ],
    mute: [
      '....k......',
      '...kk......',
      'kkkkk.r...r',
      'kkkkk..r.r.',
      'kkkkk...r..',
      'kkkkk..r.r.',
      'kkkkk.r...r',
      '...kk......',
      '....k......'
    ],
    play: tri([1, 2, 3, 4, 3, 2, 1]),
    rewind: triL([1, 2, 3, 4, 3, 2, 1]).map(r => r + '.' + r),
    up: up,
    down: up.slice().reverse(),
    rotate: [
      '..kkkkkk..',
      '.k......k.',
      'k...kkk..k',
      'k...k.k..k',
      'k...kkk..k',
      'kk.......k',
      '.kk.....k.',
      '..kkkkkk..'
    ]
  };

  const cache = {};
  function build(name) {
    const g = ICONS[name]; if (!g) return null;
    const h = g.length, w = g[0].length;
    let rects = '';
    g.forEach((row, y) => {
      let x = 0;
      while (x < w) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') { x++; continue; }
        let x2 = x + 1;
        while (x2 < w && row[x2] === ch) x2++;
        rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${PAL[ch] || '#000'}"/>`;
        x = x2;
      }
    });
    return { w, h, rects };
  }

  function html(name, opt) {
    const o = opt || {};
    const px = o.px || 2;
    const b = cache[name] || (cache[name] = build(name));
    if (!b) return '';
    return `<svg class="pxi ${o.cls || ''}" width="${b.w * px}" height="${b.h * px}" viewBox="0 0 ${b.w} ${b.h}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${b.rects}</svg>`;
  }

  window.ICON = { html, names: Object.keys(ICONS) };
})();
