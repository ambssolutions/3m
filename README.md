# 3M Construction website

Homepage concepts for 3M Construction, a residential and commercial builder in Australia. Built by AMBS Solutions. Open `index.html` for the gallery. Each concept is one self-contained page at `designs/NN-slug/index.html`, and they all share `img/` and `assets/`. `CONCEPTS.md` holds the brief every concept was built from. Once a concept is chosen, it moves to the site root and the gallery is removed.

- `index.html`: the concept gallery (shortlist, compare, send your pick), noindex
- `designs/NN-slug/index.html`: the ten concepts, each self-contained (inline CSS and JS, no build step); `thumb.webp` beside each
- `assets/concepts.js`: the floating switcher on every concept page
- `assets/motion.js`: the animation layer for concept 01 (split-text reveals, smooth scroll, magnetic buttons, spotlight, staggered reveals). Additive: the page works without it, and it does nothing under reduced motion
- `assets/vendor/`: self-hosted GSAP 3.12.5, ScrollTrigger and Lenis 1.1.13
- `assets/content.js`: every business fact in one place. Empty values are hidden on the page, never made up
- `img/`: webp image sets (`-800`/`-1600`, hero `-1000`/`-2000`/`-3200`). Illustrative stock photos until the client's own arrive
- `privacy.html`: Privacy Act 1988 (Cth) statement, linked from the form and the footer
- `404.html`, `robots.txt`, `vercel.json` (main-only deploys, clean URLs, short links such as `/glasshouse`, security headers, noindex until launch)
- `tests/`: `concept-check.mjs NN-slug` (overlap, overflow and console errors at phone and laptop sizes), `laptop.mjs`, `tells.mjs` (template tells), `e2e.mjs`, `perf.mjs`; `tools/thumbs.mjs` makes the gallery thumbnails
- `CONTENT-NEEDED.md`: what the client still has to supply, and where it goes

Preview locally: `python3 -m http.server`, then open http://localhost:8000.

## Things to finish before launch
Pick a concept first, then see `CONTENT-NEEDED.md`. In short: the real logo and colours, contact details, confirmation of every promise on the page, project photos, reviews with permission, the form key and the domain. Then remove `noindex` from the four places listed there.
