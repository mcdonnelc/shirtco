# Hat.co form research and implementation brief

Last updated: 2026-09-03

## Environment map

| Site | Purpose | URL | WP Engine environment |
| --- | --- | --- | --- |
| Hat.co | Staging / form work | https://hatco2.wpenginepowered.com/ | `hatco2` |
| Hat.co | Production | https://hat.co/ | `hatco1` |
| Hat.co | Development (URL not yet verified) | — | `hatcodev` |
| Shirt.co | Staging / later form work | https://stlshirtco5.wpenginepowered.com/ | `stlshirtco5` |
| Shirt.co | Production | https://shirt.co/ | `stlshirtco` |

Do all Hat.co form work and test submissions on `hatco2` before moving it to production. Shirt.co follows after the Hat.co flow is proven.

## Goal

Build a mobile-first hat-ordering experience that:

1. Makes hat, color, decoration, quantity, and artwork choices easy.
2. Gives the customer useful guidance without requiring product expertise.
3. Captures a qualified quote request now.
4. Can add transparent pricing and payment later without replacing the front half of the flow.

The current Hat.co experience is a lead form, not a checkout. The immediate reported problems are poor mobile usability and color circles that do not expose every available color.

## Competitor findings

### HatLaunch

Observed flow: **Select hats → Upload artwork → Checkout**.

- Product cards include decoration, hat style/color, quantities, and quantity pricing.
- Customers can mix styles, sizes, and colors while retaining volume pricing.
- Pricing is shown before checkout; proof approval still happens before production.
- The site repeats “No quotes / transparent pricing,” no minimums, turnaround, artwork help, and quality assurances.
- Existing customers can indicate that their artwork is already on file.

Useful lesson: purchasing confidence comes from clear price and process information, even when artwork still needs human review.

Source: https://www.hatlaunch.com/order

### Zapped Headwear

Observed flow depends on decoration:

- Leather patch hats use a live mockup customizer, quantity selection, and checkout.
- Embroidery, rubber patches, and less-standard work route to a quote-and-mockup request.
- Minimums and lead times are stated by decoration type.
- Product pages combine real product photography, color choice, price, lead time, and order minimum.

Useful lesson: use a fast purchase path for standardized work and preserve an assisted quote path for complex work. Hat.co does not need to force every job through the same flow.

Sources:

- https://www.zappedheadwear.com/
- https://www.zappedheadwear.com/pages/custom-hat-decoration-types
- https://www.zappedheadwear.com/pages/frequently-asked-questions

### Holtz Headwear

Observed flow: **Choose a specific hat/product → Select color and quantity → Purchase → Email artwork → Receive proof**.

- Product pages show tiered quantity discounts prominently.
- A Richardson 112 product page exposes many named two-tone colors instead of reducing them to generic swatches.
- One-time die/setup costs are explained before purchase.
- Customers without artwork are offered editable templates.

The post-purchase artwork-by-email step adds friction and is not worth copying. Its strong product imagery, concrete color names, and visible volume discounts are worth copying.

Sources:

- https://holtzheadwear.com/
- https://holtzheadwear.com/products/debossed-heat-pressed-richardson-112-trucker-custom-leather-patch-hat-with-your-logo

### Custom Ink

Observed flow: **Browse product → Design/upload and preview → Quantity → Cart → Shipping/payment**, followed by an expert artwork review.

- Hat color and artwork are previewed on the actual product.
- Pricing is positioned as all-inclusive.
- Customers can proceed without production expertise because a real person checks every design.
- Mobile controls focus on one task at a time, with a persistent “Next” action.

Useful lesson: the form should reassure users that an imperfect file or uncertain choice will not ruin their order.

Source: https://www.customink.com/products/hats/1

### CapBeast

Observed flow: **Choose style → Add text/upload logo in designer → Preview → Quantity → Checkout**.

- No-minimum and volume-discount messages reduce purchase anxiety.
- The visual designer creates ownership before checkout.
- Turnaround and quality guarantees are visible.

Useful lesson: a basic visual preview is valuable later, but Hat.co can improve conversion now without waiting for a full product customizer.

Source: https://admin.capbeast.com/

## Recommended Hat.co quote flow (phase 1)

Use a five-step, mobile-first flow. Show one decision group at a time and keep a sticky bottom action on small screens.

### 1. What are you looking for?

Large visual cards:

- Trucker
- Baseball / structured
- Dad cap / unstructured
- Rope / golf
- Beanie
- Not sure — help me choose

Do not lead with supplier model numbers. After a style choice, show a short “popular picks” set with an option to browse all.

### 2. Choose a hat and color

Each hat card should include:

- Real front/three-quarter product image
- Brand and model (for example, Richardson 112)
- Plain-language fit/profile
- Starting price or “quote” until pricing is ready
- Available color count

Color behavior:

- Show every available color, not a clipped horizontal row.
- Use a responsive grid or an explicit **View all N colors** control.
- Use the actual color-specific hat thumbnail where available.
- For two-tone hats, use a split-color swatch plus the full color name (for example, “Charcoal / White”).
- Keep the selected color name visible; never rely on color alone.
- Give each target at least a comfortable finger-sized hit area and a strong selected state.
- Include search/filter for large Richardson color sets.
- Load swatches lazily, but never hide options because an image is missing; use a labeled fallback.

