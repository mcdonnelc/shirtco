# Blank hat size offerings (SanMar / S&S Activewear)

Research date: **2026-09-04**

Sources: S&S Activewear product pages (live snippets + Wayback archives), SanMar Coveo catalog (`ec_style_number` / `ec_size`), manufacturer pages for corroboration only. Hat.co staging (`hatco2.wpenginepowered.com`) product HTML was Cloudflare-blocked from this environment; style list taken from the user request and `docs/hat-size-catalog.md`.

## Ambiguity: 110 vs 110M

| Code | Actual product | Brand |
| --- | --- | --- |
| **110** | R-Flex Fitted Trucker Cap | **Richardson** |
| **110M** | 110® Mesh-Back Cap (Flexfit Tech + snapback) | **Flexfit / Yupoong** — *not* a Richardson style |

If Hat.co labels “Richardson 110M,” that is a brand/style mismatch; treat as Flexfit 110M.

## Size table

| Style (as listed) | Manufacturer / product name | SanMar? | S&S? | Exact labeled size options | Source URL(s) |
| --- | --- | --- | --- | --- | --- |
| Richardson 112 | Richardson Snapback Trucker Cap / Trucker Cap | **Yes** (style `112`) | **Yes** | **S&S:** `OSFM` (rolling label also `MD-LG` / sold as `M/L`) **+ `XL`** (XL limited colors). **SanMar:** `OSFA` (label note: OSFM→`MD-LG`) **+ `SM` + `XL`** (SM/XL limited colors per SanMar copy) | [S&S 112](https://www.ssactivewear.com/p/richardson/112) · [SanMar 112](https://www.sanmar.com/p/72574) · [mfr](https://richardsonsports.com/product/112-trucker-hat) |
| YP Classics / Flexfit 6606 | YP Classics Retro Trucker Cap | **No as `6606`** (SanMar has related Sport-Tek `STC39` YP Classics Retro Trucker, `OSFA` only — not the Flexfit/YP blank SKU) | **Yes** | **S&S:** `Adjustable` (one size; hat sizing ~6⅝–7⅝) | [S&S 6606](https://www.ssactivewear.com/p/yp_classics/6606) · SanMar related only: [STC39](https://www.sanmar.com/p/8984) |
| Richardson 110 | Richardson R-Flex Trucker Cap | **No** (not in SanMar Richardson headwear set as of research) | **Yes** | **S&S:** `S/M` – `L/XL` | [S&S 110](https://www.ssactivewear.com/p/richardson/110) · [mfr](https://richardsonsports.com/product/110-r-flex-trucker-hat) |
| Richardson 110M → **Flexfit 110M** | Flexfit 110® Mesh-Back Cap | **Yes** (style `FF110M`) | **Yes** | **Both:** `OSFA` / `Adjustable` (S&S numerical label `OSFM`) | [S&S 110M](https://www.ssactivewear.com/p/flexfit/110m) · [SanMar FF110M](https://www.sanmar.com/p/75217) · [mfr](https://www.flexfit.com/hat/flexfit-110-mesh-cap) |
| YP Classics / Flexfit 6597 | Flexfit Cool & Dry Sport Cap | **No** (not in SanMar’s 8 Flexfit SKUs) | **Yes** | **S&S:** `S/M` – `L/XL` | [S&S 6597](https://www.ssactivewear.com/p/flexfit/6597) · [mfr](https://www.flexfit.com/hat/flexfit-cool-dry-sport) |
| YP Classics / Flexfit 6580 | Flexfit Pro-Formance® Cap | **No** (not in SanMar’s 8 Flexfit SKUs) | **Yes** | **S&S:** `S/M` – `L/XL` | [S&S 6580](https://www.ssactivewear.com/p/flexfit/6580) · [mfr](https://www.flexfit.com/hat/flexfit-pro-formance) |
| Richardson 112Y | Richardson Youth Trucker Snapback Cap | **No** (not in SanMar Richardson headwear set) | **Yes** | **S&S:** `Adjustable` (youth fit; ~6⅜–6⅝ / ages 3–6) | [S&S 112Y](https://www.ssactivewear.com/p/richardson/112y) |
| Flexfit 6277Y | Flexfit Youth Cotton Blend Cap | **No** (SanMar has adult `FF6277` only: `S/M`, `L/XL`, `X/2X`) | **Yes** | **S&S:** `One Size` (youth fit; ~6½–7) | [S&S 6277Y](https://www.ssactivewear.com/p/flexfit/6277y) |
| 2260Y Small Fit Cotton Twill Cap | Valucap (ex-Sportsman) Youth Small Fit Cotton Twill Cap | **No** | **Yes** | **S&S:** `Adjustable` (labeled Small Fit; ~6½–7¼; ages 5–small adult) | [S&S 2260Y](https://www.ssactivewear.com/p/valucap/2260y) |

## Explicitly unverifiable / caveats

| Item | Status |
| --- | --- |
| Live Hat.co staging size UI for these SKUs | **Unverifiable here** (Cloudflare block on `hatco2.wpenginepowered.com`) |
| Live S&S HTML (bot-blocked) | Size labels taken from Wayback captures (2024–2025) + indexed S&S page snippets (2026); re-confirm in logged-in S&S account before production |
| SanMar exact on-page size dropdown for 112 `SM`/`XL` vs `OSFA` by color | Catalog fields show all three size codes; SanMar copy says SM/XL only in listed colors — **color×size matrix not fully verified without account login** |
| Whether Hat.co “110M” is intended as Flexfit 110M | **Assumed** from industry SKU; confirm against staging product admin |
| SanMar Flexfit SKUs `6606`, `6597`, `6580`, `6277Y` | **Not present** in SanMar Flexfit brand set (`FF110F`, `FF110M`, `FF180`, `FF180AP`, `FF5001`, `FF6277`, `FF6511`, `FF6533` only) |

## Quick form-mapping recommendation

| Blank | Orderable size keys to expose |
| --- | --- |
| 112 | `OSFM`/`OSFA` (or `M/L`) + `XL` (+ SanMar-only `SM` if sourcing SanMar) |
| 6606 | `Adjustable` / OSFA only |
| 110 | `S/M`, `L/XL` |
| 110M | `Adjustable` / OSFA only |
| 6597, 6580 | `S/M`, `L/XL` |
| 112Y, 6277Y, 2260Y | single youth/small `Adjustable` or `One Size` |
