const TP = window.TransferPricing;
const ORDERS_KEY = "transfer-orders-v1";
const SETTINGS_KEY = "transfer-settings-v1";
const DRAFT_KEY = "transfer-draft-v1";
const STATUSES = {
  new: { label: "New", next: "print", nextLabel: "Send to print" },
  print: { label: "In print", next: "shipped", nextLabel: "Mark shipped" },
  shipped: { label: "Shipped", next: null, nextLabel: null },
};

const main = document.querySelector("#main");
const toastEl = document.querySelector("#toast");

let settings = loadSettings();
let state = loadState();
let draft = loadDraft();
let toastTimer = null;
let inboxFilter = "all";

function uid(prefix = "DTF") {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(TP.DEFAULT_SETTINGS);
    return { ...structuredClone(TP.DEFAULT_SETTINGS), ...JSON.parse(raw) };
  } catch {
    return structuredClone(TP.DEFAULT_SETTINGS);
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadState() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return { orders: [] };
    const parsed = JSON.parse(raw);
    return { orders: Array.isArray(parsed.orders) ? parsed.orders : [] };
  } catch {
    return { orders: [] };
  }
}

function saveState() {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(state));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return withLineIds(TP.emptyOrder());
    return withLineIds({ ...TP.emptyOrder(), ...JSON.parse(raw) });
  } catch {
    return withLineIds(TP.emptyOrder());
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function withLineIds(order) {
  order.lines = (order.lines || []).map((line) => ({
    ...TP.emptyLine(),
    ...line,
    id: line.id || uid("LN"),
  }));
  if (!order.lines.length) order.lines = [{ ...TP.emptyLine(), id: uid("LN") }];
  return order;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  toastEl.hidden = false;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

function getRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "order";
  const [path, ...rest] = hash.split("/");
  return { path, param: rest.join("/") };
}

function pricedDraft() {
  return TP.priceOrder(draft, settings);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  keys.slice(0, -1).forEach((key) => {
    if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key];
  });
  cur[keys.at(-1)] = value;
}

function findLine(id) {
  return draft.lines.find((line) => line.id === id);
}

function findOrder(id) {
  return state.orders.find((order) => order.id === id);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

function openMailto(order) {
  const priced = order.pricing || TP.priceOrder(order, settings);
  const subject = encodeURIComponent(
    `[Transfer order] ${order.id}${order.partnerOrderId ? ` · ${order.partnerOrderId}` : ""}`
  );
  const lines = (order.lines || [])
    .map(
      (line) =>
        `- ${line.name || "Transfer"}: ${line.qty} @ ${line.widthIn}×${line.heightIn}" ${line.fileUrl || line.fileName || "(no file)"}`
    )
    .join("\n");
  const body = encodeURIComponent(
    [
      `${settings.shopName} transfer order ${order.id}`,
      order.partnerOrderId ? `Partner PO: ${order.partnerOrderId}` : "",
      `From: ${order.customer.name} <${order.customer.email}>`,
      order.customer.company ? `Company: ${order.customer.company}` : "",
      `White-label: ${order.fulfillment.whiteLabel ? "yes" : "no"}`,
      `Blind ship: ${order.fulfillment.blindShip ? "yes" : "no"}`,
      `Ship to: ${order.shipTo.name}, ${order.shipTo.address1}, ${order.shipTo.city}, ${order.shipTo.state} ${order.shipTo.postalCode}`,
      "",
      lines,
      "",
      `Area: ${priced.sqIn} sq in @ ${TP.money(priced.rate)}`,
      `Print: ${TP.money(priced.subtotal)}`,
      `Shipping: ${TP.money(priced.shipping)}`,
      `Total: ${TP.money(priced.total)}`,
      order.fulfillment.notes ? `\nNotes: ${order.fulfillment.notes}` : "",
      "",
      "Full JSON is saved in Transfer Orders → Inbox.",
    ]
      .filter((row) => row !== "")
      .join("\n")
  );
  const email = settings.notifyEmail || "";
  const href = email ? `mailto:${email}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function inchesFromPixels(px) {
  return TP.round2(px / (settings.dpi || 300));
}

function handleArtFile(line, file) {
  if (!file) return;
  line.fileName = file.name;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    line.widthIn = inchesFromPixels(img.naturalWidth);
    line.heightIn = inchesFromPixels(img.naturalHeight);
    URL.revokeObjectURL(url);
    saveDraft();
    render();
    toast(`Read ${file.name} at ${line.widthIn}×${line.heightIn}" (300 dpi)`);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    saveDraft();
    render();
    toast(`Attached ${file.name}. Enter size if this is not a PNG/JPG.`);
  };
  img.src = url;
}

