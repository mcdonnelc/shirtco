const assert = require("node:assert/strict");
const { get, products } = require("../assets/size-catalog.js");

const expected = {
  "112": ["Adjustable"],
  "6606": ["Adjustable"],
  "110": ["S/M", "L/XL"],
  "110M": ["Adjustable"],
  "6597": ["S/M", "L/XL"],
  "6580": ["S/M", "L/XL"],
  SP12SL: ["One Size"],
  "3561": ["One Size"],
  SP08: ["One Size"],
  VC300A: ["Adjustable"],
  "6245CM": ["Adjustable"],
  "326": ["Adjustable"],
  VC100: ["Adjustable"],
  "6389": ["Adjustable"],
  "212": ["S/M", "M/L"],
  C936: ["OSFA"],
  SP1300: ["Adjustable"],
  SP1200: ["Adjustable"],
  VC500: ["Adjustable"],
  "8110": ["Adjustable"],
  "3124P": ["Adjustable"],
  "2260Y": ["Adjustable"],
  "112Y": ["Adjustable"],
  "6277Y": ["One Size"],
  "2050": ["One Size"],
  GB400: ["One Size"]
};

assert.equal(Object.keys(products).length, 26);

Object.entries(expected).forEach(([style, sizes]) => {
  const product = get(style);
  assert.ok(product, `${style} should be in the catalog`);
  assert.deepEqual(product.sizes, sizes, `${style} should have vendor sizes`);
  assert.match(product.source, /^https:\/\//);
  assert.ok(["SanMar", "S&S Activewear"].includes(product.supplier));
});

assert.equal(get("sp08"), products.SP08);
assert.equal(get("unknown"), null);
assert.equal(get(), null);

console.log("Hat.co vendor size catalog tests passed.");
