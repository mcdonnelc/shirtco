(function attachHatCoSizeCatalog(root, factory) {
  const catalog = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = catalog;
  }

  root.HatCoQuoteSizes = catalog;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCatalog() {
  "use strict";

  const products = {
    "112": {
      sizes: ["SM", "OSFM", "XL"],
      note: "SM and XL are available in select colors.",
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/richardson/112"
    },
    "6606": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/yp_classics/6606"
    },
    "110": {
      sizes: ["S/M", "L/XL"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/richardson/110"
    },
    "110M": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/flexfit/110m"
    },
    "6597": {
      sizes: ["S/M", "L/XL"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/flexfit/6597"
    },
    "6580": {
      sizes: ["S/M", "L/XL"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/flexfit/6580"
    },
    "SP12SL": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/sportsman/sp12sl"
    },
    "3561": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/dri_duck/3561"
    },
    "SP08": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/sportsman/sp08"
    },
    "VC300A": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/valucap/vc300a"
    },
    "6245CM": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/yp_classics/6245cm"
    },
    "326": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/richardson/326"
    },
    "VC100": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/valucap/vc100"
    },
    "6389": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/yp_classics/6389"
    },
    "212": {
      sizes: ["S/M", "M/L"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/richardson/212"
    },
    "C936": {
      sizes: ["OSFA"],
      supplier: "SanMar",
      source: "https://www.sanmar.com/p/9437_BlkBlk/specSheetMeasurements"
    },
    "SP1300": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/sportsman/sp1300"
    },
    "SP1200": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/sportsman/sp1200"
    },
    "VC500": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/valucap/vc500"
    },
    "8110": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/flexfit/8110"
    },
    "3124P": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/imperial/3124p"
    },
    "2260Y": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/valucap/2260y"
    },
    "112Y": {
      sizes: ["Adjustable"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/richardson/112y"
    },
    "6277Y": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/flexfit/6277y"
    },
    "2050": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/valucap/2050"
    },
    "GB400": {
      sizes: ["One Size"],
      supplier: "S&S Activewear",
      source: "https://www.ssactivewear.com/p/the_game/gb400"
    }
  };

  function get(styleNumber) {
    return products[String(styleNumber || "").trim().toUpperCase()] || null;
  }

  return { get, products };
});