This follows Baymard's mobile product research: color is a primary visual decision, and hiding swatches on mobile prevents customers from evaluating products.

Source: https://baymard.com/blog/mobile-interactive-color-swatches

### 3. Decoration and artwork

Use visual examples for:

- Embroidery
- Leather patch
- Woven/embroidered patch
- PVC patch
- DTF/full color
- Not sure — recommend the best method

Then ask:

- Upload logo/artwork
- Use artwork already on file
- I need design help

Accept common image and vector files. Explain that a production artist will review the artwork and send a proof before production. Allow users to continue if they cannot upload from their phone.

### 4. Quantity and timing

- Use quantity presets such as 12, 24, 48, 72, 144, and Custom.
- Allow mixed hat colors with a simple “Add another color” action.
- Ask the in-hands date, not an internal production deadline.
- Clearly flag rush timing and avoid promising availability until inventory is confirmed.
- Show a live order summary.

### 5. Contact and review

Only require:

- Name
- Email
- Phone
- Shipping ZIP code

Company and project notes can be optional. Show a compact summary with edit links for hat, color, decoration, quantity, artwork, and date. The primary button should set the correct expectation: **Get my quote & free proof**, not “Submit.”

After submission:

- Give a clear confirmation and response-time promise.
- Email the customer a copy of their selections and uploaded-art confirmation.
- Send structured selection data to the sales team, not a prose-only notification.
- Provide a call/text alternative for urgent projects.

## Mobile form rules

- Single-column layout under tablet width.
- Labels remain visible above inputs; do not use placeholders as labels.
- Use native email, telephone, number, and date input modes.
- Keep validation inline and preserve all entered values after an error.
- Collapse completed steps into summaries with an Edit action.
- Show “Step X of 5” plus meaningful step names.
- Keep Back secondary and Continue primary.
- Avoid modal dialogs for core choices.
- Do not request account creation.
- Minimize initial page weight: lazy-load nonselected product/color images.

Baymard reports that checkout complexity causes abandonment and recommends minimizing fields and collapsing completed mobile steps into useful summaries.

Sources:

- https://baymard.com/blog/mobile-ecommerce-checkout-forms
- https://baymard.com/blog/accordion-checkout-usability

## Product imagery and data

Preferred order of operations:

1. **S&S Activewear API v2** for programmatic style, SKU, swatch, and color-specific front/back/side images. It exposes `styleImage`, `colorSwatchImage`, `colorFrontImage`, `colorBackImage`, and other media fields. Access uses the S&S account number and API key.
2. **SanMar Data Library / Media Library** for customer-authorized product images, color data, and downloadable image sets. PromoStandards or SanMar integrations can support a later inventory connection.
3. **Richardson product/dealer assets** for Richardson-specific products. Public product pages offer individual image downloads; dealer tooling and R3D support richer designs but no public bulk image API was found.

Do not hotlink supplier website images in production. Confirm the company's customer/dealer usage rights, download approved assets, optimize them to WebP/AVIF, and serve them from Hat.co's own media library or CDN. Store supplier style/color IDs with each asset so imagery can later connect to price and inventory data.

Sources:

- https://api.ssactivewear.com/v2/
- https://www.ssactivewear.com/marketing/edi
- https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary
- https://www.sanmar.com/marketing/medialibrary
- https://richardsonsports.com/product/112-trucker-hat
- https://richardsonsports.com/customize/r3d-customizer

## Recommended initial catalog

Start with a deliberately small set of proven products instead of exposing the full supplier catalog:

- Richardson 112 trucker
- Richardson 112FP five-panel trucker
- Richardson 115 low-profile trucker
- Richardson 256 rope cap
- One unstructured/dad cap
- One performance cap
- One beanie
- “I want a different hat” assisted option

Confirm the exact list, current supplier availability, decoration compatibility, and pricing before implementation.

## Path from quote to checkout

Design phase 1 selections as order data now:

`hat style → supplier style/color ID → decoration → artwork → quantity allocations → due date → customer`

Then add commerce in stages:

1. Quote form with structured data and human pricing.
2. Instant estimated price ranges and quantity discounts.
3. Exact pricing for supported combinations.
4. Deposit or full-payment checkout for standard jobs.
5. Proof approval and reorder flow.

Keep unusual combinations, rush jobs, uncertain inventory, and complex artwork on the assisted quote path even after checkout launches.

## Measurement plan

Track without storing uploaded artwork or personal details in analytics:

- Form viewed
- Flow started
- Each step completed
- Hat/color selected
- Artwork path selected
- Validation error by field
- Form completed
- Call/text link clicked

Measure mobile and desktop separately. Primary metrics are start-to-completion rate, drop-off by step, qualified lead rate, and time to complete. Compare the new staging flow with the current baseline before production.

## Staging acceptance checklist

- All configured colors are visible and selectable at 320, 375, 390, and 430 px widths.
- Two-tone and light/white colors remain identifiable.
- Touch targets and keyboard focus are obvious.
- Back/Edit never loses selections or uploads.
- The form works with keyboard only and announces validation errors.
- Test leads reach the correct internal inbox and customer confirmation.
- Supplier images are approved, optimized, and served locally/CDN.
- Analytics events fire once and contain no personal data.
- No test submission triggers production, purchasing, or customer automation.
- Production migration has a rollback point and does not overwrite newer production leads/content.
