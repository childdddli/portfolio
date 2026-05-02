# 2026 Portfolio

**Home** (`index.html`) — Single-page landing with:

- **Hero** — Landing intro and primary CTA
- **Case studies** — Three cards linking to dedicated case study pages
- **About** — Short bio and personality
- **Bento grid** — Quick visual highlights of previous work
- **Contact** — Email and social links

**Case studies** (`case-study-1.html`, `case-study-2.html`, `case-study-3.html`) — Each page includes:

1. **Hook hero** — Staggered entrance animation (eyebrow, title, subtitle)
2. **Context** — Problem statement with a **stats sidebar** (e.g. key metrics) to anchor the problem
3. **My role** — 3-column grid (Role, Team, Duration)
4. **Key decisions** — Numbered accordion with **process pills** (Research, Ideation, Design, Validation)
5. **Final design** — Three mocked screens: Risk Matrix, Aggregation Hierarchy, Weighting Config
6. **Impact** — 3-card grid for outcomes/metrics
7. **Takeaway** — Full-width editorial pull quote

## Run locally

Open `index.html` in a browser, or use a simple server:

```bash
# Python 3
python -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Customize

1. **Copy** — Replace “Your Name”, taglines, and bio in `index.html`.
2. **Case studies** — Home: update card titles, descriptions, and add project images. Case study pages: edit copy in each section; replace Final design placeholders with your screen mocks (Risk Matrix, Aggregation Hierarchy, Weighting Config); add/remove accordion items or pills as needed.
3. **Bento** — Replace `.placeholder` spans with `<img>` tags or background images in `css/styles.css` for each `.bento__item`.
4. **Contact** — Set `href` and text for email and LinkedIn/Twitter in the contact section.
5. **Theme** — Edit CSS variables in `css/styles.css` (`:root`) for colors, spacing, and fonts.

## Structure

```
├── index.html           # Home (hero, case cards, about, bento, contact)
├── case-study-1.html    # Case study page 1
├── case-study-2.html    # Case study page 2
├── case-study-3.html    # Case study page 3
├── css/
│   ├── styles.css       # Global + home styles
│   └── case-study.css   # Case study page sections
├── js/
│   ├── main.js          # Header scroll behavior
│   └── case-study.js    # Key decisions accordion
└── images/              # Project and bento images
```
