(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TransferPricing = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const SCHEMA = "dtfs.order.v1";
  const MAX_WIDTH_IN = 30;

  const SIZE_PRESETS = [
    { id: "custom", label: "Custom size", widthIn: "", heightIn: "" },
    { id: "mini", label: "Mini · 2×2", widthIn: 2, heightIn: 2 },
    { id: "small", label: "Small · 3×3", widthIn: 3, heightIn: 3 },
    { id: "pocket", label: "Pocket · 4×4", widthIn: 4, heightIn: 4 },
    { id: "youth", label: "Youth · 6×6", widthIn: 6, heightIn: 6 },
    { id: "medium", label: "Medium · 8×8", widthIn: 8, heightIn: 8 },
    { id: "standard", label: "Standard front · 10×10", widthIn: 10, heightIn: 10 },
    { id: "adult", label: "Adult front · 11×11", widthIn: 11, heightIn: 11 },
    { id: "large", label: "Large front · 11×14", widthIn: 11, heightIn: 14 },
    { id: "oversize", label: "Oversized · 12×17", widthIn: 12, heightIn: 17 },
    { id: "jumbo", label: "Jumbo · 15×20", widthIn: 15, heightIn: 20 },
  ];

  const DEFAULT_SETTINGS = {
    notifyEmail: "info@dtfs.co",
    shopName: "DTFS",
    shipFlat: 8.5,
    shipFreeAt: 75,
    minOrder: 0,
    maxWidthIn: MAX_WIDTH_IN,
    dpi: 300,
    rateTiers: [
      { minSqIn: 0, rate: 0.03, label: "Standard" },
      { minSqIn: 1000, rate: 0.025, label: "Volume" },
      { minSqIn: 5000, rate: 0.02, label: "Wholesale" },
    ],
  };

  function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function money(n) {
    const value = round2(n);
    const sign = value < 0 ? "-" : "";
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeTiers(tiers) {
    const list = Array.isArray(tiers) && tiers.length ? tiers : DEFAULT_SETTINGS.rateTiers;
    return list
      .map((tier) => ({
        minSqIn: Math.max(0, num(tier.minSqIn)),
        rate: Math.max(0, num(tier.rate)),
        label: String(tier.label || "Rate"),
      }))
      .sort((a, b) => a.minSqIn - b.minSqIn);
  }

  function lineSqIn(line) {
    const width = Math.max(0, num(line.widthIn));
    const height = Math.max(0, num(line.heightIn));
    const qty = Math.max(0, num(line.qty));
    return round2(width * height * qty);
  }

  function orderSqIn(lines) {
    return round2((lines || []).reduce((sum, line) => sum + lineSqIn(line), 0));
  }

  function rateForSqIn(totalSqIn, tiers) {
    const normalized = normalizeTiers(tiers);
    let chosen = normalized[0] || { minSqIn: 0, rate: 0.03, label: "Standard" };
    for (const tier of normalized) {
      if (totalSqIn >= tier.minSqIn) chosen = tier;
    }
    return chosen;
  }

  function shippingForSubtotal(subtotal, settings) {
    const shipFlat = Math.max(0, num(settings.shipFlat, DEFAULT_SETTINGS.shipFlat));
    const shipFreeAt = Math.max(0, num(settings.shipFreeAt, DEFAULT_SETTINGS.shipFreeAt));
    if (subtotal <= 0) return 0;
    if (shipFreeAt > 0 && subtotal >= shipFreeAt) return 0;
    return round2(shipFlat);
  }

  function priceOrder(order, settingsInput) {
    const settings = { ...DEFAULT_SETTINGS, ...(settingsInput || {}) };
    const lines = (order && order.lines) || [];
    const sqIn = orderSqIn(lines);
    const tier = rateForSqIn(sqIn, settings.rateTiers);
    const print = round2(sqIn * tier.rate);
    const minOrder = Math.max(0, num(settings.minOrder));
    const subtotal = round2(Math.max(print, print > 0 ? minOrder : 0));
    const shipping = shippingForSubtotal(subtotal, settings);
    const total = round2(subtotal + shipping);
    const pricedLines = lines.map((line) => {
      const area = lineSqIn(line);
      return {
        ...line,
        sqIn: area,
        lineTotal: round2(area * tier.rate),
      };
    });

    return {
      sqIn,
      rate: tier.rate,
      tierLabel: tier.label,
      print,
      minOrderApplied: minOrder > 0 && print > 0 && print < minOrder,
      subtotal,
      shipping,
      shippingLabel: shipping === 0 && subtotal > 0 ? "Free" : money(shipping),
      total,
      lines: pricedLines,
    };
  }

  function validateOrder(order, settingsInput) {
    const settings = { ...DEFAULT_SETTINGS, ...(settingsInput || {}) };
    const errors = [];
    const warnings = [];
    const customer = (order && order.customer) || {};
    const shipTo = (order && order.shipTo) || {};
    const lines = (order && order.lines) || [];
    const maxWidth = num(settings.maxWidthIn, MAX_WIDTH_IN);

    if (!String(customer.name || "").trim()) errors.push("Customer name is required.");
    if (!String(customer.email || "").trim()) errors.push("Customer email is required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email).trim())) {
      errors.push("Customer email does not look valid.");
    }

    const usableLines = lines.filter((line) => num(line.qty) > 0);
    if (!usableLines.length) errors.push("Add at least one transfer with a quantity.");

    usableLines.forEach((line, index) => {
      const label = line.name ? `"${line.name}"` : `Line ${index + 1}`;
      if (num(line.widthIn) <= 0 || num(line.heightIn) <= 0) {
        errors.push(`${label} needs a width and height.`);
      }
      if (num(line.widthIn) > maxWidth) {
        errors.push(`${label} is wider than ${maxWidth}" (max film width).`);
      }
      if (!String(line.fileUrl || "").trim() && !String(line.fileName || "").trim()) {
        warnings.push(`${label} has no artwork file or URL yet.`);
      }
    });

    const requiredShip = ["name", "address1", "city", "state", "postalCode"];
    requiredShip.forEach((key) => {
      if (!String(shipTo[key] || "").trim()) {
        errors.push("Ship-to is missing " + key.replace("address1", "street address") + ".");
      }
    });

    return { ok: errors.length === 0, errors, warnings };
  }

  function emptyLine() {
    return {
      id: "",
      name: "",
      widthIn: 10,
      heightIn: 10,
      qty: 1,
      fileUrl: "",
      fileName: "",
    };
  }

  function emptyOrder() {
    return {
      schema: SCHEMA,
      partnerOrderId: "",
      source: "portal",
      customer: { name: "", company: "", email: "", phone: "" },
      fulfillment: {
        whiteLabel: true,
        blindShip: true,
        packingSlipName: "",
        rush: false,
        unionPrint: false,
        notes: "",
      },
      shipTo: {
        name: "",
        company: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      lines: [emptyLine()],
    };
  }

  function asText(value) {
    return value == null ? "" : String(value).trim();
  }

  function parsePartnerOrder(input) {
    let data = input;
    if (typeof input === "string") {
      const trimmed = input.trim();
      if (!trimmed) throw new Error("Paste a JSON order payload first.");
      try {
        data = JSON.parse(trimmed);
      } catch {
        throw new Error("That payload is not valid JSON.");
      }
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Order payload must be a JSON object.");
    }

    const rawLines = Array.isArray(data.lines)
      ? data.lines
      : Array.isArray(data.line_items)
        ? data.line_items
        : [];

    const lines = rawLines.map((line, index) => {
      const props = line.properties || {};
      const width = num(line.widthIn ?? line.width ?? props.width ?? props.Width, 0);
      const height = num(line.heightIn ?? line.height ?? props.height ?? props.Height, 0);
      const qty = Math.max(0, Math.floor(num(line.qty ?? line.quantity, 0)));
      const fileUrl = asText(
        line.fileUrl ||
          line.file_url ||
          props.artwork ||
          props.artwork_url ||
          props._artwork_url ||
          props.file
      );
      return {
        id: asText(line.id) || `line_${index + 1}`,
        name: asText(line.name || line.title || props.name) || `Transfer ${index + 1}`,
        widthIn: width,
        heightIn: height,
        qty,
        fileUrl,
        fileName: asText(line.fileName || line.file_name || props.fileName),
      };
    });

    const customer = data.customer || {};
    const shipTo = data.shipTo || data.shipping_address || data.shippingAddress || {};
    const fulfillment = data.fulfillment || {};

    return {
      schema: SCHEMA,
      partnerOrderId: asText(data.partnerOrderId || data.orderId || data.name || data.id),
      source: asText(data.source) || "partner-json",
      customer: {
        name: asText(customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim()),
        company: asText(customer.company),
        email: asText(customer.email),
        phone: asText(customer.phone),
      },
      fulfillment: {
        whiteLabel: Boolean(fulfillment.whiteLabel ?? data.whiteLabel ?? true),
        blindShip: Boolean(fulfillment.blindShip ?? data.blindShip ?? fulfillment.whiteLabel ?? true),
        packingSlipName: asText(fulfillment.packingSlipName || customer.company),
        rush: Boolean(fulfillment.rush || data.rush),
        unionPrint: Boolean(fulfillment.unionPrint || data.unionPrint),
        notes: asText(fulfillment.notes || data.notes || data.note),
      },
      shipTo: {
        name: asText(shipTo.name || `${shipTo.first_name || ""} ${shipTo.last_name || ""}`.trim()),
        company: asText(shipTo.company),
        phone: asText(shipTo.phone),
        address1: asText(shipTo.address1 || shipTo.address),
        address2: asText(shipTo.address2),
        city: asText(shipTo.city),
        state: asText(shipTo.state || shipTo.province || shipTo.province_code),
        postalCode: asText(shipTo.postalCode || shipTo.zip),
        country: asText(shipTo.country || shipTo.country_code) || "US",
      },
      lines: lines.length ? lines : [emptyLine()],
    };
  }

  function orderPayload(order, priced) {
    return {
      schema: SCHEMA,
      partnerOrderId: order.partnerOrderId || "",
      source: order.source || "portal",
      customer: order.customer,
      fulfillment: order.fulfillment,
      shipTo: order.shipTo,
      lines: (priced ? priced.lines : order.lines).map((line) => ({
        name: line.name,
        widthIn: num(line.widthIn),
        heightIn: num(line.heightIn),
        qty: num(line.qty),
        sqIn: line.sqIn != null ? line.sqIn : lineSqIn(line),
        fileUrl: line.fileUrl || "",
        fileName: line.fileName || "",
      })),
      pricing: priced
        ? {
            sqIn: priced.sqIn,
            rate: priced.rate,
            tierLabel: priced.tierLabel,
            subtotal: priced.subtotal,
            shipping: priced.shipping,
            total: priced.total,
          }
        : undefined,
    };
  }

  return {
    SCHEMA,
    MAX_WIDTH_IN,
    SIZE_PRESETS,
    DEFAULT_SETTINGS,
    round2,
    money,
    num,
    lineSqIn,
    orderSqIn,
    rateForSqIn,
    shippingForSubtotal,
    priceOrder,
    validateOrder,
    emptyLine,
    emptyOrder,
    parsePartnerOrder,
    orderPayload,
  };
});
