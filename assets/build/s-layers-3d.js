/* s-layers-3d: owned by the layers section builder. A small loader, kept tiny so it never competes with the
   first paint. Once the page has loaded and "Built in layers, paid in stages" is within about one screen, it imports
   three.js and the model (s-layers-3d-model.js), which draws a WebGL drafting model of the house in five layers.
   The canvas is decorative (aria-hidden); the stage list stays the real content. Without WebGL, if an import fails,
   or without JS, the CSS model in .layers-model simply stays. */
const d = document;
const sec = d.getElementById('layers');
const box = sec && sec.querySelector('.layers-model');

function hasGL() {
  try { const c = d.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl'); if (!g) return false; const x = g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); return true; } catch (e) { return false; }
}

if (box && 'IntersectionObserver' in window && 'ResizeObserver' in window && hasGL()) {
  const arm = () => {
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      io.disconnect();
      const go = () => Promise.all([import('../vendor/three/three.module.min.js'), import('./s-layers-3d-model.js?v=1')])
        .then(([T, M]) => M.build(T)).catch(() => { box.classList.remove('gl'); });
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 800 }); else setTimeout(go, 60);
    }, { rootMargin: '100% 0px 100% 0px' });
    io.observe(sec);
  };
  if (d.readyState === 'complete') arm(); else addEventListener('load', arm, { once: true });
}