function submitDraft() {
  const check = TP.validateOrder(draft, settings);
  if (!check.ok) {
    render();
    toast(check.errors[0]);
    return;
  }
  const priced = pricedDraft();
  const record = {
    id: uid("DTF"),
    createdAt: Date.now(),
    status: "new",
    ...structuredClone(draft),
    pricing: {
      sqIn: priced.sqIn,
      rate: priced.rate,
      tierLabel: priced.tierLabel,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
    },
  };
  state.orders.unshift(record);
  saveState();
  draft = withLineIds(TP.emptyOrder());
  saveDraft();
  openMailto(record);
  location.hash = `#/inbox/${record.id}`;
  toast(`Order ${record.id} saved to inbox`);
}

function importPayload(raw) {
  const parsed = withLineIds(TP.parsePartnerOrder(raw));
  parsed.source = parsed.source || "partner-json";
  const check = TP.validateOrder(parsed, settings);
  const priced = TP.priceOrder(parsed, settings);
  const record = {
    id: uid("DTF"),
    createdAt: Date.now(),
    status: "new",
    ...parsed,
    pricing: {
      sqIn: priced.sqIn,
      rate: priced.rate,
      tierLabel: priced.tierLabel,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
    },
    importWarnings: check.warnings,
    importErrors: check.errors,
  };
  state.orders.unshift(record);
  saveState();
  location.hash = `#/inbox/${record.id}`;
  toast(check.ok ? `Imported ${record.id}` : `Imported ${record.id} with missing fields`);
}

function render() {
  const route = getRoute();
  document.querySelectorAll(".main-nav a[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route.path);
  });
  if (route.path === "inbox" && route.param) renderDetail(route.param);
  else if (route.path === "inbox") renderInbox();
  else if (route.path === "partners") renderPartners();
  else if (route.path === "settings") renderSettings();
  else renderOrder();
}

