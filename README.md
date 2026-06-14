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
| **Bridge & Torch** | Logic | Four people, one flashlight, seventeen minutes. Don't waste the slowest pair. |
| **The 12-Ball Problem** | Deduction | Twelve identical balls, one is odd. Find it — and say whether it's heavy or light — in three weighings. |
| **The Talking Room** | Classic | No mouth, no body, but it repeats what you say when sound comes back. |
| **Keys Without Locks** | Classic | Many keys, zero doors. The classic answer is a piano. |
| **Cities Without Houses** | Classic | Cities, forests, and rivers are all present, but none of them are physically there. |
| **Break It First** | Classic | The useful part starts after the shell cracks. |
| **What You Leave Behind** | Classic | The more you take, the more evidence trails along behind you. |
| **The Damp Helper** | Classic | It gets wetter every time it dries something else. |
| **Head, Tail, No Body** | Classic | Two named sides, no anatomy, and a habit of deciding things. |
| **Minute, Moment, Millennium** | Wordplay | Once in a minute, twice in a moment, and never in a thousand years. |
| **Through the Wall** | Classic | The invention sounds like x-ray vision until you notice the glass. |
| **Teeth That Cannot Bite** | Classic | Many teeth in a row, but not a single one is dangerous. |

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

- Vanilla HTML, CSS, and ES modules — no bundler, no framework, no external runtime assets.
- One module per riddle under `scripts/riddles/`, registered in `scripts/app.js`.
- Per-riddle theming via `body[data-theme]` plus stylesheets under `styles/riddles/`.

See `AGENTS.md` for the contract and the no-secrets policy that applies
permanently to this repo.

## License

MIT — see [LICENSE](./LICENSE).
