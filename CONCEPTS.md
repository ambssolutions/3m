# 3M Construction: the ten homepage concepts

Ten homepage concepts for 3M Construction, a residential and commercial builder in Australia. Each concept is one self-contained page at `designs/NN-slug/index.html` (inline CSS and JS). They all share `img/`, `assets/content.js`, `assets/vendor/` and `privacy.html` at the repo root, reached with `../../`. The gallery at `index.html` lists them. The client picks one, and that concept becomes the site.

Every concept uses the same copy deck and the same content truth below. They differ in look, layout, type, surface language and motion. **Each concept is a different idea of what 3M Construction is**, not a re-skin.

## Rules that apply to every concept

**File.** One file: `designs/NN-slug/index.html`, under 150 KB, no base64 images, no build step. `<html lang="en-AU" data-concept="NN-slug">`. Load the shared switcher just before `</body>`: `<script src="../../assets/concepts.js?v=1" defer></script>`. Fonts from Google Fonts only (preconnect, `display=swap`, only the weights used, at most 2 families). Vendor scripts are optional and self-hosted: `../../assets/vendor/gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js` (all `defer`). Lenis only on `(pointer:fine)` and not under reduced motion.

**Head.** `<meta name="robots" content="noindex">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, title `3M Construction | <concept angle>`, description, `theme-color`, Open Graph with `og:locale` `en_AU`, an SVG data-URI favicon with "3M", JSON-LD `GeneralContractor` (name, description only, no invented address) and `FAQPage` with the five FAQ pairs.

**Images.** Shared sets in `../../img/` (webp, use `srcset`, `sizes`, `width`, `height`, `loading="lazy"`, `decoding="async"`; the hero image gets `fetchpriority="high"` and a `<link rel="preload" as="image" imagesrcset imagesizes>`):
- `hero-site-1000/2000/3200.webp` 16:9 (3200x1800): crew in hi-vis on a concrete slab, aerial
- `svc-new-homes-800/1600.webp` 4:3: new two-storey home at dusk
- `svc-renovations-800/1600.webp` 4:3: renovated open-plan living room
- `svc-fitouts-800/1600.webp` 4:3: glass-fronted commercial building at sunset
- `svc-commercial-800/1600.webp` 4:3: multi-storey frame under construction
- `proj-pool-house-800/1600.webp` 4:3: two-storey home with pool
- `proj-loft-800/1600.webp` 4:3: attic bedroom with timber beams
- `proj-tower-800/1600.webp` 4:3: glass apartment block beside a crane
- `proj-white-house-800/1600.webp` 4:3: white rendered home, landscaped
- `proj-living-800/1600.webp` 4:3: living room with floating stair
- `proj-weatherboard-800/1600.webp` 4:3: weatherboard building, steep roof
- `people-crew-800/1600.webp` 4:5: builders tying steel on a slab
- `people-plans-800/1600.webp` 4:5 (1600 is 1102x1378): hands marking up plans
- `people-electrician-800/1600.webp` 4:5: electrician at a switchboard
All are illustrative stock. Never stretch, zoom on hover, or crop a face. Never inline images.

**Content truth.** Load `<script src="../../assets/content.js?v=2"></script>` and implement the same hide-if-missing logic as concept 01 (copy its block: `[data-text]` fills, `[data-need]` and `[data-need-any]` hide, phone/email/map/reviews links, memberships, stats, testimonials, team). Every business fact (area, phone, email, address, hours, licence, insurance, ABN, memberships, stats, testimonials, reviews link, team) comes only from `SITE` and is hidden when empty. Never invent a number, a year, a client name, a suburb, a review, an award or a price. Project cards use the generic descriptions below. The footer carries "Some images on this website may be stock images or illustrative renders."

**Must-haves.** Skip link. Labelled nav with a 44px menu button (`aria-expanded`, `aria-controls`), menu closes on link click, header stays visible while scrolling (solid state after the hero). Hero fits the first screen at 390x844 and 1280x720 with the next section not peeking in, display type sized by width and height (`clamp(…, min(vw, vh), …)`). Centred section headings, intros, hero and footer; tick lists, FAQs, timelines and forms left-aligned. The quote form (`<form data-enquiry novalidate>`, fields name, phone, email, type of job select, suburb or postcode, about the job, budget, honeypot, `aria-live` status, "We use your details only to reply to your enquiry.") with the same send logic as concept 01 (endpoint if `SITE.formEndpoint`, otherwise mailto). On phones only, a fixed Call / Get a quote bar that hides while the hero shows and over the form (Call hidden until `SITE.phone` exists, `[hidden]{display:none!important}`). Privacy link to `../../privacy.html`. Footer: logo, tagline, Services and Explore columns, legal line with `data-text="legalName"`, ABN and licence via `data-need`, stock-image disclaimer, "Proudly designed by AMBS Solutions". Visible focus (`outline:2px solid <accent>;outline-offset:3px`). Respect `prefers-reduced-motion` everywhere (no unconditional `animation:none`; disable the layer instead). Content is visible if JS fails: hide things only behind a class JS adds.

**Motion.** Only transform, opacity and clip-path move. Native CSS wherever possible (sticky, scroll-driven `animation-timeline` behind `@supports`, transitions). Nothing pinned or scroll-jacked, no JS scrubbing of scroll position, no count-up numbers, no tilt, no photo zoom, no spinners, no live `backdrop-filter`. Opens and closes take about 1.4s. Ambient loops pause off-screen (toggle a `.live` class with IntersectionObserver). Low-power phones (`pointer:coarse` and `hardwareConcurrency<=4`) get the lighter variant. Each concept has one signature moment and its own hero intro.

**Copy.** Australian English, short plain sentences, no em dashes, no exclamation marks, no hype words (seamless, unlock, revolutionise, leverage, cutting-edge, bespoke, elevate, dream). Headings are plain labels or real statements. Limits per page: at most 1 heading with a coloured or italic accent word (the hero only), at most 2 short headings ending in a full stop, at most 2 small uppercase eyebrow labels above headings (unless numbering is the concept's system), no "X. One Y." pairs, no triplets, no "from A to B" taglines. **Use the section headings given for your concept verbatim**, so no heading repeats across concepts.

**Checks.** From the repo root run `node tests/concept-check.mjs NN-slug` until it reports 0 layout issues and 0 console errors, then open the screenshots it writes to `tests/out/NN-slug/` (top of page at five sizes, full page at 390 and 1280) and look at them yourself: nothing overlapping, nothing cut off, the hero filling the first screen, the phone view intentional.

## Copy deck (shared)

**Company.** 3M Construction. Residential and commercial builders. Lede: "New homes, renovations and extensions, and commercial fit-outs. One site supervisor looks after your job from the first site visit to the final certificate." Hero: one headline, one main action ("Get a quote" to `#contact`), one text link ("See recent work"). The hero can carry a credentials strip whose items are `data-need` (licence, insurance, hours, memberships).