function renderOrder() {
  const priced = pricedDraft();
  const check = TP.validateOrder(draft, settings);
  const payload = TP.orderPayload(draft, priced);
  main.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Order transfers</p>
        <h1>Build an order by size</h1>
        <p>Partners and customers pick each transfer’s size and quantity. We price live per square inch and auto-gang in production.</p>
      </div>
    </div>
    <div class="layout">
      <div class="stack">
        <section class="card">
          <h2>Who is ordering</h2>
          <div class="field-grid">
            <label>Name<input data-path="customer.name" value="${escapeHtml(draft.customer.name)}" required></label>
            <label>Company<input data-path="customer.company" value="${escapeHtml(draft.customer.company)}" placeholder="Print shop or brand"></label>
            <label>Email<input data-path="customer.email" type="email" value="${escapeHtml(draft.customer.email)}"></label>
            <label>Phone<input data-path="customer.phone" value="${escapeHtml(draft.customer.phone)}"></label>
            <label class="span-2">Partner / Shopify order #<input data-path="partnerOrderId" value="${escapeHtml(draft.partnerOrderId)}" placeholder="Optional, e.g. JOTO-1042"></label>
          </div>
        </section>

        <section class="card">
          <h2>Fulfillment</h2>
          <div class="checks">
            <label class="check"><input type="checkbox" data-path="fulfillment.whiteLabel" ${draft.fulfillment.whiteLabel ? "checked" : ""}> White-label packing slip</label>
            <label class="check"><input type="checkbox" data-path="fulfillment.blindShip" ${draft.fulfillment.blindShip ? "checked" : ""}> Blind ship (no DTFS marks)</label>
            <label class="check"><input type="checkbox" data-path="fulfillment.rush" ${draft.fulfillment.rush ? "checked" : ""}> Rush</label>
            <label class="check"><input type="checkbox" data-path="fulfillment.unionPrint" ${draft.fulfillment.unionPrint ? "checked" : ""}> Union print</label>
          </div>
          <div class="field-grid" style="margin-top:12px">
            <label class="span-2">Packing-slip brand name<input data-path="fulfillment.packingSlipName" value="${escapeHtml(draft.fulfillment.packingSlipName)}" placeholder="Shown instead of DTFS when white-label is on"></label>
            <label class="span-2">Production notes<textarea data-path="fulfillment.notes" rows="2">${escapeHtml(draft.fulfillment.notes)}</textarea></label>
          </div>
        </section>

        <section class="card">
          <div class="line-top">
            <h2 style="margin:0">Transfers</h2>
            <button type="button" class="button ghost compact" data-action="add-line">Add transfer</button>
          </div>
          <div class="stack" style="margin-top:14px">
            ${draft.lines.map((line, index) => renderLine(line, index, priced)).join("")}
          </div>
        </section>

        <section class="card">
          <h2>Ship to</h2>
          <div class="field-grid">
            <label>Name<input data-path="shipTo.name" value="${escapeHtml(draft.shipTo.name)}"></label>
            <label>Company<input data-path="shipTo.company" value="${escapeHtml(draft.shipTo.company)}"></label>
            <label class="span-2">Address<input data-path="shipTo.address1" value="${escapeHtml(draft.shipTo.address1)}"></label>
            <label class="span-2">Address 2<input data-path="shipTo.address2" value="${escapeHtml(draft.shipTo.address2)}"></label>
            <label>City<input data-path="shipTo.city" value="${escapeHtml(draft.shipTo.city)}"></label>
            <label>State<input data-path="shipTo.state" value="${escapeHtml(draft.shipTo.state)}"></label>
            <label>ZIP<input data-path="shipTo.postalCode" value="${escapeHtml(draft.shipTo.postalCode)}"></label>
            <label>Country<input data-path="shipTo.country" value="${escapeHtml(draft.shipTo.country)}"></label>
          </div>
        </section>
      </div>

      <aside class="card summary-card">
        <span class="rate-pill">${escapeHtml(priced.tierLabel)} · ${TP.money(priced.rate)} / sq in</span>
        <h2>Live price</h2>
        <p class="muted">Quoted wholesale band is $0.02–$0.03 per square inch. Film max width is ${settings.maxWidthIn}". Shipping is free at $${settings.shipFreeAt}+.</p>
        <div class="totals">
          <div><span>Print area</span><strong id="sumSqIn">${priced.sqIn} sq in</strong></div>
          <div><span>Print</span><strong id="sumPrint">${TP.money(priced.subtotal)}</strong></div>
          <div><span>Shipping</span><strong id="sumShip">${priced.shippingLabel}</strong></div>
          <div class="grand"><span>Total</span><span id="sumTotal">${TP.money(priced.total)}</span></div>
        </div>
        ${check.errors.length ? `<div class="notice error">${check.errors.map(escapeHtml).join("<br>")}</div>` : ""}
        ${check.warnings.length ? `<div class="notice">${check.warnings.map(escapeHtml).join("<br>")}</div>` : ""}
        <div class="actions" style="margin-top:14px">
          <button type="button" class="button primary" data-action="submit" ${check.ok ? "" : "disabled"}>Place order</button>
          <button type="button" class="button ghost" data-action="copy-json">Copy JSON</button>
        </div>
        <p class="muted" style="margin:14px 0 8px;font-size:0.8rem">Partner payload</p>
        <pre class="code" id="payloadPreview">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
      </aside>
    </div>
  `;

  bindForm(main);
  main.querySelector("[data-action='add-line']")?.addEventListener("click", () => {
    draft.lines.push({ ...TP.emptyLine(), id: uid("LN") });
    saveDraft();
    render();
  });
  main.querySelector("[data-action='submit']")?.addEventListener("click", submitDraft);
  main.querySelector("[data-action='copy-json']")?.addEventListener("click", () => {
    copyText(JSON.stringify(payload, null, 2)).then(() => toast("JSON copied"));
  });
}

function renderLine(line, index, priced) {
  const pricedLine = (priced.lines || [])[index] || {};
  const preset = TP.SIZE_PRESETS.find(
    (item) => item.widthIn === Number(line.widthIn) && item.heightIn === Number(line.heightIn)
  );
  const presetValue = preset ? preset.id : "custom";
  return `
    <article class="line" data-line="${escapeHtml(line.id)}">
      <div class="line-top">
        <strong>Transfer ${index + 1}</strong>
        <span class="line-meta">${pricedLine.sqIn || 0} sq in · ${TP.money(pricedLine.lineTotal || 0)}</span>
      </div>
      <div class="field-grid three">
        <label class="span-3">Design name<input data-line-field="name" value="${escapeHtml(line.name)}" placeholder="Front logo"></label>
        <label>Size preset
          <select data-line-field="preset">
            ${TP.SIZE_PRESETS.map((item) => `<option value="${item.id}" ${item.id === presetValue ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
          </select>
        </label>
        <label>Width (in)<input data-line-field="widthIn" type="number" min="0.25" max="${settings.maxWidthIn}" step="0.25" value="${escapeHtml(line.widthIn)}"></label>
        <label>Height (in)<input data-line-field="heightIn" type="number" min="0.25" step="0.25" value="${escapeHtml(line.heightIn)}"></label>
        <label>Qty<input data-line-field="qty" type="number" min="1" step="1" value="${escapeHtml(line.qty)}"></label>
        <label class="span-2">Artwork URL<input data-line-field="fileUrl" value="${escapeHtml(line.fileUrl)}" placeholder="Shopify CDN, Dropbox, Drive…"></label>
      </div>
      <label class="drop">
        <input type="file" data-line-field="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.pdf,.ai,.psd">
        ${line.fileName ? `<span class="file-ok">${escapeHtml(line.fileName)}</span>` : "Drop PNG/JPG to auto-size at 300 dpi, or paste a file URL above."}
      </label>
      ${draft.lines.length > 1 ? `<button type="button" class="button danger compact" data-action="remove-line">Remove</button>` : ""}
    </article>
  `;
}

function bindForm(root) {
  root.querySelectorAll("[data-path]").forEach((field) => {
    const eventName = field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, () => {
      const value = field.type === "checkbox" ? field.checked : field.value;
      setPath(draft, field.dataset.path, value);
      if (field.dataset.path === "fulfillment.whiteLabel" && value) {
        draft.fulfillment.blindShip = true;
      }
      saveDraft();
      if (field.dataset.path.startsWith("fulfillment") || field.type === "checkbox") render();
      else refreshSummary();
    });
  });

  root.querySelectorAll("[data-line]").forEach((card) => {
    const line = findLine(card.dataset.line);
    if (!line) return;
    card.querySelectorAll("[data-line-field]").forEach((field) => {
      const key = field.dataset.lineField;
      if (key === "file") {
        field.addEventListener("change", () => handleArtFile(line, field.files[0]));
        return;
      }
      field.addEventListener("input", () => {
        if (key === "preset") {
          const preset = TP.SIZE_PRESETS.find((item) => item.id === field.value);
          if (preset && preset.id !== "custom") {
            line.widthIn = preset.widthIn;
            line.heightIn = preset.heightIn;
            const widthField = card.querySelector('[data-line-field="widthIn"]');
            const heightField = card.querySelector('[data-line-field="heightIn"]');
            if (widthField) widthField.value = preset.widthIn;
            if (heightField) heightField.value = preset.heightIn;
          }
        } else if (key === "qty" || key === "widthIn" || key === "heightIn") {
          line[key] = field.value === "" ? "" : TP.num(field.value);
          if (key !== "qty") {
            const select = card.querySelector('[data-line-field="preset"]');
            const match = TP.SIZE_PRESETS.find(
              (item) => item.widthIn === Number(line.widthIn) && item.heightIn === Number(line.heightIn)
            );
            if (select) select.value = match ? match.id : "custom";
          }
        } else {
          line[key] = field.value;
        }
        saveDraft();
        refreshLineCard(card, line);
        refreshSummary();
      });
    });
    card.querySelector("[data-action='remove-line']")?.addEventListener("click", () => {
      draft.lines = draft.lines.filter((item) => item.id !== line.id);
      saveDraft();
      render();
    });
    const drop = card.querySelector(".drop");
    drop?.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("hot");
    });
    drop?.addEventListener("dragleave", () => drop.classList.remove("hot"));
    drop?.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("hot");
      handleArtFile(line, event.dataTransfer.files[0]);
    });
  });
}

