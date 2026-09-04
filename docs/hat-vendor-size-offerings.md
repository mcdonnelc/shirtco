# Vendor size offerings — Hat.co staging blank styles

Researched: 2026-09-04  
Source of product list: [Hat.co staging quote form](https://hatco2.wpenginepowered.com/get-a-quote/)  
Vendors allowed: SanMar, S&S Activewear (manufacturer pages used only to corroborate / resolve ambiguity).

| Hat.co label (SKU) | Manufacturer / product | SanMar | S&S Activewear | Exact labeled size option(s) | Direct vendor URL(s) | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 12" Sherpa Lined Cuffed Beanie (`SP12SL`) | Sportsman SP12SL | **Not found** (no Sportsman brand on SanMar) | Yes | **ONE SIZE** | [S&S SP12SL](https://www.ssactivewear.com/p/sportsman/sp12sl) | S&S Concept Creator + manufacturer/reseller specs agree on ONE SIZE. |
| Epic Performance Beanie (`3561`) | **DRI DUCK 3561** Epic Performance Beanie — *not* Flexfit/YP Classics | **Not found** as Flexfit/YP 3561; DRI DUCK 3561 on SanMar **unverifiable** | Yes (as DRI DUCK) | **One Size** | [S&S dri_duck/3561](https://www.ssactivewear.com/p/dri_duck/3561) (URL pattern; page intermittently blocked) · SSA SKU refs e.g. SSA-15595 | **Ambiguity resolved:** Hat.co places this under Flexfit/YP; wholesale identity is DRI DUCK 3561. |
| 8 Beanie (`SP08`) | Sportsman SP08 8" Beanie | **Not found** | Yes | **ONE SIZE** | [S&S sportsman/sp08](https://www.ssactivewear.com/p/sportsman/sp08) | S&S Concept Creator: Size ONE SIZE. |
| Adult Bio-Washed Classic Dad Hat (`VC300A`) | Valucap VC300A | **Not found** (Valucap not on SanMar) | Yes | **Adjustable** | [S&S valucap/vc300a](https://www.ssactivewear.com/p/valucap/vc300a) | S&S specs: Numerical Sizes = Adjustable (hat sizing 6 5/8"–7 3/8"). |
| Classic Dad Hat (`6245CM`) | Flexfit / YP Classics 6245CM | **Not found** as style `6245CM` (SanMar carries other Sport-Tek® YP Classics® SKUs, not this number) | Yes | **Adjustable** | [S&S yp_classics/6245cm](https://www.ssactivewear.com/p/yp_classics/6245cm) | S&S: Sizes Adjustable; Numerical Sizes Adjustable. Mfr OSFA 6 5/8–7 5/8. |
| Peach Twill Dad Hat (`326`) | Richardson 326 Peached Cotton Twill | Yes | Yes | SanMar: **One Size Fits Most** · S&S: **Adjustable** (also shown as OSFA on some S&S-fed resellers) | [SanMar 326](https://www.sanmar.com/p/72781_PowderBlue) · [S&S richardson/326](https://www.ssactivewear.com/p/richardson/326) | Mfr sizing option: **OSFM**. Hat.co “Peach Twill” = Richardson peached/peach brushed twill 326. |
| Lightweight Twill Cap (`VC100`) | Valucap VC100 | **Not found** | Yes | **Adjustable** | [S&S valucap/vc100](https://www.ssactivewear.com/p/valucap/vc100) | S&S-fed listings (e.g. ShirtSpace) size label: ADJUSTABLE. |
| CVC Snapback Cap (`6389`) | Flexfit / YP Classics 6389 CVC Snapback | **Not found** as style `6389` | Yes | **Adjustable** | [S&S yp_classics/6389](https://www.ssactivewear.com/p/yp_classics/6389) | Spec sheets: Numerical Sizes = Adjustable (6 5/8–7 5/8). |
| Pro Twill Snapback Cap (`212`) | Richardson 212 Pro Twill Snapback | Yes | Yes | **S/M**, **M/L** (SanMar copy: “Unisex Sizes: S/M, M/L”) | [SanMar 212](https://www.sanmar.com/p/72788_Black) · [S&S richardson/212](https://www.ssactivewear.com/p/richardson/212) | S&S size grid columns: S/M · M/L. **Not** a single OSFM/Adjustable SKU. |

## Staging form mismatch (sizes currently shown)

Hat.co staging currently exposes blanket size chips (often S/M/L/XL + One Size + ADJUSTABLE + OSFM) for beanies/dad/baseball categories. Vendor-supported options above are much narrower—especially **212 (S/M + M/L only)** and single-size beanies (**ONE SIZE / One Size** only).

## Method / limits

- Staging styles confirmed from live `hatco2` quote form (2026-09-04).
- Prefer live SanMar PDP JSON (`sizeLabel`) and live S&S PDP size grids/spec tables when reachable.
- S&S.com intermittently returns Cloudflare/403 from this environment; when blocked, sizes were taken from S&S Concept Creator feeds and/or prior successful S&S page captures / SSA-coded reseller mirrors, and marked only when labels matched across sources.
- “Not found” = no matching style number located on that vendor; not a claim that a similar product does not exist under a different brand code.
