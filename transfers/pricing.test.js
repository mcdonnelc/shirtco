const assert = require("node:assert/strict");
const {
  priceOrder,
  validateOrder,
  parsePartnerOrder,
  rateForSqIn,
  lineSqIn,
  DEFAULT_SETTINGS,
} = require("./pricing.js");

function test(name, fn) {
  fn();
  console.log(`ok  ${name}`);
}

test("10×10 × 24 uses volume rate", () => {
  const priced = priceOrder(
    { lines: [{ widthIn: 10, heightIn: 10, qty: 24 }] },
    DEFAULT_SETTINGS
  );
  assert.equal(priced.sqIn, 2400);
  assert.equal(priced.rate, 0.025);
  assert.equal(priced.subtotal, 60);
  assert.equal(priced.shipping, 8.5);
  assert.equal(priced.total, 68.5);
});

test("rate tiers match quoted .02–.03 / sq in", () => {
  assert.equal(rateForSqIn(4, DEFAULT_SETTINGS.rateTiers).rate, 0.03);
  assert.equal(rateForSqIn(1000, DEFAULT_SETTINGS.rateTiers).rate, 0.025);
  assert.equal(rateForSqIn(4999, DEFAULT_SETTINGS.rateTiers).rate, 0.025);
  assert.equal(rateForSqIn(5000, DEFAULT_SETTINGS.rateTiers).rate, 0.02);
});

test("shipping is free at $75", () => {
  const priced = priceOrder(
    { lines: [{ widthIn: 10, heightIn: 10, qty: 48 }] },
    DEFAULT_SETTINGS
  );
  assert.equal(priced.sqIn, 4800);
  assert.equal(priced.subtotal, 120);
  assert.equal(priced.shipping, 0);
  assert.equal(priced.total, 120);
});

test("wholesale 5,000+ sq in is $0.02", () => {
  const priced = priceOrder(
    { lines: [{ widthIn: 10, heightIn: 10, qty: 100 }] },
    DEFAULT_SETTINGS
  );
  assert.equal(priced.sqIn, 10000);
  assert.equal(priced.rate, 0.02);
  assert.equal(priced.subtotal, 200);
});

test("line square inches are width × height × qty", () => {
  assert.equal(lineSqIn({ widthIn: 11, heightIn: 14, qty: 12 }), 1848);
});

test("validateOrder catches missing ship-to and over-wide film", () => {
  const result = validateOrder({
    customer: { name: "Phil DeSerres", email: "phil@joto.example" },
    shipTo: {},
    lines: [{ name: "Banner", widthIn: 36, heightIn: 12, qty: 2 }],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((msg) => /wider than 30/.test(msg)));
  assert.ok(result.errors.some((msg) => /street address/.test(msg)));
});

test("parsePartnerOrder accepts Shopify-ish payloads", () => {
  const order = parsePartnerOrder({
    name: "#1042",
    source: "shopify",
    customer: { first_name: "Phil", last_name: "DeSerres", email: "phil@joto.example" },
    shipping_address: {
      first_name: "Jane",
      last_name: "Customer",
      address1: "123 Main St",
      city: "St. Charles",
      province_code: "MO",
      zip: "63304",
      country_code: "US",
    },
    line_items: [
      {
        title: "Front logo",
        quantity: 24,
        properties: { width: 10, height: 10, artwork_url: "https://cdn.example/logo.png" },
      },
    ],
  });
  assert.equal(order.partnerOrderId, "#1042");
  assert.equal(order.customer.email, "phil@joto.example");
  assert.equal(order.shipTo.city, "St. Charles");
  assert.equal(order.lines[0].fileUrl, "https://cdn.example/logo.png");
  assert.equal(order.lines[0].qty, 24);
  const priced = priceOrder(order, DEFAULT_SETTINGS);
  assert.equal(priced.total, 68.5);
});

test("invalid JSON throws a clear error", () => {
  assert.throws(() => parsePartnerOrder("{nope"), /not valid JSON/);
});

console.log("\nAll pricing and partner-payload tests passed.");
