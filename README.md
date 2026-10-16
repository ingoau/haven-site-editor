# Haven site editor

A visual editor for your [Hack Club Haven](https://haven.hackclub.com) city page.

Your city's page is built from one JSON document that you submit through the
[Haven website form](https://forms.hackclub.com/haven-website). Writing that
JSON by hand is fiddly, so this editor lets you see the page and change it
directly:

- **Edit text in place.** Click any heading, line, question or answer in the
  preview and type.
- **Drag to reorder.** Hover a block (an FAQ question, schedule item, wooden sign,
  speech bubble, photo card, sponsor, footer paragraph) and drag its handle. The
  same lists can be reordered in the side panel, by drag or with the arrow keys
  on a handle. Schedule items can move between days.
- **Add, duplicate and delete** from the block's toolbar or the side panel.
- **Preview at real widths.** Desktop, tablet and phone previews lay the page out
  at 1440, 1024 and 390 px, so it looks the way it will on the site.
- **Everything else in the side panel:** links, pictures, crop positions, the
  share card, fonts, the language of the sign-up form, and every one of Haven's
  72 artwork slots.
- **Checked against Haven's own rules.** The editor runs Haven's schema on your
  document and points at anything the site would reject.
- **Saved in your browser.** Your work is kept in local storage and is there
  when you come back. Undo and redo cover every change.
- **Import and export** the document as a `.json` file, or drop a file onto the
  window to import it.

When you're done, **Copy & submit** copies the JSON and opens the form.

The export only includes what you changed. Anything you include is frozen to
what you typed, and everything you leave out keeps following the main Haven
page (see Haven's
[SITE_DATA.md](https://github.com/hackclub/haven/blob/main/SITE_DATA.md)).

## How it's built

The page sections, default copy, artwork and schema are copied from
[hackclub/haven](https://github.com/hackclub/haven), so the preview renders
with the same components and the same validation as the live site. The
section components in `src/lib/haven/` are Haven's with editing hooks added.
The live map in the hero is replaced by a stand-in, since it needs Haven's
servers.

- `src/routes/+page.svelte`: the editor
- `src/routes/preview/`: the page preview, loaded in a frame so its
  breakpoints and `vw` sizes match a real device; it talks to the editor over
  `postMessage`
- `src/lib/editor/doc.ts`: defaults, the minimal export, import and validation
- `src/lib/preview/edit.svelte.ts`: in-place editing, selection and drag and drop
- `src/lib/data/`: Haven's content, images, fonts and schema

SvelteKit (static adapter), Svelte 5, Tailwind CSS 4 and zod.

## Development

```sh
npm install
npm run dev     # http://localhost:5173
npm run check   # type-check
npm run build   # static site in build/
```

Pushing to `main` deploys to GitHub Pages through
`.github/workflows/deploy.yml`, built under `/<repo-name>`. Pages has to be
switched on once under Settings → Pages → Source: GitHub Actions; the workflow
can't do that itself.

## License

The editor is free software under the
[GNU Affero General Public License v3.0](LICENSE). If you run a modified
version for other people to use, you have to offer them its source.

The page sections, copy and artwork copied from
[hackclub/haven](https://github.com/hackclub/haven) (`src/lib/haven/`,
`src/lib/data/` and `static/images/`) belong to Hack Club. They are
included to make the preview match the real site, and this license does not
cover them.
