/* One source for the section picker: which sections exist, and which designs offer each one.
   Thumbnails live at designs/<slug>/sec-<key>.webp (made by tools/section-thumbs.mjs). */
window.MIX = {
  designs: [
    ['01-night-shift', 'Night Shift'], ['02-blueprint', 'Blueprint'], ['03-site-diary', 'Site Diary'],
    ['04-hard-hat', 'Hard Hat'], ['05-glasshouse', 'Glasshouse'], ['06-before-after', 'Before and After'],
    ['07-control-room', 'Control Room'], ['08-timber', 'Timber'], ['09-skyline', 'Skyline'],
    ['10-quote-builder', 'Quote Builder'], ['11-the-build', 'The Build'], ['12-front-door', 'Front Door']
  ],
  sections: [
    { key: 'theme', name: 'Colour theme', kind: 'theme', sel: '#top', note: 'The colours for the whole site. Whichever sections you choose are redrawn in this theme. The preview shows it on The Build.' },
    { key: 'hero', name: 'Hero', sel: '#top', note: 'The first screen: headline, main action and the signature animation.' },
    { key: 'band', name: 'Service band', sel: '#ticker, #marquee, #band', only: ['01-night-shift', '04-hard-hat', '11-the-build'], optional: true, note: 'The scrolling strip of services under the hero.' },
    { key: 'services', name: 'What we build', sel: '#services', note: 'The four services: new homes, renovations, fit-outs, light commercial.' },
    { key: 'layers', name: 'Built in layers', sel: '#layers', only: ['11-the-build'], optional: true, note: 'The Australian contract stages with the exploded blueprint house.' },
    { key: 'sketch', name: 'Sketch your home', sel: '#sketch', only: ['11-the-build'], optional: true, note: 'Pick a style, roof and Colorbond colour, then try it on a photo of your block.' },
    { key: 'process', name: 'How a job runs', sel: '#process', note: 'The five stages from site visit to final certificate.' },
    { key: 'projects', name: 'Projects', sel: '#projects', note: 'Recent work.' },
    { key: 'people', name: 'About the team', sel: '#people', note: 'Who you deal with.' },
    { key: 'faq', name: 'Questions', sel: '#faq', note: 'Common questions.' },
    { key: 'contact', name: 'Enquiry', sel: '#contact', note: 'The quote form and contact details. In Quote Builder the form is the hero itself.' },
    { key: 'footer', name: 'Footer', sel: 'footer.foot', note: 'The closing section.' }
  ]
};
