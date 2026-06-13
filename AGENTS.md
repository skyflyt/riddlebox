# AGENTS.md

Guidance for AI agents (Claude Code, Codex, etc.) working in this repo.

## Permanent rules

### 1. No secrets. Ever.

This is a **public, static frontend**. It runs entirely in the user's browser.
It should never need an API key, token, credential, or other secret — and it
must never contain or reference one, in source or in git history.

Concretely:

- Do not add `.env`, `secrets.*`, `*.key`, `*.pem`, or any credential file —
  not even as an example. The `.gitignore` already blocks them, but assume the
  guard is defensive, not permission.
- Do not commit API keys, OAuth client IDs/secrets, personal access tokens,
  database URLs, webhook URLs with tokens, or anything else that looks like
  authentication material.
- Do not introduce a backend, an auth layer, an analytics pixel, or any
  outbound network call that requires a secret. If you think the next step
  needs one of those, **the design is wrong** — stop and ask the maintainer
  first.
- If you ever discover something secret-looking in the diff or history, treat
  it as an incident: stop, rotate it, and rewrite the history before pushing.

### 2. Keep it light.

- Vanilla JavaScript, plain CSS, no build step. The repo deploys as-is to
  GitHub Pages.
- No npm dependencies unless absolutely necessary. If you add one, justify it
  in the commit message.
- Each riddle is a self-contained module. Shared code lives under
  `scripts/shared/` and `styles/shell.css`.

### 3. Commit style

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
`style:`. One logical change per commit. Don't bundle unrelated edits.

## Project layout

```
index.html                 Hub + scene host
scripts/
  app.js                   Hash router + riddle registry
  hub.js                   Hub view
  shared/                  FX engine, UI helpers
  riddles/<name>.js        One module per riddle: exports mount(root, ctx)
styles/
  shell.css                Design tokens + shared chrome
  hub.css                  Hub-specific
  riddles/<name>.css       Per-riddle theming
.github/workflows/pages.yml Deploys main → GitHub Pages
```

## Adding a riddle

1. Create `scripts/riddles/<id>.js` exporting `mount(root, { fx, riddle })`.
2. Create `styles/riddles/<id>.css` scoped under `body[data-theme="<id>"]`.
3. Register the riddle in the `RIDDLES` array in `scripts/app.js`.
4. Add a card art block in `scripts/hub.js`.
5. Link the new stylesheet from `index.html`.

That's the whole contract. No framework, no plugin system — just modules.
