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
| **The 3L / 5L Water Jugs** | Measurement | Fill, empty, and pour between two unmarked jugs until exactly four liters appear. |
| **Towers of Hanoi** | Sequencing | Move the stack across three pegs without ever placing a large disk on a small one. |
| **Lights Out** | Toggle | Every press flips a plus-shaped cluster. Turn the board completely dark. |
| **The 8-Puzzle** | Sliding | Slide numbered tiles through the blank space until the grid is in order. |
| **21 Sticks** | Strategy | Take 1, 2, or 3 sticks. Whoever takes the last one wins. |
| **Guides & Monsters** | Constraint | Move three guides and three monsters across without ever letting monsters outnumber guides. |
| **Frog Swap** | Sequencing | Slide and jump two frog teams until they trade sides. |
| **The 15 Magic Square** | Number | Place 1 through 9 so every row, column, and diagonal totals fifteen. |
| **Four Queens** | Spatial | Place four queens on a 4x4 board so none can attack another. |
| **Mini Mastermind** | Deduction | Guess a hidden three-color code from exact-hit and near-miss clues. |

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
