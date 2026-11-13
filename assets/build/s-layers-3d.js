/* s-layers-3d: owned by the layers section builder. A small loader, kept tiny so it never competes with the
   first paint. Once the page has loaded and "Built in layers, paid in stages" is within about one screen, it imports
   three.js and the model (s-layers-3d-model.js), which draws a WebGL drafting model of the house in five layers.
   The canvas is decorative (aria-hidden); the stage list stays the real content. Without WebGL, if an import fails,
   or without JS, the CSS model in .layers-model simply stays.
   The work is split into idle-time steps (WebGL check, then the imports, then the build) so no single step blocks a
   scroll for long, and the throwaway WebGL check no longer runs while the page is still loading. */
const d = document;
const sec = d.getElementById('layers');
const box = sec && sec.querySelector('.layers-model');

function hasGL() {
  try { const c = d.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl'); if (!g) return false; const x = g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); return true; } catch (e) { return false; }
}
const idle = f => { if ('requestIdleCallback' in window) requestIdleCallback(f, { timeout: 800 }); else setTimeout(f, 60); };

if (box && 'IntersectionObserver' in window && 'ResizeObserver' in window) {
  const arm = () => {
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      io.disconnect();
      idle(() => {
        if (!hasGL()) return;
        Promise.all([import('../vendor/three/three.slim.min.js'), import('./s-layers-3d-model.js?v=2')])
          .then(([T, M]) => new Promise((ok, no) => idle(() => { try { ok(M.build(T)); } catch (e) { no(e); } })))
          .catch(() => { box.classList.remove('gl'); });
      });
    }, { rootMargin: '100% 0px 100% 0px' });
    io.observe(sec);
  };
  if (d.readyState === 'complete') arm(); else addEventListener('load', arm, { once: true });
}