**Services (four).**
1. New homes. From your plans or ours, on your block. "We build from your architect's drawings or help you get a design and approval for your block. You get a written programme, and the price is fixed for the work in the contract." Points: Design and approvals handled with your designer · Fixed-price building contract, written variations · Mandatory inspections booked with your certifier at every stage · Occupation certificate or final inspection applied for at the end. Photo `svc-new-homes`.
2. Renovations and extensions. Kitchens, bathrooms, second storeys, re-cladding. "Kitchens, bathrooms, second storeys, decks and re-cladding. We stage the work so you keep a kitchen and a bathroom for as long as possible while we build." Points: Staged so you can stay in the house · We tell you in advance when water or power is off · Dust barriers and floor protection as standard · Site swept and tidy at the end of every day. Photo `svc-renovations`.
3. Commercial fit-outs. Offices, retail and hospitality, built around your opening date. "Offices, retail and hospitality. We work to your lease dates and your opening date, including after-hours work where the building needs it." Points: Programme built around your opening date · Partition, ceiling, joinery and services trades coordinated by us · After-hours and weekend work where the building needs it · Landlord and building manager sign-offs handled. Photo `svc-fitouts`.
4. Light commercial. Warehouses, workshops and small multi-unit builds. "Warehouses, workshops, childcare centres and small multi-unit builds. We manage the engineering, the approvals and the subcontractors so you have one point of contact." Points: One site supervisor for the whole job · Engineer and certifier inspections scheduled by us · Safe work method statements and a site safety plan for every job · Weekly progress report with photos. Photo `svc-commercial`.

