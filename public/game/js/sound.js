/* =============================================================================
 * THE GAME OF LIFE — 8-BIT SOUND (WebAudio, no external files)
 * Exposes window.SFX
 * ========================================================================== */
(function () {
  'use strict';
  let ac = null, muted = false;
  try { muted = localStorage.getItem('gol_muted') === '1'; } catch (e) { /* ignore */ }

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur, { type = 'square', vol = .08, at = 0, slide = 0 } = {}) {
    if (muted) return;
    const a = ensure(); if (!a) return;
    const t0 = a.currentTime + at;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
  }
  function noise(dur, { vol = .05, at = 0 } = {}) {
    if (muted) return;
    const a = ensure(); if (!a) return;
    const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = buf; g.gain.value = vol;
    s.connect(g).connect(a.destination); s.start(a.currentTime + at);
  }

  const SFX = {
    unlock() { ensure(); },
    click() { tone(660, .05, { vol: .05 }); },
    coin() { tone(988, .06); tone(1319, .14, { at: .06 }); },
    coins(n = 4) { for (let i = 0; i < n; i++) { tone(988, .05, { at: i * .07, vol: .05 }); tone(1319, .08, { at: i * .07 + .04, vol: .05 }); } },
    pay() { tone(523, .06, { vol: .05 }); tone(392, .1, { at: .06, vol: .05 }); },
    bad() { tone(392, .12, { type: 'sawtooth', vol: .06 }); tone(311, .12, { at: .12, type: 'sawtooth', vol: .06 }); tone(233, .3, { at: .24, type: 'sawtooth', vol: .06, slide: -60 }); },
    shield() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .1, { at: i * .07, type: 'triangle', vol: .1 })); },
    dice() { for (let i = 0; i < 8; i++) noise(.03, { at: i * .07, vol: .06 }); },
    diceLand() { tone(220, .08, { vol: .08 }); tone(880, .12, { at: .08 }); },
    pop() { tone(440, .04, { vol: .05, slide: 400 }); },
    good() { [523, 659, 784].forEach((f, i) => tone(f, .1, { at: i * .08 })); },
    fanfare() { [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i === 6 ? .4 : .12, { at: i * .12, vol: .09 })); },
    sad() { [392, 349, 330, 262].forEach((f, i) => tone(f, .25, { at: i * .22, type: 'triangle', vol: .1 })); },
    step() { tone(180, .03, { vol: .03, type: 'triangle' }); },
    isMuted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem('gol_muted', muted ? '1' : '0'); } catch (e) { /* ignore */ } return muted; }
  };
  window.SFX = SFX;
})();
