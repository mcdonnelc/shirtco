# Hat.co Quote UX

A small WordPress plugin that improves the existing Hat.co Gravity Form without replacing its fields, notifications, conditional logic, or stored entries.

## What it changes

- Converts the broken 40 px color circles into labeled, touch-friendly color cards.
- Generates single-, two-, and three-color swatches from the existing supplier color names.
- Gives camo and Realtree options a visible patterned fallback.
- Shows 12 popular colors initially and provides an explicit **View all N colors** control.
- Adds mobile-friendly minus/plus quantity controls while preserving the existing number inputs.
- Adds meaningful headings to the existing four form pages.
- Adds the confirmed proof workflow: no design tool, proof after quote approval and purchase, and no production before proof approval.
- Carries turnaround, review, and human artwork-review trust signals into the form.
- Keeps the primary form navigation visible on small screens.

The plugin targets Gravity Form `2` only on:

- `/get-a-quote/`
- `/get-a-quote-new-layout/`

## Staging installation

1. Create a zip whose root directory is `hatco-quote-ux`.
2. In the `hatco2` WordPress admin, open **Plugins → Add New Plugin → Upload Plugin**.
3. Upload, install, and activate the zip.
4. Purge the WP Engine cache.
5. Test `/get-a-quote/` at 320, 375, 390, and 430 px widths.

WP-CLI alternative:

```bash
wp plugin install hatco-quote-ux.zip
wp plugin activate hatco-quote-ux
wp cache flush
```

Do not activate on `hatco1` production until staging submissions, notifications, accessibility, and mobile behavior are approved.

## Local checks

```bash
node tests/color-utils.test.js
php -l hatco-quote-ux.php
```

## Rollback

Deactivate **Hat.co Quote UX**. The underlying Gravity Form and its data remain unchanged.