**Process (five stages, state-neutral Australian approvals).** Each says what we deliver and who signs it off.
1. Site visit and estimate (Week 1). We walk the site with you and talk through what you want · You get a written estimate with a range, and a list of what would change it · No charge, and no obligation. Signed off by: You. You get: Estimate and a draft programme.
2. Design and approvals. Your designer or ours prepares the drawings, and we price them line by line · We lodge the development application or complying development certificate with your council or a private certifier · Fixed-price contract signed once the approval is issued. Signed off by: Your council or private certifier issues the approval. You get: Approved plans and a fixed-price contract.
3. The build (On site). One site supervisor, the same person from start to finish · Weekly progress report with photos · Anything you change is priced in writing before we do it · Mandatory inspections at footings, frame, waterproofing and final. Signed off by: Your building certifier or surveyor at each inspection. You get: A weekly update and a current finish date.
4. Walk-through and handover (Practical completion). We walk through the finished job with you and write down anything to fix · Those items are done before the final invoice · Keys, warranties and manuals handed over in one folder. Signed off by: You. You get: The keys, and the warranties.
5. Final certificate and defects period (After handover). We apply for the occupation certificate or final inspection and chase it until it is issued · Compliance certificates for plumbing, electrical and waterproofing supplied · Defects liability period: anything that comes up, you call your site supervisor. Signed off by: Your certifier issues the final certificate. You get: The certificate, and a builder you can still call.

**Projects (six, generic, illustrative photos).** Residential: Two-storey family home (New home): "Concrete slab, block and timber frame, with a pool and terrace." `proj-pool-house` · Attic conversion (Renovation): "A new bedroom and bathroom in the roof space, with a dormer and new stairs." `proj-loft` · Full re-clad (Re-clad): "Waterproofing remediation, new cladding and windows, and landscaping." `proj-white-house` · Living room extension (Extension): "A new living wing with full-height glazing and a floating stair." `proj-living`. Commercial: Apartment block (Light commercial): "Structural steel and precast panels, with a ground-floor retail fit-out." `proj-tower` · Childcare centre (Commercial fit-out): "Conversion of a weatherboard cottage, with a new kitchen, bathrooms and play areas." `proj-weatherboard`. Intro line: "A sample of finished jobs. Ask us for the address of one near you and we will arrange a look."

**People.** "You get one site supervisor for the whole job. They walk the site with you at the start, run the crew every day, book the inspections and hand you the keys at the end. If something comes up a year later, they are still the person you call." Points: **Our own carpenters.** Framing, cladding and finishing are done by people on our payroll, not labour hire. · **Licensed trades.** The same electricians, plumbers and painters on every job, so the finish is consistent. · **Weekly updates.** A short report with photos every week, and a current finish date. · **Tidy site.** Swept at the end of every day, and skips emptied before they overflow. Photos: `people-crew` "The crew on site", `people-plans` "Your site supervisor", `people-electrician` "Licensed trades". A `data-need="team"` container for real team members.

**Proof (hidden until supplied).** Stats (`data-need="stats"`), up to two testimonials (`data-need="testimonials"`) with a "Read our Google reviews" link (`data-need="reviewsUrl"`), memberships (`data-need="memberships"`). Wrap the whole block in `data-need-any="stats testimonials memberships" hidden`.

**FAQ (five).**
1. Do I need council approval? "Most new homes, extensions and structural changes need a development application through your council, or a complying development certificate through a private certifier. Smaller jobs can be exempt development. The rules differ by state and council. We tell you which applies at the first site visit, and we lodge it for you."
2. How long does a new build take? "It depends on the design, the site, the approvals and the weather. We give you a written programme with the quote and update it at every stage, so you always know the current finish date."
3. Is the quote a fixed price? "The quote is a fixed price for the work described in it, under an industry-standard fixed-price building contract. Anything you add or change later is priced in writing as a variation before we do it, so there are no surprises on the final invoice."
4. Can we stay in the house during a renovation? "Often, yes. We stage the work so you keep a kitchen and a bathroom for as long as possible, and we tell you in advance which days the water or power will be off."
5. What happens when the build is finished? "We walk through the job with you, fix anything on the list, and apply for the occupation certificate or final inspection. You get the approval documents, compliance certificates, warranties and manuals in one folder."

**Contact.** Intro: "Tell us about the job and we will call you to arrange a site visit. A rough idea is fine." Form button: "Send and we will call you". Thanks: "Thank you. We have your details and will call you within one business day." What to tell us: 1 The address or the suburb of the site. 2 What you want to build, in a sentence or two. 3 Whether you already have plans or an approval. 4 When you would like to start, and a rough budget. A guess is fine. What happens next: "We call you within one business day to arrange a site visit. After the visit you get a written estimate. There is no charge for either." Contact details block via `data-need-any="phone email address"`.

**Footer tagline.** "New homes, renovations and extensions, and commercial fit-outs. One site supervisor from the first site visit to the final certificate." Explore: How we work, Projects, About, Questions, Get a quote, Privacy.

