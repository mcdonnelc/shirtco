const assert = require("node:assert/strict");
const {
  colorForPart,
  normalizePart,
  swatchBackground
} = require("../assets/color-utils.js");

assert.equal(normalizePart("White/Charcoal CMB".split("/")[1]), "charcoal");
assert.equal(normalizePart("Navy Stone Stitch"), "navy stone");
assert.equal(colorForPart("Black"), "#171717");
assert.equal(colorForPart("Heather Grey"), "#a8aaad");
assert.equal(colorForPart("Unknown Supplier Color"), "#d2d5d3");

assert.equal(swatchBackground("Black"), "#171717");
assert.match(
  swatchBackground("Black/White"),
  /^linear-gradient\(135deg, #171717 0%, #171717 50%, #ffffff 50%, #ffffff 100%\)$/
);
assert.match(swatchBackground("White/Navy/Red"), /^linear-gradient/);
assert.match(swatchBackground("Realtree Max7/Brown"), /^repeating-linear-gradient/);
assert.equal(swatchBackground(""), "#d2d5d3");

console.log("Hat.co color utility tests passed.");
