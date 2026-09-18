# Expires

Papers that die on a date. Warranty, plates, permit, insurance,
domain. See what is due. Late papers show up as a mailed notice.
Drop `src/lib/` into a React app you already have.

The sample is Pell Street Motors. Names are fake. Emails end in
`.example`.

## Who it is for

A shop or household that already runs React and has a few papers
with an expire date. They finish "what is due, and where is the
paper."

## What you get

Copy `src/lib/`. That folder is the component.

- `Workspace.jsx` - the clerk desk plus the open paper
- `PaperPage.jsx` - add a paper and edit one
- `expires.css` - the look
- `papers-json.js` - dates, due piles, download, load parse
- `sample-papers.js` - Pell Street Motors sample
- `index.js` - the import

No account. Nothing sends mail. Host apps pass `value` and
`onChange`. The demo keeps the book in the browser. Reset sample
if you want Pell Street back. Old JSON with `{ id, name, kind,
expires, where }` still loads.

Late papers sit as a mailed notice. Good thru is the date. The
due tray is date-first and grouped by kind. Set 14, 30, or 60
days. Later stays folded. Open a paper for the registration
card. Renew rolls the term and keeps the previous date. Hold a
late paper until a day and it leaves the late pile. Find matches
the name or the plate. A blank date or a junk cost misses.
Escape cancels. Quiet Remove with undo. Print the notice or the
due tray. j and k move through late then soon. Enter opens.
n adds. / finds.

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:48417/

Files: https://github.com/Aaronlb912/expires

## Demo

![The clerk desk. Late dealer plates sit as a mailed notice.](docs/media/expires-page.png)

![Renew rolled the date. Was good thru stays on the card.](docs/media/expires-result.png)

![Type a word in cost. Cost has to be a number.](docs/media/expires-miss.png)

https://github.com/user-attachments/assets/ad5e2fa1-6d5a-4b89-98df-d595f1bff123

Repo copy: [docs/media/expires-demo.mp4](docs/media/expires-demo.mp4)

Voice is Microsoft Andrew Neural. Music is Wallpaper by Kevin MacLeod (incompetech.com), CC BY 3.0.

## Use it in your own React app

1. Copy the `src/lib/` folder into your project (for example
   `src/lib/`).
2. Import the workspace.

```jsx
import { useState } from 'react'
import { Workspace, sampleBook } from './lib/index.js'

export function Papers() {
  const [book, setBook] = useState(sampleBook)
  return <Workspace value={book} onChange={setBook} />
}
```

Change the title and the papers. Edit `src/lib/expires.css` if
you want a different look.

`value` is a book: `title`, `papers`, and `dueWindowDays`
(14, 30, or 60). A paper has `id`, `name`, `kind`, `expires`,
`where`, `issuer`, `notes`, `ref`, `termMonths`,
`previousExpires`, `holdUntil`, and `cost`. Pass `onChange`
when the book changes.