function refreshLineCard(card, line) {
  const priced = pricedDraft();
  const index = draft.lines.findIndex((item) => item.id === line.id);
  const pricedLine = (priced.lines || [])[index] || {};
  const meta = card.querySelector(".line-meta");
  if (meta) meta.textContent = `${pricedLine.sqIn || 0} sq in · ${TP.money(pricedLine.lineTotal || 0)}`;
}

function refreshSummary() {
  const priced = pricedDraft();
  const check = TP.validateOrder(draft, settings);
  const payload = TP.orderPayload(draft, priced);
  const aside = main.querySelector(".summary-card");
  if (!aside) return;
  const pill = aside.querySelector(".rate-pill");
  if (pill) pill.textContent = `${priced.tierLabel} · ${TP.money(priced.rate)} / sq in`;
  const sqIn = aside.querySelector("#sumSqIn");
  const print = aside.querySelector("#sumPrint");
  const ship = aside.querySelector("#sumShip");
  const total = aside.querySelector("#sumTotal");
  if (sqIn) sqIn.textContent = `${priced.sqIn} sq in`;
  if (print) print.textContent = TP.money(priced.subtotal);
  if (ship) ship.textContent = priced.shippingLabel;
  if (total) total.textContent = TP.money(priced.total);
  const submit = aside.querySelector("[data-action='submit']");
  if (submit) submit.disabled = !check.ok;
  const preview = aside.querySelector("#payloadPreview");
  if (preview) preview.textContent = JSON.stringify(payload, null, 2);
  aside.querySelectorAll(".notice").forEach((el) => el.remove());
  const actions = aside.querySelector(".actions");
  if (check.errors.length) {
    actions.insertAdjacentHTML("beforebegin", `<div class="notice error">${check.errors.map(escapeHtml).join("<br>")}</div>`);
  }
  if (check.warnings.length) {
    actions.insertAdjacentHTML("beforebegin", `<div class="notice">${check.warnings.map(escapeHtml).join("<br>")}</div>`);
  }
}

