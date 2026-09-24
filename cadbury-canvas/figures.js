// Scripted figures for the Cadbury Canvas document. Runs in Chromium before printing.
(function () {
  const C = { navy: '#262B5F', red: '#AE3A2F', gold: '#D29A2E', goldInk: '#9A6B12', ink: '#2F2F35', muted: '#6B6B73', sand: '#C9B793', wash: '#EEEEF3' };
  const NS = 'http://www.w3.org/2000/svg';

  // deterministic PRNG so every build draws the same wobble
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // hand-drawn rounded rectangle path, in the style of the v1 panels
  function roughRect(x, y, w, h, r, seed, amp = 1.1) {
    const R = rng(seed), pts = [];
    const step = 9;
    const edge = (x0, y0, x1, y1) => {
      const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / step));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        pts.push([x0 + (x1 - x0) * t + (R() - .5) * amp, y0 + (y1 - y0) * t + (R() - .5) * amp]);
      }
    };
    const arc = (cx, cy, a0) => { for (let k = 0; k < 4; k++) { const a = a0 + k * Math.PI / 8; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    edge(x + r, y, x + w - r, y); arc(x + w - r, y + r, -Math.PI / 2);
    edge(x + w, y + r, x + w, y + h - r); arc(x + w - r, y + h - r, 0);
    edge(x + w - r, y + h, x + r, y + h); arc(x + r, y + h - r, Math.PI / 2);
    edge(x, y + h - r, x, y + r); arc(x + r, y + r, Math.PI);
    return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z';
  }

  function svg(el, w, h) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('width', '100%');
    s.style.display = 'block'; s.style.overflow = 'visible';
    el.appendChild(s); return s;
  }
  function add(s, tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    s.appendChild(e); return e;
  }
  const sans = { 'font-family': 'Figtree', 'font-size': 9.6, fill: C.ink };
  const serif = { 'font-family': 'Fraunces', 'font-weight': 650 };
  const hand = { 'font-family': 'Caveat', 'font-weight': 500, 'font-size': 17 };
  function cap(el, text) { const d = document.createElement('div'); d.className = 'cap'; d.textContent = text; el.appendChild(d); }

  // ---------------- price ladder ----------------
  function ladder() {
    const el = document.getElementById('ladder'); if (!el) return;
    const W = 650, H = 200, y0 = 128, x = v => 22 + v / 700 * 604;
    const s = svg(el, W, H);
    add(s, 'text', { ...hand, x: 4, y: 16, fill: C.red }, 'entry tiers win customers');
    add(s, 'text', { ...hand, x: W - 4, y: 16, fill: C.navy, 'text-anchor': 'end' }, 'premium tiers keep full price');
    add(s, 'line', { x1: x(0), y1: y0, x2: x(700) + 8, y2: y0, stroke: C.sand, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' });
    for (let v = 0; v <= 700; v += 100) {
      add(s, 'line', { x1: x(v), y1: y0 - 5, x2: x(v), y2: y0 + 5, stroke: C.sand, 'stroke-width': 1.2 });
      add(s, 'text', { ...sans, 'font-size': 8.6, fill: C.muted, x: x(v), y: y0 + 19, 'text-anchor': 'middle' }, '₹' + v);
    }
    // wedding and corporate band
    const b = add(s, 'image', { href: 'assets/gold-blob.png', x: x(229), y: y0 - 9, width: x(279) - x(229), height: 18, preserveAspectRatio: 'none' });
    add(s, 'line', { x1: x(254), y1: y0 + 9, x2: x(254), y2: y0 + 40, stroke: C.gold, 'stroke-width': 1.4 });
    add(s, 'text', { ...sans, 'font-size': 9, 'font-weight': 600, fill: C.goldInk, x: x(254) - 30, y: y0 + 54 }, 'Wedding and corporate volume, ₹229–279 per bar');
    // reference products
    [[40, 'Dairy Milk 52g', 34], [109, 'Silk 46g', 48]].forEach(([v, t, dy]) => {
      add(s, 'circle', { cx: x(v), cy: y0, r: 5, fill: '#fff', stroke: C.muted, 'stroke-width': 1.3 });
      add(s, 'text', { ...sans, 'font-size': 8.4, 'font-style': 'italic', fill: C.muted, x: x(v) + (v === 40 ? -12 : 0), y: y0 + dy }, t);
    });
    // tiers
    const tiers = [
      [49, 'Taste bite', '₹49', 42, C.red], [149, 'Everyday bar', '₹149', 76, C.red], [349, 'Signature bar', '₹349', 42, C.navy],
      [424, 'Gift, delivered', '₹399–449', 76, C.navy, [399, 449]], [574, 'Limited edition', '₹549–599', 42, C.navy], [699, 'Gift edition', '₹699', 76, C.navy]];
    tiers.forEach(([v, name, p, h, col, range]) => {
      if (range) add(s, 'line', { x1: x(range[0]), y1: y0, x2: x(range[1]), y2: y0, stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .35 });
      add(s, 'line', { x1: x(v), y1: y0, x2: x(v), y2: y0 - h, stroke: col, 'stroke-width': 1.6 });
      add(s, 'circle', { cx: x(v), cy: y0, r: 6.5, fill: col });
      const anchor = v > 650 ? 'end' : 'middle', tx = v > 650 ? x(v) + 8 : x(v);
      add(s, 'text', { ...sans, 'font-size': 9.4, 'font-weight': 500, x: tx, y: y0 - h - 18, 'text-anchor': anchor }, name);
      add(s, 'text', { ...serif, 'font-size': 10, fill: col, x: tx, y: y0 - h - 6, 'text-anchor': anchor }, p);
    });
    cap(el, 'The price ladder against Dairy Milk and Silk. Entry tiers win customers; premium tiers keep full price.');
  }

  // ---------------- campaign calendar ----------------
  function calendar() {
    const el = document.getElementById('cal'); if (!el) return;
    const W = 650, H = 246, cy = 96, ch = 30, x0 = 6, cw = (W - 12) / 12;
    const s = svg(el, W, H);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m, i) => {
      add(s, 'rect', { x: x0 + i * cw + 2, y: cy, width: cw - 4, height: ch, rx: 3, fill: i % 2 ? '#E9E9F0' : '#DEDFE9' });
      add(s, 'text', { ...serif, 'font-size': 10, fill: C.navy, x: x0 + i * cw + cw / 2, y: cy + 19.5, 'text-anchor': 'middle' }, m);
    });
    // [month index, label, side (-1 above / 1 below), stem length, flagship]
    const occ = [
      [0, 'Republic Day, Pongal', 1, 18], [1, "Valentine's Week", -1, 26], [2, "Holi, Women's Day", 1, 42],
      [4, "Mother's Day", -1, 44, 1], [5, "Father's Day", 1, 18], [6, 'Friendship Day', 1, 42],
      [7, 'Rakhi', -1, 26, 1], [8, "Ganesh, Teacher's Day", 1, 18], [9, 'Navratri, Durga Puja', -1, 44],
      [10, 'Diwali, corporate gifting', 1, 42, 1], [11, 'Christmas', -1, 26]];
    occ.forEach(([i, t, side, len, flag]) => {
      const cx = x0 + i * cw + cw / 2, ya = side < 0 ? cy : cy + ch, yb = ya + side * len, col = flag ? C.gold : C.red;
      add(s, 'line', { x1: cx, y1: ya, x2: cx, y2: yb, stroke: col, 'stroke-width': 1.5 });
      add(s, 'circle', { cx, cy: yb, r: flag ? 4.6 : 3.6, fill: col });
      let anchor = 'middle', tx = cx;
      if (i === 0) { anchor = 'start'; tx = cx - 20; }
      if (i >= 10) { anchor = 'end'; tx = cx + 22; }
      add(s, 'text', { ...sans, 'font-size': 8.8, 'font-weight': flag ? 650 : 450, fill: flag ? C.goldInk : C.ink, x: tx, y: side < 0 ? yb - 8 : yb + 15, 'text-anchor': anchor }, t);
    });
    add(s, 'text', { ...hand, 'font-size': 15, fill: C.navy, x: x0 + 3 * cw - 38, y: 30, transform: `rotate(-3 ${x0 + 3 * cw} 30)` }, 'Eid moves each year, so it is placed by date');
    add(s, 'text', { ...hand, 'font-size': 15, fill: C.goldInk, x: W - 4, y: 30, 'text-anchor': 'end' }, 'gold: the three flagship bursts');
    // wedding seasons and the all-year base
    const yw = 212;
    [[0, 3], [9, 12]].forEach(([a, b]) => {
      add(s, 'line', { x1: x0 + a * cw + 4, y1: yw, x2: x0 + b * cw - 4, y2: yw, stroke: C.gold, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .8 });
      add(s, 'text', { ...sans, 'font-size': 8.6, fill: C.goldInk, x: x0 + (a + b) / 2 * cw, y: yw - 7, 'text-anchor': 'middle' }, 'wedding season');
    });
    add(s, 'line', { x1: x0, y1: yw + 16, x2: W - 6, y2: yw + 16, stroke: C.red, 'stroke-width': 1.5, 'stroke-dasharray': '7 5' });
    add(s, 'text', { ...sans, 'font-size': 8.6, 'font-style': 'italic', fill: C.red, x: W / 2, y: yw + 11, 'text-anchor': 'middle' }, 'birthdays and anniversaries, all year');
    cap(el, 'The campaign calendar. Every month carries an occasion, a drop and a short production run.');
  }

  // ---------------- phase plan ----------------
  function gantt() {
    const el = document.getElementById('gantt'); if (!el) return;
    const W = 650, H = 206, L = 128, R = 640, x = m => L + (m / 34) * (R - L);
    const s = svg(el, W, H);
    add(s, 'text', { ...hand, 'font-size': 15.5, fill: C.red, x: x(1), y: 14 }, 'each phase is earned by the one before');
    [0, 4, 8, 13, 17, 22, 26, 30, 34].forEach(m => {
      const key = [0, 4, 13, 22, 34].includes(m);
      add(s, 'line', { x1: x(m), y1: 22, x2: x(m), y2: 176, stroke: key ? C.sand : '#E3DCCB', 'stroke-width': 1, 'stroke-dasharray': '2 3' });
      if (key) add(s, 'text', { ...sans, 'font-size': 8.6, fill: C.muted, x: x(m), y: 190, 'text-anchor': 'middle' }, m);
    });
    add(s, 'text', { ...sans, 'font-size': 8.6, 'font-style': 'italic', fill: C.muted, x: R, y: 203, 'text-anchor': 'end' }, 'months');
    const rows = [
      ['Phase 0', 'Create from anywhere', 0, 4, C.gold, 'app, campaign, small batches', 1],
      ['Phase 1', 'Counters on evidence', 4, 13, C.red, '12 owned counters'],
      ['Phase 2', 'Qualified partners', 13, 22, C.red, 'capped per city'],
      ['Phase 3', 'Flexible production', 22, 34, C.navy, 'Canvas winners on national lines'],
      ['Production track', 'Runs from day one', 0, 34, '#B3B4C8', 'changeover costs, short runs, pilot batches at Thane, small-batch fulfilment', 0, C.navy]];
    rows.forEach(([name, sub, a, b, col, t, outside, tc], i) => {
      const y = 28 + i * 30;
      add(s, 'text', { ...serif, 'font-size': 10.2, fill: i === 4 ? C.navy : C.red, x: 0, y: y + 10 }, name);
      add(s, 'text', { ...sans, 'font-size': 7.8, fill: C.ink, x: 0, y: y + 21 }, sub);
      add(s, 'path', { d: roughRect(x(a) + 1.5, y, x(b) - x(a) - 3, 22, 4, 17 + i * 31, 1.4), fill: col });
      if (outside) add(s, 'text', { ...sans, 'font-size': 8.6, 'font-weight': 600, fill: C.goldInk, x: x(b) + 6, y: y + 14.5 }, t);
      else add(s, 'text', { ...sans, 'font-size': 8.6, 'font-weight': 600, fill: tc || '#fff', x: (x(a) + x(b)) / 2, y: y + 14.5, 'text-anchor': 'middle' }, t);
    });
    cap(el, 'Thirty-four months, four phases, and a production track that runs from day one.');
  }

  // ---------------- gates ----------------
  function gates() {
    const el = document.getElementById('gates'); if (!el) return;
    const W = 650, H = 262, n = 7, gw = W / n, base = 214;
    const s = svg(el, W, H);
    const g = [
      ['Do people design?', 'Designs started and completed, per burst and city'],
      ['Do they pay?', 'Design-to-order conversion; order value against ₹399–449'],
      ['Do they send it on?', 'Gift links per order; recipients who then design'],
      ['Do they come back?', 'Repeat across occasions; saved-recipe reorders'],
      ['Do people stop and buy?', 'Counter conversion against the demand that sited it'],
      ['Does it run reliably?', 'Uptime, refills, discarded bars, queue time'],
      ['Does it make money?', 'Contribution per counter and per order']];
    g.forEach(([q, m], i) => {
      const h = 78 + i * 15, x = i * gw + 3, y = base - h, w = gw - 6, p0 = i < 4, col = p0 ? C.red : C.navy;
      add(s, 'path', { d: roughRect(x, y, w, h, 5, 101 + i * 13, 1.5), fill: p0 ? '#F1E0DC' : '#E4E8F0', stroke: col, 'stroke-width': 1.6 });
      wrap(s, q, x + 1, y - 22, w - 2, 9, { ...sans, 'font-size': 8.3, 'font-weight': 650, fill: C.ink }, 2, true);
      add(s, 'text', { ...serif, 'font-size': 19, fill: col, x: x + 8, y: y + 24 }, i + 1);
      wrap(s, m, x + 8, y + 42, w - 14, 10.4, { ...sans, 'font-size': 8, fill: C.ink }, 5);
    });
    add(s, 'line', { x1: 3, y1: base + 8, x2: 4 * gw - 3, y2: base + 8, stroke: C.red, 'stroke-width': 2.2 });
    add(s, 'line', { x1: 4 * gw + 3, y1: base + 8, x2: W - 3, y2: base + 8, stroke: C.navy, 'stroke-width': 2.2 });
    add(s, 'text', { ...serif, 'font-style': 'italic', 'font-size': 9.6, fill: C.red, x: 2 * gw, y: base + 24, 'text-anchor': 'middle' }, 'Phase 0 · online, months 0 to 4');
    add(s, 'text', { ...serif, 'font-style': 'italic', 'font-size': 9.6, fill: C.navy, x: 5.5 * gw, y: base + 24, 'text-anchor': 'middle' }, 'Phase 1 · counters, months 4 to 13');
    add(s, 'text', { ...hand, 'font-size': 15, fill: C.red, x: 2, y: 64, transform: 'rotate(-3 2 64)' }, 'a weak gate: change one thing, run the next drop');
    cap(el, 'Phase 0 is judged on gates 1 to 4, Phase 1 on 5 to 7. Each is a review point, not an automatic stop.');
  }

  // naive word-wrap for SVG text; `up` grows the block upwards from y
  function wrap(s, text, x, y, w, lh, attrs, maxLines, up) {
    const words = text.split(' '), lines = []; let cur = '';
    const probe = add(s, 'text', { ...attrs, x: -999, y: -999 });
    for (const wd of words) {
      probe.textContent = cur ? cur + ' ' + wd : wd;
      if (probe.getComputedTextLength() > w && cur) { lines.push(cur); cur = wd; } else cur = probe.textContent;
    }
    if (cur) lines.push(cur); probe.remove();
    const ls = lines.slice(0, maxLines), top = up ? y - (ls.length - 1) * lh : y;
    ls.forEach((l, k) => add(s, 'text', { ...attrs, x, y: top + k * lh }, l));
  }

  function toc() {
    const pages = window.TOC_PAGES || {};
    document.querySelectorAll('.toc .pg').forEach(e => { e.textContent = pages[e.dataset.for] || ''; });
  }

  window.buildFigures = function () { ladder(); calendar(); gantt(); gates(); toc(); };
})();
