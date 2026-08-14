# Supply Kanban (QR reorder)

Phone-scannable kanban for workplace supplies. Print a QR for each bin, scan when stock runs low, and request a reorder from any phone.

## How it works

1. **Catalog** — add supplies (name, SKU, location, reorder qty, vendor).
2. **QR Labels** — print labels and stick them on bins / shelf faces (or classic 2-bin kanban cards). Each QR embeds the item details, so phones do not need a shared login.
3. **Scan** — open the QR with a phone camera → **Request reorder** (opens an email draft to purchasing).
4. **Board** — on the ops / purchasing browser, track **On shelf → Needs reorder → On order**, then mark received when stock arrives.
5. **Settings** — set purchasing email + team name; export/import JSON to move the catalog between machines.

Board state lives in the browser (`localStorage`). Reorders from other phones travel via email (or by using the same browser profile). A shared backend can come later if you want live sync.

## Run locally

No build step. Serve the folder (needed so phone scans resolve to a real URL):

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080` (or your machine’s LAN IP from a phone on the same network).

## Deploy

Works with Netlify Drop, GitHub Pages, or Vercel (static). Config files `netlify.toml` and `vercel.json` are included.

After deploy, set the purchasing email under Settings, print labels, and stick them on bins.

## Sample data

First load seeds a few warehouse/office supplies so you can try the board and labels immediately. Reset anytime from Settings. Re-print labels after editing an item so the QR payload stays current.