## The concepts

| # | Slug | Name | Type · Style | Motion | The idea of the client |
|---|---|---|---|---|---|
| 01 | 01-night-shift | Night Shift | High-tech · Dark gradient, embossed | Highly animated | A modern builder with technology-grade process. Built. |
| 02 | 02-blueprint | Blueprint | Technical · Drawing set | Interactive | A builder who works to the drawing. The page is a drawing set. |
| 03 | 03-site-diary | Site Diary | Editorial · Journal | Animated | A builder who documents every week. The page reads like a build diary. |
| 04 | 04-hard-hat | Hard Hat | Industrial · Bold blocks | Highly animated | A no-nonsense crew. Hi-vis, black type, hard edges. |
| 05 | 05-glasshouse | Glasshouse | Premium · Light and quiet | Subtle motion | A considered, architectural builder. White space and large photography. |
| 06 | 06-before-after | Before and After | Interactive · Comparison | Interactive | A builder judged by results. Sliders and split panels everywhere. |
| 07 | 07-control-room | Control Room | Dashboard · Status board | Interactive | A builder who tracks every stage. Panels, tables, pipeline. |
| 08 | 08-timber | Timber | Natural · Warm and rounded | Animated | A family builder of solid homes. Wood tones, soft shapes. |
| 09 | 09-skyline | Skyline | Cinematic · Chaptered | Animated | A builder with scale. Full-bleed chapters, condensed type. |
| 10 | 10-quote-builder | Quote Builder | Conversion · Estimate stepper | Interactive | A builder who makes the first step easy. The hero is a three-step enquiry. |

### 02 Blueprint
- **Palette:** paper `#F7F8FA`, ink `#0B2545`, blueprint blue `#1D4ED8`, grid line `rgba(29,78,216,.12)`, accent orange `#F2A91B` for one action only.
- **Type:** IBM Plex Mono (labels, numbers) + IBM Plex Sans (text, headings 600).
- **Hero:** a drawing sheet. Grid-paper background, a title block in the corner (Project: your home · Sheet: A-01 · Rev: A · Drawn by: 3M Construction), an SVG line drawing of a two-storey house section that draws itself on load (stroke-dashoffset, about 2.2s), dimension lines with arrowheads. Headline: "Builders who work to the drawing." Main action a flat orange rectangle, the text link mono.
- **Surface:** square corners, 1px hairlines, dimension-line dividers, mono sheet numbers on every section ("A-02"), tables with ruled rows. No shadows, no rounded cards.
- **Section headings (verbatim h2):** "Sheet index: what we build" · "Approval path, stage by stage" (a dense table: Stage / What we deliver / Who signs it off / What you get) · "Drawing register" (projects as register rows with sheet numbers and a photo that slides open on click or hover) · "Who is on the drawing" (people) · "General notes" (FAQ, numbered N1 to N5) · "Request a site visit" (contact).
- **Signature motion:** the hero drawing draws itself; hairlines scale in from the left as sections enter; hovering a service row draws a small SVG icon; the approval table rows highlight with a blue rule.

### 03 Site Diary
- **Palette:** warm paper `#F4EFE6`, ink `#221F1A`, rust `#B5471F`, moss `#4E5A3A`, rule `#D9D0C0`.
- **Type:** Fraunces (display, 600, optical size) + Work Sans (text).
- **Hero:** a magazine cover, centred: a small issue line ("Site diary · 3M Construction"), the headline "A builder's diary, from site visit to keys." in large Fraunces, a one-line standfirst, then the hero photo as the cover image with a caption and the two actions beneath. Fits the first screen.
- **Surface:** ruled lines, a drop cap on the first paragraph, pull quotes, small-caps captions, columns on laptops. No cards at all: sections are separated by double rules.
- **Section headings (verbatim h2):** "In this issue: what we build" · "Thirty weeks on site" (the five stages as dated diary entries, Week 1, Week 6, Week 12, Week 28, Week 30, with a vertical rule that draws as you scroll using a native scroll-driven animation behind `@supports`, falling back to a plain rule) · "From the archive" (projects as a photo essay with captions) · "The people on the page" · "Reader questions, answered" (FAQ) · "Write to the site office" (contact).
- **Signature motion:** the diary rule draws down the page; entries fade up; the drop cap and pull quotes reveal with a clip-path; a slow page-turn style crossfade on the archive photos on hover.

