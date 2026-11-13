/* Colour themes for The Build, and the source the section picker reads. Load in <head> without defer so the
   theme is set before first paint. Choice order: ?theme= in the URL (previews and shared links), then the
   choice made in this tab (sessionStorage "m3-theme"), then the page default, then Harbour. A fresh visit always opens in Harbour. Never switches by time of day.
   Every accent below passes 4.5:1 as text on its own paper colour. */
(function () {
  var THEMES = [
    { id: 'diary',    name: 'Site Diary',         note: 'Warm paper, ink and rust',            dark: false,
      t: { glow: '#D98A2B', paper: '#F4EFE6', 'paper-2': '#ECE5D6', field: '#FBF8F2', ink: '#221F1A', 'ink-2': '#5B554B', 'ink-3': '#7E776B', rust: '#B5471F', 'rust-2': '#953A17', moss: '#4E5A3A', rule: '#D9D0C0', 'rule-2': '#C4B9A3' } },
    { id: 'harbour',  name: 'Harbour',            note: 'Cool white, navy and sea blue',       dark: false,
      t: { glow: '#2FA4C2', paper: '#F1F3F4', 'paper-2': '#E3E8EB', field: '#F9FAFB', ink: '#13233A', 'ink-2': '#45546A', 'ink-3': '#66758A', rust: '#1F5F8B', 'rust-2': '#174B6F', moss: '#3F6B5C', rule: '#D3D9DE', 'rule-2': '#B3BEC8' } },
    { id: 'eucalypt', name: 'Eucalypt',           note: 'Pale sage, charcoal and leaf green',  dark: false,
      t: { glow: '#9AAE5C', paper: '#EFF1EA', 'paper-2': '#E2E6DA', field: '#F7F8F3', ink: '#1D261F', 'ink-2': '#4C5A4F', 'ink-3': '#6C786E', rust: '#4C6A38', 'rust-2': '#3B5329', moss: '#7A5A3A', rule: '#D2D8CA', 'rule-2': '#B5BEAA' } },
    { id: 'outback',  name: 'Outback',            note: 'Sand, red earth and saltbush',        dark: false,
      t: { glow: '#D9852B', paper: '#F6EDE3', 'paper-2': '#EDDFCF', field: '#FBF5EE', ink: '#2A1C14', 'ink-2': '#5E4A3C', 'ink-3': '#7E6B5B', rust: '#A3391D', 'rust-2': '#842C15', moss: '#5F6B3A', rule: '#E0CFBC', 'rule-2': '#C9B39A' } },
    { id: 'brass',    name: 'Charcoal and brass', note: 'Stone, charcoal and aged brass',      dark: false,
      t: { glow: '#C29A4E', paper: '#F3F1EC', 'paper-2': '#E6E2D9', field: '#FAF9F6', ink: '#1B1B1B', 'ink-2': '#4F4C47', 'ink-3': '#706C65', rust: '#7F6126', 'rust-2': '#634B1C', moss: '#3E4A44', rule: '#D9D4C9', 'rule-2': '#BDB5A6' } },
    { id: 'night',    name: 'Night edition',      note: 'Dark paper, cream ink and ember',     dark: true,
      t: { glow: '#F2B66B', paper: '#15130F', 'paper-2': '#1E1B16', field: '#221F1A', ink: '#EFE8DA', 'ink-2': '#C2B8A6', 'ink-3': '#9A9183', rust: '#E58A5F', 'rust-2': '#F0A47F', moss: '#A8B994', rule: '#3A342C', 'rule-2': '#4D463B',
           deep: '#0B0A08', 'on-deep-hi': '#F7F1E6', 'on-deep': '#EFE8DA', 'on-deep-2': '#C2B8A6', 'on-deep-3': '#9A9183', 'on-deep-accent': '#E58A5F' } }
  ];
  window.M3_THEMES = THEMES;
  /* component fixes that tokens alone cannot express */
  var fix = document.createElement('style');
  fix.textContent =
    '[data-theme=night] #projects .pj-plan{background:#EFE8DA}' +
    '[data-theme=night] #layers{--blue:#8FB0DC}' +
    '[data-theme=night] #sketch{--sk-table:#0B0A08;--sk-text:#EFE8DA;--sk-dim:rgba(239,232,218,.72);--sk-line:rgba(239,232,218,.22);--sk-soft:rgba(239,232,218,.08)}' +
    '[data-theme=night] #sketch .sk-sheet{background:#1F1C17}' +
    '[data-theme=night] #sketch .sk-thumb{background:#EFE8DA}' +
    '[data-theme=night] #sketch .sk-seg input:checked + *{color:#15130F}';
  document.head.appendChild(fix);
  /* Custom: two colours in, a full readable palette out. The main colour is darkened until it passes 4.5:1
     as text on the page background; the second colour is only used in gradients. */
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2; if (mx !== mn) { var dd = mx - mn; s = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; } return [h, s * 100, l * 100]; }
  function hsl(h, s, l) { s /= 100; l /= 100; var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l), f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); }; return '#' + [f(0), f(8), f(4)].map(function (x) { return ('0' + Math.round(x * 255).toString(16)).slice(-2); }).join(''); }
  function lum(hx) { return hex2rgb(hx).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [.2126, .7152, .0722][i]; }, 0); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function makeCustom(c1, c2) {
    var a = rgb2hsl.apply(null, hex2rgb(c1)), h = a[0], sat = Math.min(a[1], 70), paper = hsl(h, Math.min(sat, 22), 95.5), l = a[2];
    while (l > 8 && contrast(hsl(h, a[1], l), paper) < 4.7) l -= 2;
    var main = hsl(h, a[1], l);
    return { id: 'custom', name: 'Custom', note: 'Your own two colours', dark: false, custom: [c1, c2],
      t: { glow: c2, paper: paper, 'paper-2': hsl(h, Math.min(sat, 20), 90.5), field: hsl(h, Math.min(sat, 25), 98.4), ink: hsl(h, Math.min(sat, 38), 12.5), 'ink-2': hsl(h, Math.min(sat, 16), 31), 'ink-3': hsl(h, Math.min(sat, 10), 43), rust: main, 'rust-2': hsl(h, a[1], Math.max(6, l - 9)), moss: hsl((h + 140) % 360, 22, 33), rule: hsl(h, Math.min(sat, 16), 84), 'rule-2': hsl(h, Math.min(sat, 14), 73) } };
  }
  var CKEY = 'm3-custom', cust = null;
  try { var qs = new URLSearchParams(location.search); if (qs.get('c1') && qs.get('c2')) cust = ['#' + qs.get('c1').replace('#', ''), '#' + qs.get('c2').replace('#', '')]; } catch (e) {}
  if (!cust) { try { cust = JSON.parse(sessionStorage.getItem(CKEY) || 'null'); } catch (e) {} }
  if (!cust || !/^#[0-9a-f]{6}$/i.test(cust[0]) || !/^#[0-9a-f]{6}$/i.test(cust[1])) cust = ['#1F5F8B', '#2FA4C2'];
  THEMES.push(makeCustom(cust[0], cust[1]));
  window.M3_customTheme = function (c1, c2) { var i = THEMES.length - 1; THEMES[i] = makeCustom(c1, c2); try { sessionStorage.setItem(CKEY, JSON.stringify([c1, c2])); } catch (e) {} window.M3_setTheme('custom'); };
  var KEY = 'm3-theme', root = document.documentElement;
  function find(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return null; }
  function apply(id) {
    var th = find(id) || THEMES[0], t = th.t;
    for (var k in t) root.style.setProperty('--' + k, t[k]);
    if (!th.t.deep) ['deep', 'on-deep-hi', 'on-deep', 'on-deep-2', 'on-deep-3', 'on-deep-accent'].forEach(function (k) { root.style.removeProperty('--' + k); });
    root.setAttribute('data-theme', th.id);
    root.style.colorScheme = th.dark ? 'dark' : 'light';
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t.paper);
    return th;
  }
  var fromUrl = null; try { fromUrl = new URLSearchParams(location.search).get('theme'); } catch (e) {}
  var saved = null; try { saved = sessionStorage.getItem(KEY); localStorage.removeItem(KEY); localStorage.removeItem(CKEY); } catch (e) {}
  var pageDefault = root.getAttribute('data-default-theme');
  var current = apply(find(fromUrl) ? fromUrl : find(saved) ? saved : find(pageDefault) ? pageDefault : 'harbour').id;
  window.M3_setTheme = function (id) { current = apply(id).id; try { sessionStorage.setItem(KEY, current); } catch (e) {} paint(); };

  /* the picker: a swatch button in the header, a small panel of themes */
  var btn, panel;
  function paint() {
    if (!btn) return;
    var th = find(current);
    btn.style.setProperty('--sw-a', th.t.paper); btn.style.setProperty('--sw-b', th.t.rust); btn.style.setProperty('--sw-c', th.t.ink);
    var cb = panel.querySelector('button[data-id=custom] .sw'); if (cb) { var ct = find('custom').t; cb.style.background = 'conic-gradient(' + ct.paper + ' 0 50%,' + ct.rust + ' 0 75%,' + ct.glow + ' 0)'; }
    btn.setAttribute('aria-label', 'Colour theme: ' + th.name);
    [].forEach.call(panel.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === current)); });
  }
  function mount() {
    if (root.hasAttribute('data-no-theme-picker')) return;
    var host = document.querySelector('.hdr .wrap') || document.querySelector('header'); if (!host) return;
    var css = document.createElement('style');
    css.textContent =
      '.th-pick{position:relative;display:flex;align-items:center}' +
      '.th-pick.th-m{grid-column:3;grid-row:1;justify-self:end;margin-right:56px}' +
      '.th-m ~ .menu-btn{grid-column:3;grid-row:1}' +
      '.th-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 13px 0 5px;border-radius:999px;border:1px solid var(--rule-2);background:var(--field);color:var(--ink);font:600 14px/1 var(--sans);cursor:pointer;flex:none;transition:transform .4s,border-color .4s}' +
      '.th-dot{width:30px;height:30px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.12);background:conic-gradient(var(--sw-a) 0 50%,var(--sw-b) 0 75%,var(--sw-c) 0)}' +
      '.th-btn:hover{border-color:var(--rust)}' +
      '.th-m .th-btn{padding:0 4px;width:40px;justify-content:center}.th-m .th-lab{display:none}' +
      '@media (max-width:1240px){.th-pick:not(.th-m) .th-btn{padding:0 4px;width:40px;justify-content:center}.th-pick:not(.th-m) .th-lab{display:none}}' +
      '.th-cust{margin:6px 0 2px;padding:10px 8px 6px;border-top:1px solid var(--rule)}' +
      '.th-cust .row{display:flex;gap:10px;margin-top:8px}' +
      '.th-cust label{flex:1;display:grid;gap:5px;font:500 12.5px/1.2 var(--sans);color:var(--ink-2)}' +
      '.th-cust input{width:100%;height:38px;padding:2px;border:1px solid var(--rule-2);border-radius:8px;background:var(--paper);cursor:pointer}' +
      '.th-cust .hint{margin:8px 0 0;font:400 12px/1.4 var(--sans);color:var(--ink-3);text-transform:none;letter-spacing:0}' +
      
      '.th-panel{position:absolute;right:0;top:calc(100% + 10px);z-index:300;width:280px;max-height:calc(100vh - 110px);overflow:auto;padding:8px;border-radius:12px;background:var(--field);border:1px solid var(--rule-2);box-shadow:0 18px 40px -18px rgba(0,0,0,.45);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .4s,transform .4s,visibility 0s .4s}' +
      '.th-pick.open .th-panel{opacity:1;visibility:visible;transform:none;transition:opacity .4s,transform .4s}' +
      '.th-panel p{margin:4px 8px 8px;font:500 12px/1.4 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}' +
      '.th-panel button{display:grid;grid-template-columns:34px 1fr;gap:2px 10px;align-items:center;width:100%;text-align:left;padding:8px;border-radius:9px;background:none;border:0;cursor:pointer;color:var(--ink)}' +
      '.th-panel button:hover{background:var(--paper-2)}' +
      '.th-panel button[aria-pressed=true]{background:var(--paper-2);box-shadow:inset 3px 0 0 var(--rust)}' +
      '.th-panel .sw{grid-row:1/3;width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,0,0,.15)}' +
      '.th-panel b{font:600 14px/1.2 var(--sans)}' +
      '.th-panel small{font:400 12.5px/1.3 var(--sans);color:var(--ink-3)}' +
      '@media (max-width:900px){.th-panel{position:fixed;left:12px;right:12px;top:auto;bottom:calc(12px + env(safe-area-inset-bottom));width:auto}}' +
      '@media (prefers-reduced-motion:reduce){.th-btn,.th-panel{transition:none}}';
    document.head.appendChild(css);
    var wrap = document.createElement('div'); wrap.className = 'th-pick';
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'th-btn'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'th-panel'); btn.title = 'Colour theme'; btn.innerHTML = '<span class="th-dot"></span><span class="th-lab">Colour</span>';
    panel = document.createElement('div'); panel.className = 'th-panel'; panel.id = 'th-panel'; panel.setAttribute('role', 'group'); panel.setAttribute('aria-label', 'Colour theme');
    panel.innerHTML = '<p>Colour theme</p>';
    THEMES.forEach(function (th) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.id = th.id;
      b.innerHTML = '<span class="sw"></span><b></b><small></small>';
      b.querySelector('.sw').style.background = 'conic-gradient(' + th.t.paper + ' 0 50%,' + th.t.rust + ' 0 75%,' + th.t.ink + ' 0)';
      b.querySelector('b').textContent = th.name; b.querySelector('small').textContent = th.note;
      b.addEventListener('click', function () { window.M3_setTheme(th.id); close(); btn.focus(); });
      panel.appendChild(b);
    });
    var cbox = document.createElement('div'); cbox.className = 'th-cust';
    cbox.innerHTML = '<div class="row"><label>Main colour<input type="color" data-c="1"></label><label>Second colour<input type="color" data-c="2"></label></div><p class="hint">Pick from your logo. The main colour is darkened if needed so text stays readable.</p>';
    var ci = cbox.querySelectorAll('input'), cc = find('custom').custom; ci[0].value = cc[0]; ci[1].value = cc[1];
    [].forEach.call(ci, function (inp) { inp.addEventListener('input', function () { window.M3_customTheme(ci[0].value, ci[1].value); }); });
    panel.appendChild(cbox);
    wrap.appendChild(btn); wrap.appendChild(panel);
    var cta = host.querySelector('.nav > .btn'), menuBtn = host.querySelector('.menu-btn');
    function place() { var phone = matchMedia('(max-width:900px)').matches; if (phone && menuBtn) { menuBtn.parentNode.insertBefore(wrap, menuBtn); wrap.classList.add('th-m'); } else if (cta) { cta.parentNode.insertBefore(wrap, cta); wrap.classList.remove('th-m'); } else host.appendChild(wrap); }
    place(); matchMedia('(max-width:900px)').addEventListener('change', place);
    function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); var o = !wrap.classList.contains('open'); wrap.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); if (o) { var c = panel.querySelector('[aria-pressed=true]'); if (c) c.focus(); } });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && wrap.classList.contains('open')) { close(); btn.focus(); } });
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  addEventListener('storage', function (e) { if (e.key === KEY && e.newValue && find(e.newValue)) { current = apply(e.newValue).id; paint(); } });
})();
