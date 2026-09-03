(function attachHatCoQuoteColors(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.HatCoQuoteColors = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createColorUtils() {
  "use strict";

  const COLORS = {
    "aluminum": "#b9bec3",
    "amber gold": "#d39b2a",
    "army green": "#596247",
    "army olive": "#596247",
    "ash": "#dedede",
    "azure blue": "#377fbd",
    "baby blue": "#9fc9e2",
    "birch": "#e9e1cf",
    "biscuit": "#c8aa81",
    "black": "#171717",
    "blue teal": "#147f88",
    "brown": "#6e4b35",
    "butter": "#f3dfa0",
    "caramel": "#9a663c",
    "cardinal": "#8f2636",
    "carmel": "#9a663c",
    "charcoal": "#4c5054",
    "chocolate chip": "#665243",
    "coal": "#34383b",
    "coffee": "#49382f",
    "columbia blue": "#67a9d3",
    "coyote brown": "#8b6b4d",
    "cranberry": "#9d2948",
    "cream": "#f4eddb",
    "cyan": "#17a8bd",
    "dark green": "#1f4c38",
    "dark grey": "#53575a",
    "dark heather": "#686d70",
    "dark heather grey": "#686d70",
    "dark khaki": "#8b8062",
    "dark navy": "#172942",
    "forest": "#1f5038",
    "forest green": "#1f5038",
    "frost grey": "#aeb4b7",
    "gold": "#e0ad24",
    "grey": "#858b8f",
    "gunmetal": "#545b62",
    "heather charcoal": "#62676b",
    "heather grey": "#a8aaad",
    "hot pink": "#df438d",
    "ivory": "#f4f0df",
    "kelly": "#218c50",
    "kelly green": "#218c50",
    "khaki": "#b5a27c",
    "lavender": "#a993c9",
    "legion blue": "#365668",
    "light blue": "#8fc1dc",
    "light grey": "#c4c6c7",
    "light pink": "#e6b8cc",
    "loden": "#505a3f",
    "loden green": "#505a3f",
    "maroon": "#702d3e",
    "melange charcoal": "#62676b",
    "melange silver": "#b7b9bb",
    "mink beige": "#aa927c",
    "navy": "#1d3155",
    "neon blue": "#18aeda",
    "neon green": "#73cf45",
    "neon orange": "#ff7d2f",
    "neon pink": "#ff4e9b",
    "neon yellow": "#d9e93e",
    "olive": "#66704d",
    "orange": "#e8752e",
    "pink": "#dc8fb0",
    "powder blue": "#a9cce0",
    "purple": "#62448d",
    "quarry": "#777b7a",
    "red": "#c9363c",
    "red pepper": "#b93535",
    "royal": "#285fa8",
    "royal blue": "#285fa8",
    "safety green": "#b7db3d",
    "safety orange": "#f08a32",
    "safety pink": "#ed5ca8",
    "sand": "#cbbd9c",
    "sapphire": "#258fba",
    "silver": "#bfc2c4",
    "sky blue": "#79b8d8",
    "smoke blue": "#617b8c",
    "sport grey": "#b9bbbd",
    "spruce": "#31564a",
    "stone": "#b2a58c",
    "tan": "#b69a72",
    "texas orange": "#b9572b",
    "true blue": "#2868a8",
    "true navy": "#1d3155",
    "vegas gold": "#c2a35b",
    "white": "#ffffff",
    "yellow": "#edcf35"
  };

  function normalizePart(part) {
    return part
      .toLowerCase()
      .replace(/\bcmb\b/g, "")
      .replace(/\bstitch\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function colorForPart(part) {
    const normalized = normalizePart(part);

    if (COLORS[normalized]) {
      return COLORS[normalized];
    }

    const knownName = Object.keys(COLORS).find((name) => normalized.includes(name));
    return knownName ? COLORS[knownName] : "#d2d5d3";
  }

  function camoBackground(label) {
    const lower = label.toLowerCase();
    let palette = ["#4f583d", "#796c4d", "#2f3529", "#9a8a66"];

    if (lower.includes("black")) {
      palette = ["#151515", "#383838", "#555555", "#242424"];
    } else if (lower.includes("grey")) {
      palette = ["#54585a", "#878b8c", "#343839", "#b0b3b4"];
    } else if (lower.includes("pink")) {
      palette = ["#d889a9", "#735466", "#ead1db", "#997080"];
    } else if (lower.includes("tan") || lower.includes("max7")) {
      palette = ["#8a7453", "#b69a72", "#4c4937", "#d0b88e"];
    }

    return `repeating-linear-gradient(135deg, ${palette[0]} 0 8px, ${palette[1]} 8px 15px, ${palette[2]} 15px 23px, ${palette[3]} 23px 29px)`;
  }

  function makeGradient(colors) {
    if (colors.length === 1) {
      return colors[0];
    }

    const stops = colors.flatMap((color, index) => {
      const start = Math.round((index / colors.length) * 100);
      const end = Math.round(((index + 1) / colors.length) * 100);
      return [`${color} ${start}%`, `${color} ${end}%`];
    });

    return `linear-gradient(135deg, ${stops.join(", ")})`;
  }

  function swatchBackground(label) {
    if (!label || typeof label !== "string") {
      return "#d2d5d3";
    }

    if (/camo|realtree/i.test(label)) {
      return camoBackground(label);
    }

    const colors = label
      .split("/")
      .map(colorForPart)
      .slice(0, 3);

    return makeGradient(colors.length ? colors : ["#d2d5d3"]);
  }

  return {
    colorForPart,
    normalizePart,
    swatchBackground
  };
});
