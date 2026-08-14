# Shirt Co Projects

One repository and GitHub Pages site for Shirt Co's internal software.

## Project structure

```text
shirtco/
├── index.html         # Project hub
├── hub.css            # Shared hub/planning-page styles
├── supplies/          # Live QR supply kanban
├── quotes/            # Quoting tool planning space
└── art/               # Art tracker planning space
```

Production URLs:

- Hub: `https://mcdonnelc.github.io/shirtco/`
- Supply Kanban: `https://mcdonnelc.github.io/shirtco/supplies/`
- Quoting Tool: `https://mcdonnelc.github.io/shirtco/quotes/`
- Art Tracker: `https://mcdonnelc.github.io/shirtco/art/`

Each tool owns its folder and can evolve independently. Add another tool by creating a new folder with an `index.html`, then add its card to the root hub.

## Supply Kanban

The supply app is a phone-scannable kanban for workplace supplies:

1. Add supplies in **Catalog**.
2. Print QR labels for bins and shelf faces.
3. Scan with a phone and request a reorder.
4. Track **On shelf → Needs reorder → On order**, then mark received.

QR codes embed item details, so phones do not need a shared login. Board state currently lives in each browser's `localStorage`; cross-device reorders travel by email until a shared backend is added.

## Run locally

No build step. Serve the repository root:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`. The Kanban is at `http://localhost:8080/supplies/`.

## Deploy

Works with Netlify Drop, GitHub Pages, or Vercel (static). Config files `netlify.toml` and `vercel.json` are included.

After deploy, open the Supply Kanban, set the purchasing email under Settings, and print fresh labels. QR labels must be printed from the production `/supplies/` URL.

The Kanban's first load seeds sample supplies so the workflow can be tested immediately. Reset anytime from Settings; re-print labels after editing an item so the embedded QR payload stays current.