function filteredOrders() {
  if (inboxFilter === "all") return state.orders;
  return state.orders.filter((order) => order.status === inboxFilter);
}

function renderInbox() {
  const orders = filteredOrders();
  const counts = {
    all: state.orders.length,
    new: state.orders.filter((order) => order.status === "new").length,
    print: state.orders.filter((order) => order.status === "print").length,
    shipped: state.orders.filter((order) => order.status === "shipped").length,
  };
  main.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Shop inbox</p>
        <h1>Incoming transfer orders</h1>
        <p>Portal submissions and partner JSON land here. Move a job from new to print to shipped.</p>
      </div>
    </div>
    <div class="inbox-toolbar">
      <div class="filters">
        ${["all", "new", "print", "shipped"].map((key) => `
          <button type="button" class="chip ${inboxFilter === key ? "active" : ""}" data-filter="${key}">
            ${key === "all" ? "All" : STATUSES[key].label} (${counts[key]})
          </button>
        `).join("")}
      </div>
      <button type="button" class="button ghost compact" data-action="load-sample">Load sample Joto order</button>
    </div>
    ${
      orders.length
        ? `<div class="order-list">${orders.map(renderOrderRow).join("")}</div>`
        : `<div class="card empty">No orders in this view yet. Place one from New order, or import partner JSON.</div>`
    }
  `;
  main.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      inboxFilter = btn.dataset.filter;
      render();
    });
  });
  main.querySelectorAll(".order-row").forEach((row) => {
    row.addEventListener("click", () => {
      location.hash = `#/inbox/${row.dataset.id}`;
    });
  });
  main.querySelector("[data-action='load-sample']")?.addEventListener("click", loadSample);
}

