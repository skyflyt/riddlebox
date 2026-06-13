# Riddlebox

Classic logic and probability puzzles, made playable in the browser.

**Live:**

- GitHub Pages: <https://skyflyt.github.io/riddlebox/>
- here.now (edge-hosted via Cloudflare): <https://proud-marsh-6hvx.here.now/>

Each riddle is set up as a real interactive scene — read the story, try the
trick, then reveal the math. Vanilla JavaScript, no build step, no servers,
no analytics. Open one in a browser and play.

## Riddles included

| | | |
|-|-|-|
| **The Emperor's Proposition** | Probability | Split 50 white and 50 black marbles between two jars so the emperor's blind draw is most likely to come up white. |
| **Three Switches, Three Bulbs** | Logic | Three switches in one room, three bulbs in the next. One trip through the door. Identify them all. |
| **The Monty Hall Show** | Probability | Pick a door. The host opens a goat. Stay or switch — and watch the running tally pull away from 50/50. |
| **Wolf, Goat & Cabbage** | Constraint | One boat. The farmer plus one passenger. Nobody eats anybody. Ferry them across. |

## Running locally

There is nothing to install. Any static file server will do:

```bash
# Python
python -m http.server 8080

# Node (with http-server)
npx http-server -p 8080
```

Then open `http://localhost:8080`.

## Deploying

Pushes to `main` automatically deploy to GitHub Pages via
`.github/workflows/pages.yml`.

## Stack

- Vanilla HTML, CSS, and ES modules — no bundler, no framework.
- One module per riddle under `scripts/riddles/`, registered in `scripts/app.js`.
- Per-riddle theming via `body[data-theme]` plus stylesheets under `styles/riddles/`.

See `AGENTS.md` for the contract and the no-secrets policy that applies
permanently to this repo.

## License

MIT — see [LICENSE](./LICENSE).