### 04 Hard Hat
- **Palette:** hi-vis `#FFD400`, black `#111111`, concrete `#D9D9D6`, white. Diagonal hazard stripes (yellow/black) as section dividers, drawn with `repeating-linear-gradient`.
- **Type:** Anton (display, uppercase) + Inter (text).
- **Hero:** giant stacked uppercase type filling the screen: "WE BUILD HOMES AND WORKPLACES" over a black panel with the hero photo at reduced size in a hard-edged frame to the side on laptops and below on phones. Headline sized by width and height. One yellow block button. A yellow kinetic-type marquee band under the hero with the four services, pausing on hover.
- **Surface:** 3px black borders, flat blocks of yellow, black and grey, stencil-style numbers 01 to 05, no radius, no shadows. Buttons are blocks that shift 3px on press.
- **Section headings (verbatim h2):** "What we build, in plain terms" · "Five stages, no surprises" (native CSS sticky stacking cards alternating yellow, black and grey, opaque, heading pinned, each card's number and title showing; static on phones and at heights under 760px) · "Jobs we have finished" · "The crew" · "Straight answers" (FAQ) · "Get a price" (contact).
- **Signature motion:** blocks slide in from the sides as they enter (transform only), the marquee band, hover on a service block flips yellow to black.

### 05 Glasshouse
- **Palette:** white `#FFFFFF`, stone `#F2F1ED`, charcoal `#1C1C1C`, brass `#A98A4D`, hairline `#E4E1DA`.
- **Type:** Cormorant Garamond (display 500/600) + Jost (text 400/500).
- **Hero:** three full-bleed photos (`hero-site`, `svc-new-homes`, `proj-living`) crossfading slowly (about 6s each, opacity only, no zoom) with a thin brass progress bar, a dark gradient for legibility, a centred Cormorant headline "Homes and workplaces, built with care." and one outlined button plus a text link. Pauses off-screen and under reduced motion shows the first photo.
- **Surface:** generous white space, hairlines, no cards, small-caps labels, large images with wide margins, an asymmetric two-column project layout with offset rows.
- **Section headings (verbatim h2):** "A quieter kind of building" (services as four large image-led rows alternating sides) · "The way a project unfolds" (five stages as a numbered vertical list with large thin numerals) · "Selected projects" · "The people you will meet" · "Questions we are often asked" (FAQ) · "Begin a conversation" (contact).
- **Signature motion:** the crossfade hero; images reveal with a clip-path wipe as they enter; headings fade up slowly; hover lifts photos 4px with a soft shadow.

### 06 Before and After
- **Palette:** deep teal `#0F3D3E`, cream `#F5F2EA`, coral `#FF6B4A`, ink `#102A2B`.
- **Type:** Sora (display 600/700) + Inter (text).
- **Hero:** a before/after comparison slider as the hero image: the same photo (`svc-renovations`) shown as a "Plan" view on the left (CSS filters: grayscale, contrast, a teal tint overlay with a faint grid) and "Built" on the right, with a draggable handle (pointer events, keyboard arrows on a range input, ARIA slider). Caption: "Illustrative. Slide to compare." Centred headline above: "See the difference a good builder makes." One coral button and a text link.
- **Surface:** 12px radius, split panels, coral handle and labels, teal panels with cream text.
- **Section headings (verbatim h2):** "Residential or commercial?" (two tall panels side by side that expand on hover or tap, listing the services for each) · "From the first visit to the keys" (five stages as a horizontal stepper with a progress line that fills as the visitor clicks through; stacked on phones) · "Projects, before and after" (each project card has its own small filter-based comparison slider) · "Things people ask us" (FAQ) · "The people behind the work" · "Start your project" (contact).
- **Signature motion:** the sliders; panels expanding; the stepper line.

### 07 Control Room
- **Palette:** slate `#0D1117`, panel `#161B22`, border `#30363D`, text `#C9D1D9`, muted `#8B949E`, green `#3FB950`, amber `#D29922`.
- **Type:** JetBrains Mono (labels, numbers, headings 600) + Inter (text).
- **Hero:** a status board. Headline "Your build, tracked at every stage" centred, then a wide panel showing the five stages as a pipeline with the current stage highlighted and a legend. No fake live data: the pipeline shows stage names and who signs off. Buttons are small bordered panels; the main action is green.
- **Surface:** 6px radius bordered panels, tags and badges, tables with hover rows, monospace labels, a thin header bar with a "status: taking new jobs" badge only if `SITE.hours` exists (data-need).
- **Section headings (verbatim h2):** "Every job on one board" (services as a table: Service / Typical scope / What is included, rows expand with a slow fold) · "Stage tracker" (the pipeline in detail, each stage a panel with signed-off-by and what-you-get fields) · "Completed jobs log" (projects as a table with a card toggle) · "The team on the board" · "Frequently raised questions" (FAQ) · "Open a new job" (contact).
- **Signature motion:** the pipeline fills stage by stage as it enters (class added by IntersectionObserver); a typewriter reveal on the hero headline (text animation, about 1.6s, reduced motion shows it plain); panels slide up.

### 08 Timber
- **Palette:** oak `#C8A165`, bark `#3B2F2A`, sage `#8A9A7B`, cream `#F8F5EF`, deep green `#2F3E2A`.
- **Type:** DM Serif Display (display) + DM Sans (text).
- **Hero:** full-bleed hero photo with a warm bark-toned overlay, centred headline "Solid homes and sound workplaces." in DM Serif, one rounded oak button and a text link, a curved cream divider at the bottom (SVG wave).
- **Surface:** 28px radius, soft long shadows, pill tags, a subtle wood-grain SVG texture on bark sections at low opacity, rounded photos.
- **Section headings (verbatim h2):** "Work we take on" · "A build in five chapters" (stages as rounded cards in a vertical line with a leaf-shaped marker) · "Recently finished homes and workplaces" (a horizontal scroll-snap reel with arrow buttons and dots, swipeable, keyboard reachable) · "The hands on the tools" · "Good questions" (FAQ) · "Talk to a builder" (contact).
- **Signature motion:** the project reel; cards rise with a soft spring; the wave divider; tags hover-fill.

### 09 Skyline
- **Palette:** near-black `#07090C`, white, cyan `#35C4E8`, graphite `#161A20`.
- **Type:** Bebas Neue (display, uppercase) + Manrope (text).
- **Hero:** full-bleed photo with a slow crossfade between `hero-site`, `svc-commercial` and `proj-tower` (opacity only), a huge condensed uppercase headline "BUILDERS FOR HOMES AND WORKPLACES" that reveals letter by letter with widening letter-spacing, a chapter marker "01" top left, one cyan-outlined button, a text link, a thin cyan rule.
- **Surface:** full-bleed photo chapters with dark gradients, text over images, thin cyan rules, chapter numbers that stay sticky at the left of each chapter on laptops (native `position:sticky`), no cards.
- **Section headings (verbatim h2):** "Chapter one, what we build" · "Chapter two, how a build runs" · "Chapter three, the work" · "Chapter four, the people" · "Chapter five, your questions" · "Chapter six, start here" (contact).
- **Signature motion:** letter-spacing reveal on chapter titles as they enter; photo clip-path reveals; the crossfade hero; chapter numbers sticky.

### 10 Quote Builder
- **Palette:** white, ink `#101828`, electric blue `#2A5BFF`, lime `#C6F135`, grey `#F2F4F7`, line `#E4E7EC`.
- **Type:** Plus Jakarta Sans only (400/600/800).
- **Hero:** split on laptops, stacked on phones. Left: headline "Get a builder's estimate in three steps." and the lede. Right: an interactive three-step enquiry widget in a 20px-radius card: step 1 type of job (four big choices), step 2 what you have (no plans yet / plans / approval) and when you want to start, step 3 name, phone, email, suburb, message. Progress dots, back and next buttons, keyboard reachable, validation, and the same send logic as the shared form (endpoint or mailto). It replaces the contact form at the bottom with a short "Prefer to talk?" block that links back up and shows contact details via `data-need`. No prices or quotes are shown or implied.
- **Surface:** 20px radius, soft shadows, chips, a lime highlight behind the main button, blue focus rings.
- **Section headings (verbatim h2):** "Tell us about the job" (the widget's own heading) · "What we can build for you" (services as compact rows with simple inline SVG icons) · "The five steps after you press send" (a horizontal stepper with a connecting line that fills as it enters; stacked on phones) · "Finished jobs to look at" · "The people who call you back" · "Answers before you call" (FAQ as two columns of question and answer text on laptops).
- **Signature motion:** the widget's step transitions (slide and fade), the stepper line, chips that pop in.

## Gallery conventions
Cards show "Concept NN", the name, "Type · Style", a motion tag and a one or two sentence description. Two or three concepts carry a recommended badge with a one-line reason. Shortlist star per card, saved in localStorage and shared with the switcher on every concept page. The gallery and every concept stay `noindex`.
