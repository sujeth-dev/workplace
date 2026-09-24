# Cadbury Canvas strategy document

`Cadbury_Canvas_Strategy_v5.pdf` is the built document: the v4 strategy (online-first Phase 0,
34-month plan, seven gates) condensed to roughly the v1 length, in the v1 design (Fraunces / Figtree /
Caveat, wax-seal chapter marks, hand-drawn figures, stitched tables) on the full-width v4 grid.

## Build

    npm install          # Playwright; uses the pre-installed Chromium
    pip install pymupdf
    python3 build.py

`build.py` renders `index.html` with Chromium (`render.js`), finds each chapter's page to fill the
contents, re-renders, then stamps page numbers and the dotted left edge.

- `index.html` - all text
- `styles.css` - type, tables, notes, pull quotes; `figures.css` - cover, contents and figure layout
- `figures.js` - scripted figures (price ladder, campaign calendar, phase plan, gates)
- `assets/` - artwork reused from the v1 PDF (cover bar, seals, hand-drawn panels, curves)
