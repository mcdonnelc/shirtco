# Supply Kanban (QR reorder)

Phone-scannable kanban for workplace supplies. Print a QR for each bin, scan when stock runs low, and the item moves onto the reorder board.

## How it works

1. **Catalog** — add supplies (name, SKU, location, reorder qty, vendor).
2. **QR Labels** — print labels and stick them on bins / shelf faces (or classic 2-bin kanban cards).
3. **Scan** — anyone opens the QR with their phone camera → one-tap **Request reorder**.
4. **Board** — track **On shelf → Needs reorder → On order**, then mark received when stock arrives.
5. **Settings** — optional purchasing email (opens a mailto draft on reorder), export/import JSON.

Data is stored in the browser (`localStorage`). Deploy the static files to a shared URL so every phone hits the same origin if you later add a backend; for this demo each browser keeps its own catalog.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

QR links use the current page URL + `#/reorder/<id>`, so serve over HTTP(S) (not `file://`) when testing phone scans on the same network.

## Deploy

Works with Netlify Drop, GitHub Pages, or Vercel (static). Config files `netlify.toml` and `vercel.json` are included.

## Sample data

First load seeds a few warehouse/office supplies so you can try the board and labels immediately. Reset anytime from Settings.
