# Financial Trajectory Playground

A month-by-month net worth simulator. Define income streams, expense streams,
one-off events, an arbitrary list of investment "buckets" (equity, gold, FD,
crypto, real estate, whatever), and any number of loans/EMIs — then watch a
stacked chart, a goal gauge, and a yearly table project your net worth
forward.

Nothing is hardcoded to a specific set of assets. Add or remove a bucket on
the Setup page and the chart, table, and gauge on the Dashboard update with
zero code changes.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. It loads with a sample plan pre-filled
(see `sample-config.json`) so there's something to look at immediately —
clear it out and enter your own numbers on the **Setup** tab.

## How state works

Everything lives in memory in the browser (a Zustand store) — there's no
backend and nothing is sent anywhere. Two ways to keep your numbers:

- **Export JSON** — downloads your current plan as a `.json` file.
- **Import JSON** — loads a previously exported file (or `sample-config.json`)
  back in.

Refreshing the page resets to the sample plan, so export before you close the
tab if you want to keep what you built.

## Model

- **Assets** — starting balance, annual return, compounding frequency,
  liquidity, and a contribution rule (gets a share of monthly leftover cash,
  a fixed recurring top-up, or none).
- **Liabilities** — principal, interest rate, tenure, and a prepayment rule
  (none, a fixed extra amount every month, or a share of monthly surplus) —
  useful for directly comparing "invest the extra cash" vs. "pay off the loan
  faster" by flipping one setting and re-running the simulation.
- **Income / expense streams** — each with its own growth rate; expenses can
  be monthly or a single annual hit (e.g. a yearly trip).
- **One-off events** — a temporary or permanent extra monthly cost starting
  at some point in the future.

Full simulation logic: `src/engine/simulate.ts`. Types: `src/types/plan.ts`.

## Deploying your own copy

It's a fully static build — no server-side code:

```bash
npm run build
```

Serve the `dist/` folder from anywhere: GitHub Pages, Netlify, Vercel, or
your own nginx/Apache box. No environment variables, no API keys, no
database.

### Docker

A GitHub Actions workflow (`.github/workflows/docker-publish.yml`) builds and
publishes an image to GHCR on every push to `main`:

```
ghcr.io/lexical-yoda/financial-trajectory-playground:latest
```

`docker-compose.yml` at the repo root just pulls that image and serves it on
port 8420 — point any compose-based runner (Portainer, Dockge, TrueNAS Apps,
plain `docker compose up -d`) at this file.

## License

MIT — see `LICENSE`. Fork it, deploy it, change the numbers, make it yours.