function renderOrderRow(order) {
  const when = new Date(order.createdAt).toLocaleString();
  return `
    <article class="order-row" data-id="${escapeHtml(order.id)}">
      <div>
        <h3>${escapeHtml(order.customer.company || order.customer.name || "Untitled")}</h3>
        <p>${escapeHtml(order.id)}${order.partnerOrderId ? ` · ${escapeHtml(order.partnerOrderId)}` : ""} · ${escapeHtml(when)}</p>
      </div>
      <p>${order.lines.length} transfer${order.lines.length === 1 ? "" : "s"} · ${order.pricing?.sqIn ?? 0} sq in${order.fulfillment.whiteLabel ? " · white-label" : ""}</p>
      <span class="status ${escapeHtml(order.status)}">${escapeHtml(STATUSES[order.status]?.label || order.status)}</span>
      <div class="amount">${TP.money(order.pricing?.total || 0)}</div>
    </article>
  `;
}

function renderDetail(id) {
  const order = findOrder(id);
  if (!order) {
    main.innerHTML = `<div class="card empty">That order is not in this browser’s inbox.</div>`;
    return;
  }
  const next = STATUSES[order.status];
  const payload = TP.orderPayload(order, TP.priceOrder(order, settings));
  main.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow"><a href="#/inbox">Inbox</a> · ${escapeHtml(order.id)}</p>
        <h1>${escapeHtml(order.customer.company || order.customer.name)}</h1>
        <p>${escapeHtml(order.customer.email)} · ${escapeHtml(order.source || "portal")}${order.partnerOrderId ? ` · ${escapeHtml(order.partnerOrderId)}` : ""}</p>
      </div>
      <span class="status ${escapeHtml(order.status)}">${escapeHtml(next.label)}</span>
    </div>
    <div class="detail-grid">
      <div class="stack">
        <section class="card">
          <h2>Transfers</h2>
          ${(order.lines || []).map((line) => `
            <div class="kv" style="margin-bottom:12px">
              <div><span>${escapeHtml(line.name || "Transfer")}</span><strong>${escapeHtml(line.qty)} × ${escapeHtml(line.widthIn)}×${escapeHtml(line.heightIn)}"</strong></div>
              <div><span>Artwork</span><span>${line.fileUrl ? `<a href="${escapeHtml(line.fileUrl)}" target="_blank" rel="noopener">${escapeHtml(line.fileName || line.fileUrl)}</a>` : escapeHtml(line.fileName || "None")}</span></div>
            </div>
          `).join("")}
        </section>
        <section class="card">
          <h2>Ship to ${order.fulfillment.blindShip ? "· blind" : ""}</h2>
          <p>${escapeHtml(order.shipTo.name)}<br>
          ${order.shipTo.company ? `${escapeHtml(order.shipTo.company)}<br>` : ""}
          ${escapeHtml(order.shipTo.address1)} ${escapeHtml(order.shipTo.address2)}<br>
          ${escapeHtml(order.shipTo.city)}, ${escapeHtml(order.shipTo.state)} ${escapeHtml(order.shipTo.postalCode)}<br>
          ${escapeHtml(order.shipTo.country)}</p>
          <p>${order.fulfillment.whiteLabel ? `Packing slip: <strong>${escapeHtml(order.fulfillment.packingSlipName || order.customer.company || "Partner brand")}</strong>` : "Packing slip: DTFS"}</p>
          ${order.fulfillment.notes ? `<p>${escapeHtml(order.fulfillment.notes)}</p>` : ""}
        </section>
      </div>
      <div class="stack">
        <section class="card">
          <h2>Ticket</h2>
          <div class="kv">
            <div><span>Area</span><strong>${order.pricing?.sqIn || 0} sq in</strong></div>
            <div><span>Rate</span><strong>${TP.money(order.pricing?.rate || 0)}</strong></div>
            <div><span>Print</span><strong>${TP.money(order.pricing?.subtotal || 0)}</strong></div>
            <div><span>Ship</span><strong>${TP.money(order.pricing?.shipping || 0)}</strong></div>
            <div><span>Total</span><strong>${TP.money(order.pricing?.total || 0)}</strong></div>
          </div>
          <div class="actions" style="margin-top:16px">
            ${next.next ? `<button type="button" class="button primary" data-action="advance">${escapeHtml(next.nextLabel)}</button>` : ""}
            <button type="button" class="button ghost" data-action="email">Email shop</button>
            <button type="button" class="button ghost" data-action="print">Print ticket</button>
            <button type="button" class="button ghost" data-action="copy">Copy JSON</button>
          </div>
        </section>
        <section class="card">
          <h2>Payload</h2>
          <pre class="code">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
        </section>
      </div>
    </div>
  `;
  main.querySelector("[data-action='advance']")?.addEventListener("click", () => {
    order.status = next.next;
    saveState();
    render();
    toast(`Moved to ${STATUSES[order.status].label}`);
  });
  main.querySelector("[data-action='email']")?.addEventListener("click", () => openMailto(order));
  main.querySelector("[data-action='print']")?.addEventListener("click", () => window.print());
  main.querySelector("[data-action='copy']")?.addEventListener("click", () => {
    copyText(JSON.stringify(payload, null, 2)).then(() => toast("JSON copied"));
  });
}

function renderPartners() {
  const sample = `{
  "schema": "dtfs.order.v1",
  "partnerOrderId": "SHOPIFY-1042",
  "source": "shopify",
  "customer": { "name": "Phil DeSerres", "company": "Joto Imaging Supplies", "email": "orders@partner.com" },
  "fulfillment": { "whiteLabel": true, "blindShip": true, "packingSlipName": "Partner Brand" },
  "shipTo": { "name": "Jane Customer", "address1": "123 Main St", "city": "St. Charles", "state": "MO", "postalCode": "63304", "country": "US" },
  "lines": [{ "name": "Front logo", "widthIn": 10, "heightIn": 10, "qty": 24, "fileUrl": "https://cdn.shopify.com/logo.png" }]
}`;
  main.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Partner connection</p>
        <h1>Send orders as JSON, not email threads</h1>
        <p>Print shops with Shopify (or any storefront) can push US transfer jobs here with artwork URLs. We price per square inch on our side and ship blind under their brand.</p>
      </div>
    </div>
    <div class="partner-grid">
      <section class="card">
        <h2>What to send</h2>
        <p style="color:var(--ink-soft);line-height:1.5">No live webhook host is attached to this static workspace yet. Partners can POST this payload to a Zapier/Make/Apps Script catcher, or paste it below. Files should be public URLs (Shopify CDN, Dropbox, Drive) so production can pull them without another inbox.</p>
        <table class="map-table">
          <thead><tr><th>Shopify / partner</th><th>DTFS field</th></tr></thead>
          <tbody>
            <tr><td>order.name</td><td>partnerOrderId</td></tr>
            <tr><td>customer</td><td>customer</td></tr>
            <tr><td>shipping_address</td><td>shipTo</td></tr>
            <tr><td>line item title + qty</td><td>lines[].name / qty</td></tr>
            <tr><td>line properties width / height</td><td>lines[].widthIn / heightIn</td></tr>
            <tr><td>line properties artwork_url</td><td>lines[].fileUrl</td></tr>
            <tr><td>US destination + white-label tag</td><td>fulfillment.whiteLabel + blindShip</td></tr>
          </tbody>
        </table>
      </section>
      <section class="card">
        <h2>Receive a payload</h2>
        <label>Paste JSON<textarea id="payloadIn" rows="12" placeholder='{"schema":"dtfs.order.v1", ...}'></textarea></label>
        <div class="actions" style="margin-top:12px">
          <button type="button" class="button primary" data-action="import">Import into inbox</button>
          <button type="button" class="button ghost" data-action="fill-sample">Insert sample</button>
        </div>
        <p id="parseStatus" class="muted" style="margin:12px 0 0;color:var(--muted)"></p>
      </section>
    </div>
    <section class="card" style="margin-top:16px">
      <h2>Example payload</h2>
      <pre class="code">${escapeHtml(sample)}</pre>
    </section>
  `;
  const area = main.querySelector("#payloadIn");
  const status = main.querySelector("#parseStatus");
  main.querySelector("[data-action='fill-sample']")?.addEventListener("click", () => {
    area.value = sample;
    status.textContent = "Sample loaded. Import to price it and open a ticket.";
  });
  main.querySelector("[data-action='import']")?.addEventListener("click", () => {
    try {
      importPayload(area.value);
    } catch (error) {
      status.textContent = error.message;
      toast(error.message);
    }
  });
}

