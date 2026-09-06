/* Local design instrumentation. dev.py is the only loader; no production hook.
 * Geometry is read from the rendered DOM, never from assumed column counts.
 * Everything drawn lives in a pointer-transparent shadow tree. */
(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  const state = Object.fromEntries(['grid', 'baseline', 'bounds', 'inspector'].map(k => [k, query.get(k) === '1']));
  const selectors = '.book, .running-head, nav, nav a, .wordmark, .given, .surname, .canopy, .canopy img, .spread, .leaf, .engineering-intro, .intro-copy, .section-title, .lead, .copy, .work, .work h3, .project-entry, .project, .project svg, .work p, .contact, .writing-list, .writing-item, .row, .title, .date, .dek, .writing-more, .archive-heading, .archive-intro, .archive-intro p, .archive-intro img, .post-list, .post-list article, .post-list article > div, .post-list h2, .post-list p, time, .reading, article, article h1, article h2, article h3, article p, article li, article img, article pre, .back, .book-footer';
  const $ = s => document.querySelector(s);
  const px = n => `${Math.round(n * 100) / 100}px`;
  const num = v => parseFloat(v) || 0;
  const box = e => e.getBoundingClientRect();
  const name = e => e.id ? `#${e.id}` : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  let host, root, svg, panel, metrics, details, comparison, tokens, picker;
  let selected, pinned, elements = [], queued = 0, observer;
  const active = () => Object.values(state).some(Boolean);
  function create() {
    if (host) return;
    host = document.createElement('design-inspector');
    host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    root = host.attachShadow({mode: 'open'});
    root.innerHTML = `<link rel="stylesheet" href="/debug/inspector.css">
      <svg aria-hidden="true"></svg>
      <aside class="panel" aria-label="Design inspector" hidden>
        <header><strong>Design inspector · local</strong><button id="dock" aria-label="Move panel to other side">↔</button><button id="close" aria-label="Hide inspector (I)">×</button></header>
        <div class="controls">
          <label><input type="checkbox" data-mode="grid">Grid G</label>
          <label><input type="checkbox" data-mode="baseline">Baseline B</label>
          <label><input type="checkbox" data-mode="bounds">Bounds O</label>
          <label>Step <input id="step" type="number" min="1" max="128" step="0.5" aria-label="Baseline step in CSS pixels">px</label>
        </div>
        <pre id="metrics"></pre>
        <div class="hint">Page coordinates in CSS px; scroll included. Hover or choose an element. P pins a reference. Escape clears all modes.</div>
        <select id="picker" aria-label="Inspect an element"><option value="">Hover an element…</option></select>
        <button id="pin">Pin reference (P)</button> <button id="unpin">Clear reference</button>
        <pre id="details"></pre><pre id="comparison"></pre>
        <details><summary>Current tokens</summary><pre id="tokens"></pre></details>
        <div class="hint">Grid labels mark box geometry. Text baselines use an isolated font probe; glyph ink and optical edges are different.</div>
      </aside>`;
    document.body.append(host);
    svg = root.querySelector('svg'); panel = root.querySelector('.panel');
    metrics = root.querySelector('#metrics'); details = root.querySelector('#details'); comparison = root.querySelector('#comparison'); tokens = root.querySelector('#tokens'); picker = root.querySelector('#picker');
    elements = Array.from(document.querySelectorAll(selectors));
    elements.forEach((e, i) => { const option = document.createElement('option'); option.value = i; option.textContent = `${i + 1}. ${name(e)} · ${e.textContent.trim().slice(0, 35)}`; picker.append(option); });
    root.querySelectorAll('[data-mode]').forEach(input => input.addEventListener('change', () => { state[input.dataset.mode] = input.checked; schedule(); }));
    root.querySelector('#step').addEventListener('input', e => { const n = Number(e.target.value); if (n >= 1 && n <= 128) { document.documentElement.style.setProperty('--debug-baseline', `${n}px`); schedule(); } });
    root.querySelector('#close').onclick = () => { state.inspector = false; schedule(); };
    root.querySelector('#dock').onclick = () => panel.classList.toggle('left');
    root.querySelector('#pin').onclick = pin;
    root.querySelector('#unpin').onclick = () => { pinned = null; schedule(); };
    picker.onchange = () => { selected = picker.value === '' ? null : elements[Number(picker.value)]; schedule(); };
    observer = new ResizeObserver(schedule);
    elements.forEach(e => observer.observe(e));
    new MutationObserver(schedule).observe(document.documentElement, {attributes: true, attributeFilter: ['style', 'class']});
    root.querySelector('link').addEventListener('load', schedule);
    document.fonts.ready.then(schedule);
  }
  function pin() { if (selected) { const r = box(selected); pinned = {name: name(selected), x: r.x + scrollX, y: r.y + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY}; schedule(); } }
  function draw(tag, attrs, label) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (label !== undefined) e.textContent = label;
    svg.append(e); return e;
  }
  function rect(r, cls) { draw('rect', {x: r.x, y: r.y, width: Math.max(0, r.width), height: Math.max(0, r.height), class: cls}); }
  function label(text, x, y) { draw('text', {x: Math.max(3, Math.min(innerWidth - text.length * 5.4, x)), y: Math.max(11, y)}, text); }
  function vertical(x, text, y = 14) { draw('line', {x1:x,x2:x,y1:0,y2:innerHeight,class:'anchor'}); label(`${text} ${px(x + scrollX)}`, x + 3, y); }
  function horizontal(y, text, left = 0, right = innerWidth, cls = 'anchor') { draw('line', {x1:left,x2:right,y1:y,y2:y,class:cls}); if (text && y >= 0 && y <= innerHeight) label(`${text} ${px(y + scrollY)}`,left + 3,y - 3); }
  function contentBox(e) {
    const r = box(e), s = getComputedStyle(e);
    const left = num(s.paddingLeft) + num(s.borderLeftWidth), right = num(s.paddingRight) + num(s.borderRightWidth);
    return {x:r.x + left,y:r.y + num(s.paddingTop) + num(s.borderTopWidth),width:r.width-left-right,height:r.height-num(s.paddingTop)-num(s.paddingBottom)-num(s.borderTopWidth)-num(s.borderBottomWidth)};
  }
  // Measure the first typographic baseline in a detached visual replica. No
  // markers enter site text or change its line wrapping / flex baseline.
  function baseline(e) {
    const s = getComputedStyle(e), probe = document.createElement('div');
    probe.className = 'probe';
    for (const prop of ['font-family','font-size','font-weight','font-style','font-stretch','font-variant','line-height','letter-spacing']) probe.style.setProperty(prop,s.getPropertyValue(prop));
    const marker = document.createElement('span');
    marker.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline';
    probe.append(document.createTextNode('Hg'),marker); root.append(probe);
    const offset = box(marker).top - box(probe).top; probe.remove();
    return contentBox(e).y + offset;
  }
  function rules(e) {
    const r = box(e), s = getComputedStyle(e);
    const after = getComputedStyle(e, '::after');
    const ruleWidth = num(after.borderBottomWidth);
    if (after.content !== 'none' && ruleWidth && after.borderBottomStyle !== 'none') {
      rect({x:r.x,y:r.bottom-num(after.marginBottom)-ruleWidth,width:r.width,height:ruleWidth},'rule');
    }
    for (const edge of ['Top','Bottom','Left','Right']) {
      const width = num(s[`border${edge}Width`]);
      if (!width || s[`border${edge}Style`] === 'none') continue;
      const horizontalEdge = edge === 'Top' || edge === 'Bottom';
      rect({x:r.x+(edge==='Right'?r.width-width:0),y:r.y+(edge==='Bottom'?r.height-width:0),width:horizontalEdge?r.width:width,height:horizontalEdge?width:r.height},'rule');
    }
  }
  function density(e) {
    const c = contentBox(e), children = Array.from(e.children);
    const end = Math.max(c.y, ...children.map(child=>box(child).bottom));
    return `${px(end-c.y)} used / ${px(c.height)} high; ${e.textContent.replace(/\s+/g,' ').trim().length} chars`;
  }
  function render() {
    queued = 0;
    if (!active()) { if (host) host.hidden = true; return; }
    create(); host.hidden = false; panel.hidden = !state.inspector;
    // :host is fixed, so no page styles, hit targets, or scroll dimensions change.
    svg.replaceChildren();
    root.querySelectorAll('[data-mode]').forEach(e => { e.checked = state[e.dataset.mode]; });
    const step = Math.max(1, num(getComputedStyle(document.documentElement).getPropertyValue('--debug-baseline')) || 8);
    if (root.activeElement !== root.querySelector('#step')) root.querySelector('#step').value = step;
    if (state.baseline) {
      for (let y = -(scrollY % step); y < innerHeight; y += step) horizontal(y, '', 0, innerWidth, 'baseline');
      label(`BASELINE · ${px(step)} · origin document y=0`, 6, innerHeight-10);
    }
    const book = $('.book'); if (!book) return;
    const b = box(book), c = contentBox(book), s = getComputedStyle(book);
    const spread = $('.spread'), grid = spread || $('.archive-intro'), hero = $('.canopy img, .archive-intro img');
    let columns = [], gutter = null, divider = null;
    if (grid) {
      const gs = getComputedStyle(grid), g = box(grid);
      columns = Array.from(grid.children).map(contentBox);
      const sameRow = columns.length === 2 && Math.abs(columns[0].y-columns[1].y) < 1;
      if (sameRow) gutter = columns[1].x - columns[0].x - columns[0].width;
      if (spread) {
        const ps = getComputedStyle(spread, '::before');
        divider = {x:g.x + num(ps.left), y:g.y + num(ps.top), width:num(ps.width),height:g.height-num(ps.top)-num(ps.bottom),color:ps.backgroundColor};
      }
      if (state.grid) {
        columns.forEach(r=>rect(r,'grid'));
        if (sameRow) rect({x:columns[0].x+columns[0].width,y:g.y,width:gutter,height:g.height},'gutter');
        // Track coordinates also show the distinction between CSS tracks and padded text measures.
        let x=g.x;
        gs.gridTemplateColumns.split(' ').forEach(track=> { vertical(x, 'TRACK', 86); x += num(track) + num(gs.columnGap); });
      }
    }
    if (state.grid) {
      rect(b,'grid'); rect(c,'grid');
      rect({x:0,y:b.y,width:Math.max(0,b.x),height:b.height},'gutter');
      rect({x:b.right,y:b.y,width:Math.max(0,innerWidth-b.right),height:b.height},'gutter');
      vertical(b.left,'PAGE LEFT',14); vertical(b.right,'PAGE RIGHT',26);
      vertical(c.x,'CONTENT LEFT',38); vertical(c.x+c.width,'CONTENT RIGHT',50);
      vertical(b.x+b.width/2,'CENTERLINE',62);
      if (hero) { const h=box(hero); rect(h,'grid'); vertical(h.x,'IMAGE LEFT',98); vertical(h.right,'IMAGE RIGHT',110); horizontal(h.y,'IMAGE TOP',h.x,h.right); horizontal(h.bottom,'IMAGE BOTTOM',h.x,h.right); }
      const start = spread || $('.post-list, .reading');
      if (start) horizontal(box(start).y,'CONTENT START',c.x,c.x+c.width);
      if (divider) { rect(divider,'rule'); vertical(divider.x,'COLUMN DIVIDER',74); }
      document.querySelectorAll('.wordmark .given, .wordmark .surname, .section-title, .lead, .copy, .work h3, .work .project, .work p, .contact a, .writing-item .title, .date, .dek, .writing-more, .post-list h2, time, article h1').forEach(e=> {
        const r=box(e); if(r.bottom<0 || r.top>innerHeight)return;
        horizontal(baseline(e),e.matches('.given, .surname')?'MASTHEAD BASELINE '+name(e):'BASELINE '+name(e),r.x,r.right,'type-baseline');
      });
      elements.forEach(rules);
    }
    if (state.bounds) { elements.forEach(e => {const r=box(e);if(r.bottom>=0&&r.top<=innerHeight)rect(r,'bound');}); if(divider)rect(divider,'rule'); }
    if (state.inspector) {
      const h = hero && box(hero), gs = grid && getComputedStyle(grid);
      metrics.textContent = [
        `Viewport ${px(innerWidth)} × ${px(innerHeight)} (DPR ${devicePixelRatio})`,
        `Page ${px(b.width)} / max ${s.maxWidth}`,
        `Outer margins L ${px(b.left)} / R ${px(innerWidth-b.right)}`,
        `Inner padding L ${s.paddingLeft} / R ${s.paddingRight}`,
        `Container ${px(c.width)} · x ${px(c.x+scrollX)}`,
        `CSS tracks ${gs ? gs.gridTemplateColumns : 'single reading column'}`,
        `Text widths L ${columns[0]?px(columns[0].width):'n/a'} / R ${columns[1]?px(columns[1].width):'n/a'}`,
        `Gutter ${gutter===null?'n/a (single/stacked)':px(gutter)}${spread?' (column padding)':''}`,
        `Hero ${h?px(h.width)+' × '+px(h.height):'n/a'}`,
        `Divider x ${divider?px(divider.x+scrollX)+' · '+px(divider.width)+' · '+divider.color:'n/a'}`,
        ...Array.from(document.querySelectorAll('.leaf')).map((e,i)=>`${i?'Right':'Left'} density: ${density(e)}`),
      ].join('\n');
      if (selected) {
        const r=box(selected), cs=getComputedStyle(selected);rect(r,'selected');
        details.textContent = `${name(selected)}\nx ${px(r.x+scrollX)} · y ${px(r.y+scrollY)}\nw ${px(r.width)} · h ${px(r.height)}\n` + ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','text-align','color','background-color','opacity','margin','padding','border-top','border-right','border-bottom','border-left','object-fit','object-position'].map(k=>`${k}: ${cs.getPropertyValue(k)}`).join('\n');
        if (pinned) comparison.textContent = `Reference ${pinned.name} (snapshot)\nΔ left ${px(r.x+scrollX-pinned.x)} · Δ top ${px(r.y+scrollY-pinned.y)}\nGap after reference: x ${px(r.x+scrollX-pinned.right)} · y ${px(r.y+scrollY-pinned.bottom)}`;
        else comparison.textContent = '';
      } else details.textContent = 'Hover or select an element for exact properties.';
      const rs=getComputedStyle(document.documentElement);
      tokens.textContent = Array.from(rs).filter(k=>k.startsWith('--')).sort().map(k=>`${k}: ${rs.getPropertyValue(k).trim()}`).join('\n');
    }
  }
  function schedule() { if (!queued && (host || active())) queued = requestAnimationFrame(render); }
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const target = e.composedPath()[0];
    if (target.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
    const mode = {g:'grid',b:'baseline',o:'bounds',i:'inspector'}[e.key.toLowerCase()];
    if (mode) { state[mode] = !state[mode]; schedule(); }
    else if (e.key.toLowerCase()==='p' && state.inspector) pin();
    else if (e.key==='Escape') { Object.keys(state).forEach(k=>state[k]=false); schedule(); }
  });
  document.addEventListener('pointermove', e => {
    if (!state.inspector || e.target === host || picker.value !== '') return;
    const candidate=e.target.closest?.(selectors);
    if(candidate && candidate!==selected) { selected=candidate;schedule(); }
  }, {passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('load',schedule,true);
  schedule();
})();
