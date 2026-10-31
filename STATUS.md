# STATUS

## What was built

A beginner manual and static website for using free AI to handle consumer-rights paperwork, created for Asdale Dynamics, LLC (Dylan Asdale, Indiana, formed October 2026).

**Topics covered:** warranty claims, repair-or-replace demands, complaint letters, and small-claims court.

**Project layout:**

- `LICENSE` — MIT License, copyright line exactly `Copyright (c) 2026 Asdale Dynamics, LLC`
- `README.md` — project overview, education-only disclaimer, privacy rules, credits Asdale Dynamics, LLC
- `docs/` — full beginner manual in Markdown:
  - `00-overview.md` — how to use, education-only notice, privacy safety rules
  - `01-free-ai-tools.md` — free web AI tools and local AI (Ollama, LM Studio), prompting guidance
  - `02-warranty-claims.md` — warranty claim step-by-step
  - `03-repair-or-replace.md` — repair-or-replace demands
  - `04-complaint-letters.md` — complaint letter writing
  - `05-small-claims-court.md` — small-claims court preparation
  - `06-demand-letter-templates.md` — printable template guide
  - `07-deadline-tracker.md` — deadline tracker instructions
- `site/` — static HTML site (no build step, no server; open any page in a browser):
  - `index.html` — landing page
  - `warranty-claims.html`, `repair-or-replace.html`, `complaint-letters.html`, `small-claims-court.html` — topic pages with steps, AI prompts, checklists
  - `demand-letters.html` — three printable demand-letter templates (warranty, repair-or-replace, complaint) with print CSS that hides navigation and paginates each letter
  - `deadline-tracker.html` — local-first deadline tracker; data saved only in browser `localStorage`, with add/toggle/delete, print, export, and import
  - `assets/css/style.css` — shared styles including `@media print` rules
  - `assets/js/tracker.js` — vanilla JS tracker logic, no dependencies

## How to run it

No installation required. Open `site/index.html` (or any page under `site/`) directly in a web browser. For printable letters, open `site/demand-letters.html` and use the browser's Print command. For the tracker, open `site/deadline-tracker.html`.

The Markdown manual in `docs/` can be read in any text editor or Markdown viewer.

## Verification results

- `node --check site/assets/js/tracker.js` — passed (syntax OK)
- Custom HTML validity check (void elements and optional end tags handled) — all 7 `site/*.html` files passed
- File tree confirmed: `LICENSE`, `README.md`, `docs/` (8 files), `site/` (7 HTML pages + css + js)
- `LICENSE` line 3 contains exactly `Copyright (c) 2026 Asdale Dynamics, LLC`
- `README.md` credits Asdale Dynamics, LLC
- No build step, no test framework, no secrets, API keys, or personal data in any file

## Known gaps

- No automated test suite or linter configured (static site; verified with node syntax check and HTML parsing)
- HTML validity checked with a lightweight custom parser, not a full HTML5 validator — pages render in standard browsers but were not run through the W3C validator
- Deadline tracker stores data in browser `localStorage` only; clearing browser data deletes entries (mitigated by export/print features)
- No attorney-reviewed legal content; all material is education-only, not legal advice