function renderSettings() {
  main.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Rates & routing</p>
        <h1>Pricing the shop actually quoted</h1>
        <p>Default wholesale is $0.03 / $0.025 / $0.02 per square inch by total area. Free shipping at $75 matches the DTFS site.</p>
      </div>
    </div>
    <section class="card stack">
      <div class="field-grid">
        <label>Shop notify email<input id="notifyEmail" type="email" value="${escapeHtml(settings.notifyEmail)}"></label>
        <label>Shop name on tickets<input id="shopName" value="${escapeHtml(settings.shopName)}"></label>
        <label>Flat shipping ($)<input id="shipFlat" type="number" min="0" step="0.01" value="${escapeHtml(settings.shipFlat)}"></label>
        <label>Free shipping at ($)<input id="shipFreeAt" type="number" min="0" step="1" value="${escapeHtml(settings.shipFreeAt)}"></label>
        <label>Minimum order ($)<input id="minOrder" type="number" min="0" step="0.01" value="${escapeHtml(settings.minOrder)}"></label>
        <label>Max film width (in)<input id="maxWidthIn" type="number" min="1" step="1" value="${escapeHtml(settings.maxWidthIn)}"></label>
      </div>
      <h2>Rate tiers</h2>
      <div class="stack" id="tierList">
        ${settings.rateTiers.map((tier, index) => `
          <div class="field-grid three" data-tier="${index}">
            <label>From sq in<input data-tier-field="minSqIn" type="number" min="0" value="${escapeHtml(tier.minSqIn)}"></label>
            <label>Rate / sq in<input data-tier-field="rate" type="number" min="0" step="0.001" value="${escapeHtml(tier.rate)}"></label>
            <label>Label<input data-tier-field="label" value="${escapeHtml(tier.label)}"></label>
          </div>
        `).join("")}
      </div>
      <div class="actions">
        <button type="button" class="button primary" data-action="save-settings">Save settings</button>
        <button type="button" class="button ghost" data-action="reset-settings">Reset to quoted rates</button>
      </div>
    </section>
  `;
  main.querySelector("[data-action='save-settings']")?.addEventListener("click", saveSettingsForm);
  main.querySelector("[data-action='reset-settings']")?.addEventListener("click", () => {
    settings = structuredClone(TP.DEFAULT_SETTINGS);
    saveSettings();
    render();
    toast("Restored $0.02–$0.03 rates");
  });
}

function saveSettingsForm() {
  settings.notifyEmail = document.querySelector("#notifyEmail").value.trim();
  settings.shopName = document.querySelector("#shopName").value.trim() || "DTFS";
  settings.shipFlat = TP.num(document.querySelector("#shipFlat").value, 8.5);
  settings.shipFreeAt = TP.num(document.querySelector("#shipFreeAt").value, 75);
  settings.minOrder = TP.num(document.querySelector("#minOrder").value, 0);
  settings.maxWidthIn = TP.num(document.querySelector("#maxWidthIn").value, 30);
  settings.rateTiers = [...document.querySelectorAll("[data-tier]")].map((row) => ({
    minSqIn: TP.num(row.querySelector('[data-tier-field="minSqIn"]').value),
    rate: TP.num(row.querySelector('[data-tier-field="rate"]').value),
    label: row.querySelector('[data-tier-field="label"]').value.trim() || "Rate",
  }));
  saveSettings();
  toast("Settings saved");
}

async function loadSample() {
  try {
    const response = await fetch("examples/joto-order.json");
    if (!response.ok) throw new Error("Could not load sample");
    importPayload(await response.text());
  } catch (error) {
    toast(error.message);
  }
}

window.addEventListener("hashchange", render);
render();
