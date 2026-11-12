# 3M Construction website

Single-page website for 3M Construction, a residential and commercial builder in Australia. Built by AMBS Solutions.

- `index.html`: the whole site (inline CSS and the content and interaction JS, no build step)
- `assets/motion.js`: the animation layer (split-text reveals, smooth scroll, magnetic buttons, spotlight, staggered reveals). Additive: the page works without it, and it does nothing under reduced motion
- `assets/vendor/`: self-hosted GSAP 3.12.5, ScrollTrigger and Lenis 1.1.13
- `assets/content.js`: every business fact in one place. Empty values are hidden on the page, never made up
- `img/`: webp image sets (`-800`/`-1600`, hero `-1000`/`-2000`/`-3200`). Illustrative stock photos until the client's own arrive
- `privacy.html`: Privacy Act 1988 (Cth) statement, linked from the form and the footer
- `404.html`, `robots.txt`, `vercel.json` (main-only deploys, clean URLs, security headers, noindex until launch)
- `CONTENT-NEEDED.md`: what the client still has to supply, and where it goes

Preview locally: `python3 -m http.server`, then open http://localhost:8000.

## Things to finish before launch
See `CONTENT-NEEDED.md`. In short: the real logo and colours, contact details, confirmation of every promise on the page, project photos, reviews with permission, the form key and the domain. Then remove `noindex` from the four places listed there.
