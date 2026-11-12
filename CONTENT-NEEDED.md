# What we still need from 3M Construction

The site is built and works today. Anything below that has not been supplied is hidden, so nothing is made up. Send the items and they go in without a redesign.

**content.js** = `assets/content.js` (one file, plain text, one value per line). **page** = a small edit to `index.html`.

## Confirm before launch
| Need | Goes in |
|---|---|
| The real logo (SVG or a large PNG) and its exact colours. The site uses a placeholder "3M" tile and an amber accent until then | `img/logo.svg`, and the colour tokens at the top of `index.html` (`--accent`) |
| Registered company name and NZBN for the footer | content.js `legalName`, `nzbn` |
| Service area, e.g. "West Auckland" (shows in the hero and footer) | content.js `area` |
| Phone, email, office address, hours | content.js `phone`, `phoneLink`, `email`, `address`, `mapsUrl`, `hours` |
| Every promise on the page: fixed-price contracts, written variations, one site manager, weekly photo reports, own carpenters, tidy site, call back within one working day. Strike out any that are not true | page: services panels, "How a job runs", "Who you deal with", "What happens next" |
| The council area named in the process (site says Auckland Council) | page: "How a job runs" |
| Licensed Building Practitioner number(s), if they want to show them | content.js `lbp` |
| Memberships (for example Registered Master Builders, NZCB) with logo files | content.js `memberships` |
| Guarantee wording (for example Master Build 10-Year Guarantee) | content.js `guarantee` |

## Photos and projects
| Need | Goes in |
|---|---|
| 6 to 12 finished jobs: 2 to 4 photos each, type, suburb, what was done, and permission to show them | page: "Recent work" cards (currently illustrative stock photos with generic descriptions) |
| Photos of the team on site, and of the site manager(s) | content.js `team`, and the three photos in "Who you deal with" |
| A wide site or finished-home photo for the hero (landscape, at least 2000px wide) | `img/hero-site-*.webp` |
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
