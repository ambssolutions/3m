# What we still need from 3M Construction

The site is built and works today. Anything below that has not been supplied is hidden, so nothing is made up. Send the items and they go in without a redesign.

**content.js** = `assets/content.js` (one file, plain text, one value per line). **page** = a small edit to `index.html`.

## Confirm before launch
| Need | Goes in |
|---|---|
| The real logo (SVG or a large PNG) and its exact colours. The site uses a placeholder "3M" tile and an amber accent until then | `img/logo.svg`, and the colour tokens at the top of `index.html` (`--accent`) |
| Registered company name and ABN for the footer | content.js `legalName`, `abn` |
| Service area, e.g. "Western Sydney" (shows in the hero and footer) | content.js `area` |
| Phone, email, office address, hours | content.js `phone`, `phoneLink`, `email`, `address`, `mapsUrl`, `hours` |
| Every promise on the page: fixed-price contracts, written variations, one site supervisor, weekly photo reports, own carpenters, licensed trades, safe work method statements, tidy site, call back within one business day. Strike out any that are not true | page: services panels, "How a job runs", "Who you deal with", "What happens next" |
| Which state they build in. The process and FAQ are written state-neutral (DA or CDC, council or private certifier, occupation certificate or final inspection). Once the state is known, use that state's terms, for example building permit and occupancy permit in Victoria, QBCC and Form 21 in Queensland | page: "How a job runs" and "Common questions" |
| Builder licence number for their state (NSW Fair Trading, QBCC, VBA and so on). Most states require it on a builder's advertising, so this is needed before launch | content.js `licence` (shows in the hero strip, contact block and footer) |
| Memberships (for example HIA, Master Builders) with logo files | content.js `memberships` |
| Home warranty or building compensation insurance wording for their state | content.js `insurance` |

## Photos and projects
| Need | Goes in |
|---|---|
| 6 to 12 finished jobs: 2 to 4 photos each, type, suburb, what was done, and permission to show them | page: "Recent work" cards (currently illustrative stock photos with generic descriptions; supply originals at least 1600px wide) |
| Photos of the team on site, and of the site supervisor(s) | content.js `team`, and the three photos in "Who you deal with" |
| A wide site or finished-home photo for the hero (landscape, at least 3200px wide for sharp large screens) | `img/hero-site-*.webp` (1000, 2000 and 3200 wide) |
| One photo per service (new home, renovation, fit-out, light commercial) | `img/svc-*.webp` |

## Proof
| Need | Goes in |
|---|---|
| 2 to 4 client reviews with name, suburb and written permission | content.js `testimonials` |
| Google reviews link | content.js `reviewsUrl` |
| Real numbers, dated (for example "120 homes completed, as at 1 November 2026") | content.js `stats` |
| Facebook and Instagram links, once the accounts exist | content.js `social` |

## Setup
| Need | Goes in |
|---|---|
| Web3Forms access key, so enquiries arrive without the visitor's email app | content.js `formEndpoint`, `web3formsKey` |
| Domain name | `canonical`, `og:url`, `sitemap.xml`, and remove `noindex` from `index.html`, `privacy.html`, `robots.txt` and `vercel.json` |

## Added for the merged design (concept 11)
| Need | Goes in |
|---|---|
| Which services they really offer, especially knockdown rebuild (listed in the enquiry form as a job type) and duplexes | page: the enquiry form's job types and the services section |
| WhatsApp number, if they take enquiries there | content.js `whatsapp` (international digits, for example 61400000000) |
| Suburbs or regions they build in | content.js `areas` (footer "Where we build" line) |
| A downloadable building guide (PDF), if they have one | content.js `guideUrl` |
| Confirm the progress payment stages in their contract (the "Built in layers" section uses the usual base, frame, lock-up, fixing and practical completion) | page: Built in layers |
