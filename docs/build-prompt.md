# TARGET 2026-09-17

Papers that expire. Warranty, plates, permit, insurance, domain.
See what is due in 30 days. Keep more than one paper. JSON in,
JSON out. Drop `src/lib/` into a React app you already have.

Prompt file (do not wait for a paste):
`C:\Users\aaron\OneDrive\Documents\prompts\other prompts\expires-prompt.md`

Continue later:
`C:\Users\aaron\OneDrive\Documents\prompts\multi-session-build-prompt-react.md`

Kind: expiration log. Not a calendar. Not a table editor. Not a
search page.

Local URL: http://127.0.0.1:48417/
Repo folder: `C:\Users\aaron\Documents\expires`

Pages:
- Paper list: due soon first, then the rest. Add a paper. Search
  by name. Reset sample.
- Paper page: name, kind, expire date, where the paper lives,
  notes. Save. Escape cancels.

Auth: none.

Sample: Pell Street Motors in `src/lib/sample-papers.js`. Fake
names. Email on `.example`.

## Session plan

- [x] Session 1: scaffold, sample papers with dates, due in 30
      days, add a paper, JSON download, demo running.
- [ ] Session 2: search, kinds, miss on a blank or junk date,
      persist, empty state.
- [ ] Session 3: several books of papers or richer fields, CSS,
      old JSON still loads.
- [ ] Session ship: screenshots, demo video, README Demo, LinkedIn
      draft, SHIPPED.

## This session

Session 1 done. List, add, open, miss, JSON, persist.

## Next session

Session 2. Search, kinds, empty-state polish.

## Usefulness check

1. Who else? A shop or household that already runs React and has
   a few papers that die on a date. They finish "what is due, and
   where is the paper."
2. Their data? Yes. Pass a book of papers, or load JSON.
3. Make it theirs? Yes. Title, kinds, CSS in `src/lib/expires.css`.
4. Take it? Yes. Copy `src/lib/` into their React `src/`.
5. No account? Yes. No signup. No npm publish.
6. Coworker test? Yes. Zip `src/lib/`. They import it.
7. Keep a copy? Yes. Download JSON. The page in their app with
   their dates.
8. Miss and recover? Yes. Blank date. Junk date. Empty book.
9. README says how? Session 1: who, run, local URL. Full copy
   `src/lib/` before SHIPPED.

## Go deep (done-means)

A person can add, open, edit, and remove their own papers. A paper
has more than a title (kind, date, where it lives). Sample or
blank. Work stays after a refresh in the demo. JSON download
works. Host apps get `value` / `onChange`. Due in 30 days is
obvious. A miss is recoverable. `src/lib/` copies in. Escape
cancels. Quiet Remove. Old JSON still loads.

## SHIPPED means

Session plan checked. Usefulness 1-9 all yes. README has copy
`src/lib/`, import, props, three tool screenshots, and a
github.com player URL. Log marked SHIPPED. Do not SHIPPED until
screenshots and video. No second product in this repo.
