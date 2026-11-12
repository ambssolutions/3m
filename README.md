# 3M Construction website

Single-page website for 3M Construction, a residential and commercial builder. Built by AMBS Solutions.

- `index.html`: the whole site (inline CSS and JS, no build step)
- `assets/content.js`: every business fact in one place. Empty values are hidden on the page, never made up
- `img/`: webp image sets (`-600`/`-1200`, hero `-800`/`-1600`). Illustrative stock photos until the client's own arrive
- `privacy.html`: Privacy Act 2020 statement, linked from the form and the footer
- `404.html`, `robots.txt`, `vercel.json` (main-only deploys, clean URLs, security headers, noindex until launch)
- `CONTENT-NEEDED.md`: what the client still has to supply, and where it goes

Preview locally: `python3 -m http.server`, then open http://localhost:8000.

## Things to finish before launch
See `CONTENT-NEEDED.md`. In short: the real logo and colours, contact details, confirmation of every promise on the page, project photos, reviews with permission, the form key and the domain. Then remove `noindex` from the four places listed there.
