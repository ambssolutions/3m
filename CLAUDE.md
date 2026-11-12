# 3M Construction website: notes for Claude

Built by AMBS Solutions. Follow the **ambs-website-design** skill (and **website-chat-bot** if this site has the chat). These are the house rules that matter most for this owner.

## Working style
- Work locally and show screenshots or a short video first. Publish to the live site only when the owner says "push live".
- Never lose a working feature when changing things (form leads, booking, phone links). Start from the latest live version.
- Deploy only `main`.

## Design rules the owner always checks
- Everything fits the screen: 390×844 phones and 1280×720 / 1366×768 / 1440×900 / 1536×864 laptops. No overlapping text, and the hero fits the first screen.
- Centre-align section headings, intros, the hero, the footer and menus. Keep tick lists, FAQs, timelines and forms left-aligned.
- One type scale across all pages, with calm, readable fonts.
- Real logo (vector), and all accent colours taken from the logo. No glow, haloes, highlighter bands or white outer shadows.
- Native motion only: CSS sticky stacking cards (opaque, heading pinned, each card's number and title showing), slow smooth opens (~1.4s), no scroll-jacking or JS pinning, no count-ups, tilt or zoom. Respect reduced motion.
- Declutter: one headline and one main action in the hero; few cards, chips and arrows.
- Doesn't look AI-generated: plain NZ English, no em dashes, no exclamation marks, no hype words, no "X. One Y." headings, no eyebrow on every section.
- Real, sharp, uncropped photos (WebP with srcset). Smooth on phones: no live backdrop-blur.
- Header stays visible while scrolling. On phones, a small Call / Book bar that hides while the hero shows.
- Dark mode (if offered) built properly, including menus and overlays. It never switches by time of day.
- Forms really send. Contact details live in one place. Never invent facts: hide what the client hasn't supplied (`CONTENT-NEEDED.md`).
- Footer credit: "Proudly designed by AMBS Solutions".

## This site
- Stack: static HTML, no build step. Vercel from `main`. Currently a concept gallery (`index.html`) with ten self-contained concepts in `designs/`; the brief is `CONCEPTS.md`. When the client picks one, that concept moves to the root and the gallery goes.
- Content lives in: `assets/content.js` (business facts, hidden when empty) and `index.html` (copy). Motion lives in `assets/motion.js`.
- Form endpoint: `SITE.formEndpoint` in `assets/content.js`, mailto until set.
- Languages: English (Australian market: en-AU, state-neutral approval terms until the state is confirmed).
- Things to finish before launch: see README.md
