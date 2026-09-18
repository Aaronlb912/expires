# TARGET 2026-09-18

Papers that expire. Warranty, plates, permit, insurance, domain.
See what is due in 30 days. Keep more than one paper. JSON in,
JSON out. Drop `src/lib/` into a React app you already have.

Prompt file (do not wait for a paste):
`C:\Users\aaron\OneDrive\Documents\prompts\other prompts\expires-copy-prompt.md`

Continue later:
`C:\Users\aaron\OneDrive\Documents\prompts\multi-session-build-prompt-react.md`

Kind: expiration log. Not a calendar. Not a table editor. Not a
search page.

Local URL: http://127.0.0.1:48417/
Repo folder: `C:\Users\aaron\Documents\expires`

Pages:
- Landing `#/`
- Sign in `#/sign-in` (local shop book, not an account)
- How `#/how`
- Desk `#/desk`

Auth: none. Sign in is this browser opening a shop book.

Sample: Pell Street Motors in `src/lib/sample-papers.js`. Fake
names. Email on `.example`.

## Session plan

- [x] Session 1: scaffold, sample papers with dates, due in 30
      days, add a paper, JSON download, demo running.
- [x] Session 2: search, kinds, miss on a blank or junk date,
      persist, empty state.
- [x] Session 3: richer fields, CSS, old JSON still loads.
- [x] E-A. Mailer, not a card. Late paper is a letter.
- [x] E-B. Renew. Roll `expires` by `termMonths`, write
      `previousExpires`.
- [x] R-0. TARGET points at the rebuild prompt.
- [x] R-1. New clerk shell.
- [x] R-2. Late letter in the new shell.
- [x] R-3. Due tray, 14 / 30 / 60, Later.
- [x] R-4. Registration card. Renew. Cost.
- [x] R-5. Hold, empty, late-where.
- [x] R-6. Keyboard and print.
- [x] R-7. Application CSS. 390. Print.
- [x] Session ship: screenshots, demo video, README Demo, LinkedIn
      draft, SHIPPED.
- [x] P-0. TARGET points at the pages prompt.
- [x] P-1. Hash router. Four views.
- [x] P-2. Sign in. File How and Sign out.
- [x] P-3. Landing.
- [x] P-4. How.
- [x] P-5. Walk it.
- [x] C-0. TARGET points at the copy prompt.
- [x] C-1. Landing and sign in.
- [x] C-2. How.
- [x] C-3. Desk misses, File, empty states.
- [x] C-4. README.

## This session

Copy C-0 through C-4. Plainer sentences. Do not mark a
second SHIPPED.

## Next session

Copy is in. Do not start another product. Do not mark a
second SHIPPED unless he asks.

## Usefulness check

1. Who else? A shop or household that already runs React and has
   a few papers that die on a date. They finish "what is due, and
   where is the paper."
2. Their data? Yes. Pass a book of papers, or load JSON.
3. Make it theirs? Yes. Title, kinds, CSS in `src/lib/expires.css`.
4. Take it? Yes. Copy `src/lib/` into their React `src/`.
5. No account? Yes. No signup. No npm publish. Sign in is local.
6. Coworker test? Yes. Zip `src/lib/`. They import it.
7. Keep a copy? Yes. Download JSON. The page in their app with
   their dates.
8. Miss and recover? Yes. Blank date. Junk date. Empty book.
   Empty shop name on sign in.
9. README says how? Yes. Who, run, local URL, hash routes, copy
   `src/lib/`, import, props, three stills, player URL.

## Go deep (done-means)

A person can land, open a shop book, read How, and use the desk.
A paper has more than a title (kind, date, where it lives). Sample
or blank. Work stays after a refresh in the demo. JSON download
works. Host apps get `value` / `onChange`. Due in 30 days is
obvious. A miss is recoverable. `src/lib/` copies in. Escape
cancels. Quiet Remove. Old JSON still loads.

## SHIPPED means

The desk already shipped 2026-09-18. This pass is pages around
it. Do not mark a second SHIPPED unless he asks.

SHIPPED 2026-09-18.
