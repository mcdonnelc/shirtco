const STORAGE_KEY = "supply-kanban-v1";
const SETTINGS_KEY = "supply-kanban-settings-v1";

const STATUSES = {
  shelf: { label: "On shelf", action: null },
  reorder: { label: "Needs reorder", action: "Request reorder" },
  ordered: { label: "On order", action: "Mark received" },
};

const SEED = [
  {
    id: "sup_gloves",
    name: "Nitrile gloves (M)",
    sku: "GLV-M-100",
    location: "Shelf A1",
    reorderQty: 4,
    unit: "boxes",
    vendor: "Amazon Business",
    notes: "Powder-free, 100/box",
    status: "shelf",
    updatedAt: Date.now(),
  },
  {
    id: "sup_tape",
    name: "Packing tape 2\"",
    sku: "TAP-2-CLR",
    location: "Bay 2 / Bin 4",
    reorderQty: 12,
    unit: "rolls",
    vendor: "Uline",
    notes: "Clear acrylic",
    status: "reorder",
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "sup_paper",
    name: "Copy paper letter",
    sku: "PAP-LTR-5R",
    location: "Cabinet C",
    reorderQty: 5,
    unit: "reams",
    vendor: "Office Depot",
    notes: "20 lb white",
    status: "ordered",
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "sup_cleaner",
    name: "Surface disinfectant",
    sku: "CLN-SURF-1G",
    location: "Janitor closet",
    reorderQty: 2,
    unit: "gallons",
    vendor: "Grainger",
    notes: "",
    status: "shelf",
    updatedAt: Date.now(),
  },
  {
    id: "sup_labels",
    name: "Shipping labels 4×6",
    sku: "LBL-46-250",
    location: "Pack station",
    reorderQty: 2,
    unit: "rolls",
    vendor: "Amazon Business",
    notes: "Thermal, 250/roll",
    status: "shelf",
    updatedAt: Date.now(),
  },
];

const main = document.querySelector("#main");
const appShell = document.querySelector("#app");
const supplyModal = document.querySelector("#supplyModal");
const supplyForm = document.querySelector("#supplyForm");
const toastEl = document.querySelector("#toast");
const addSupplyBtn = document.querySelector("#addSupplyBtn");

let state = loadState();
let settings = loadSettings();
let toastTimer = null;
let editingId = null;

function uid(prefix = "sup") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = { supplies: structuredClone(SEED) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.supplies || !Array.isArray(parsed.supplies)) {
      return { supplies: structuredClone(SEED) };
    }
    return parsed;
  } catch {
    return { supplies: structuredClone(SEED) };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { notifyEmail: "", teamName: "Ops" };
    return { notifyEmail: "", teamName: "Ops", ...JSON.parse(raw) };
  } catch {
    return { notifyEmail: "", teamName: "Ops" };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function toast(message) {
  toastEl.hidden = false;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
}

function getRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "board";
  const [pathPart, query = ""] = hash.split("?");
  const [path, ...rest] = pathPart.split("/");
  const params = Object.fromEntries(new URLSearchParams(query));
  return { path, param: rest.join("/"), params };
}

function encodePayload(item) {
  const payload = {
    id: item.id,
    name: item.name,
    sku: item.sku,
    location: item.location || "",
    reorderQty: item.reorderQty,
    unit: item.unit,
    vendor: item.vendor || "",
    notes: item.notes || "",
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodePayload(encoded) {
  if (!encoded) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return null;
    }
  }
}

function reorderUrl(id) {
  const item = findSupply(id);
  const base = `${location.origin}${location.pathname}`.replace(/index\.html$/, "");
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!item) return `${cleanBase}/#/reorder/${id}`;
  return `${cleanBase}/#/reorder/${id}?p=${encodePayload(item)}`;
}

function resolveReorderItem(id, params) {
  const local = findSupply(id);
  const fromQr = decodePayload(params.p);
  if (local) return { item: local, source: "local" };
  if (fromQr) {
    return {
      item: {
        ...fromQr,
        id: fromQr.id || id,
        status: "reorder",
        updatedAt: Date.now(),
      },
      source: "qr",
    };
  }
  return { item: null, source: "missing" };
}

function findSupply(id) {
  return state.supplies.find((s) => s.id === id);
}

function setStatus(id, status) {
  const item = findSupply(id);
  if (!item) return;
  item.status = status;
  item.updatedAt = Date.now();
  saveState();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderQr(host, text, size) {
  if (!host || typeof QRCode === "undefined") return;
  host.innerHTML = "";
  // qrcodejs draws into the host element
  // eslint-disable-next-line no-new
  new QRCode(host, {
    text,
    width: size,
    height: size,
    colorDark: "#13202c",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function updateNav(active) {
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === active);
  });
}

function render() {
  const { path, param, params } = getRoute();
  const isScan = path === "reorder";
  appShell.classList.toggle("scan-only", isScan);
  addSupplyBtn.hidden = isScan || path === "labels";

  if (path === "reorder") {
    updateNav("");
    renderReorder(param, params);
    return;
  }

  updateNav(["board", "catalog", "labels", "settings"].includes(path) ? path : "board");

  if (path === "catalog") renderCatalog();
  else if (path === "labels") renderLabels();
  else if (path === "settings") renderSettings();
  else renderBoard();
}

function counts() {
  return {
    shelf: state.supplies.filter((s) => s.status === "shelf").length,
    reorder: state.supplies.filter((s) => s.status === "reorder").length,
    ordered: state.supplies.filter((s) => s.status === "ordered").length,
  };
}

function renderBoard() {
  const c = counts();
  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Kanban board</h1>
        <p>Pull a QR-tagged bin to empty, scan the label, and the item lands here for purchasing.</p>
      </div>
      <div class="stats" aria-label="Status counts">
        <div class="stat"><strong>${c.shelf}</strong><span>On shelf</span></div>
        <div class="stat"><strong>${c.reorder}</strong><span>Needs reorder</span></div>
        <div class="stat"><strong>${c.ordered}</strong><span>On order</span></div>
      </div>
    </div>
    <div class="board" id="board">
      ${["shelf", "reorder", "ordered"].map(columnMarkup).join("")}
    </div>
  `;
  wireBoardDnD();
  wireCardActions();
}

function columnMarkup(status) {
  const items = state.supplies
    .filter((s) => s.status === status)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return `
    <section class="column" data-status="${status}" aria-label="${STATUSES[status].label}">
      <div class="column-head">
        <h2><span class="dot" aria-hidden="true"></span>${STATUSES[status].label}</h2>
        <span class="count-pill">${items.length}</span>
      </div>
      <div class="column-body" data-drop="${status}">
        ${items.length ? items.map(cardMarkup).join("") : `<div class="empty-col">Drop supplies here</div>`}
      </div>
    </section>
  `;
}

function cardMarkup(item) {
  const next =
    item.status === "shelf"
      ? { status: "reorder", label: "Flag for reorder" }
      : item.status === "reorder"
        ? { status: "ordered", label: "Mark ordered" }
        : { status: "shelf", label: "Mark received" };

  return `
    <article class="card" draggable="true" data-id="${escapeHtml(item.id)}">
      <div class="card-top">
        <h3>${escapeHtml(item.name)}</h3>
        <span class="sku">${escapeHtml(item.sku)}</span>
      </div>
      <div class="meta">
        <span>${escapeHtml(item.reorderQty)} ${escapeHtml(item.unit)}</span>
        ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ""}
        <span>${formatRelative(item.updatedAt)}</span>
      </div>
      <div class="card-actions">
        <button type="button" class="button ghost" data-action="advance" data-next="${next.status}">${next.label}</button>
        <button type="button" class="button ghost" data-action="qr">QR</button>
        <button type="button" class="button ghost" data-action="edit">Edit</button>
      </div>
    </article>
  `;
}

function wireBoardDnD() {
  const cards = [...main.querySelectorAll(".card")];
  const columns = [...main.querySelectorAll(".column")];

  cards.forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", card.dataset.id);
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });

  columns.forEach((col) => {
    const body = col.querySelector("[data-drop]");
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      const status = body.dataset.drop;
      if (id && status) {
        setStatus(id, status);
        toast(`Moved to ${STATUSES[status].label}`);
        render();
      }
    });
  });
}

function wireCardActions() {
  main.querySelectorAll(".card").forEach((card) => {
    card.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = card.dataset.id;
        const action = btn.dataset.action;
        if (action === "advance") {
          setStatus(id, btn.dataset.next);
          toast("Status updated");
          render();
        } else if (action === "edit") {
          openSupplyModal(id);
        } else if (action === "qr") {
          location.hash = `#/labels`;
          setTimeout(() => {
            const el = document.querySelector(`[data-label-id="${id}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 50);
        }
      });
    });
  });
}

function renderCatalog(filter = "") {
  const q = filter.trim().toLowerCase();
  const items = state.supplies
    .filter((s) => {
      if (!q) return true;
      return [s.name, s.sku, s.location, s.vendor].join(" ").toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Supply catalog</h1>
        <p>Each item gets a unique QR that opens a one-tap reorder page on any phone.</p>
      </div>
      <button type="button" class="button primary" id="catalogAdd">Add supply</button>
    </div>
    <div class="toolbar">
      <div class="search">
        <input type="search" id="catalogSearch" placeholder="Search name, SKU, location…" value="${escapeHtml(filter)}" aria-label="Search supplies">
      </div>
    </div>
    <div class="catalog-grid" id="catalogGrid">
      ${items.length ? items.map(catalogCardMarkup).join("") : `<p class="empty-col">No supplies match.</p>`}
    </div>
  `;

  document.querySelector("#catalogAdd")?.addEventListener("click", () => openSupplyModal());
  const search = document.querySelector("#catalogSearch");
  search?.addEventListener("input", () => renderCatalog(search.value));

  items.forEach((item) => {
    renderQr(document.querySelector(`[data-qr-for="${item.id}"]`), reorderUrl(item.id), 80);
  });

  main.querySelectorAll("[data-cat-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest("[data-id]").dataset.id;
      const action = btn.dataset.catAction;
      if (action === "edit") openSupplyModal(id);
      else if (action === "reorder") {
        setStatus(id, "reorder");
        toast("Flagged for reorder");
        render();
      } else if (action === "copy") {
        navigator.clipboard?.writeText(reorderUrl(id)).then(() => toast("Reorder link copied"));
      } else if (action === "delete") {
        if (confirm("Delete this supply?")) {
          state.supplies = state.supplies.filter((s) => s.id !== id);
          saveState();
          toast("Supply deleted");
          render();
        }
      }
    });
  });
}

function catalogCardMarkup(item) {
  return `
    <article class="catalog-card" data-id="${escapeHtml(item.id)}">
      <div class="qr-thumb" data-qr-for="${escapeHtml(item.id)}" aria-hidden="true"></div>
      <div class="catalog-body">
        <span class="status-chip ${escapeHtml(item.status)}">${STATUSES[item.status].label}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <span class="sku">${escapeHtml(item.sku)}</span>
        <div class="meta">
          <span>${escapeHtml(item.reorderQty)} ${escapeHtml(item.unit)}</span>
          ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ""}
          ${item.vendor ? `<span>${escapeHtml(item.vendor)}</span>` : ""}
        </div>
        <div class="card-actions">
          <button type="button" class="button ghost" data-cat-action="reorder">Flag reorder</button>
          <button type="button" class="button ghost" data-cat-action="copy">Copy link</button>
          <button type="button" class="button ghost" data-cat-action="edit">Edit</button>
          <button type="button" class="danger-link" data-cat-action="delete">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function renderLabels() {
  const items = [...state.supplies].sort((a, b) => a.name.localeCompare(b.name));
  main.innerHTML = `
    <div class="page-header no-print">
      <div>
        <h1>QR labels</h1>
        <p>Print these, laminate if you like, and stick one on each kanban bin or shelf face.</p>
      </div>
      <button type="button" class="button primary" id="printLabels">Print labels</button>
    </div>
    <div class="labels-grid" id="labelsGrid">
      ${items.map((item) => `
        <article class="label-card" data-label-id="${escapeHtml(item.id)}">
          <div class="qr-box" data-label-qr="${escapeHtml(item.id)}"></div>
          <h3>${escapeHtml(item.name)}</h3>
          <span class="sku">${escapeHtml(item.sku)}</span>
          <div class="loc">${item.location ? escapeHtml(item.location) : "—"} · Reorder ${escapeHtml(item.reorderQty)} ${escapeHtml(item.unit)}</div>
        </article>
      `).join("")}
    </div>
  `;

  document.querySelector("#printLabels")?.addEventListener("click", () => window.print());

  items.forEach((item) => {
    renderQr(document.querySelector(`[data-label-qr="${item.id}"]`), reorderUrl(item.id), 140);
  });
}

function renderSettings() {
  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Settings</h1>
        <p>Local demo storage — data stays in this browser until you clear it.</p>
      </div>
    </div>
    <div class="settings-panel">
      <h2>Notifications</h2>
      <p>When someone scans and requests a reorder, optionally open a mailto draft to purchasing.</p>
      <label>
        Purchasing email
        <input type="email" id="notifyEmail" value="${escapeHtml(settings.notifyEmail)}" placeholder="purchasing@company.com">
      </label>
      <label>
        Team / site name
        <input type="text" id="teamName" value="${escapeHtml(settings.teamName)}" placeholder="Ops">
      </label>
      <button type="button" class="button primary" id="saveSettings">Save settings</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:24px 0">
      <h2>Data</h2>
      <p>Export JSON for backup, or reset to sample warehouse supplies.</p>
      <div class="card-actions" style="margin-top:12px">
        <button type="button" class="button ghost" id="exportData">Export JSON</button>
        <button type="button" class="button ghost" id="importData">Import JSON</button>
        <button type="button" class="button ghost" id="resetData">Reset sample data</button>
        <input type="file" id="importFile" accept="application/json" hidden>
      </div>
    </div>
    <div class="howto" style="margin-top:18px">
      <h2>How the kanban loop works</h2>
      <ol>
        <li>Add each supply in Catalog and print its QR from Labels.</li>
        <li>Stick the QR on the bin (or on a card in a classic 2-bin kanban).</li>
        <li>When stock hits reorder point, anyone scans with their phone camera.</li>
        <li>They tap <strong>Request reorder</strong> — an email draft opens for purchasing; this browser’s board moves the item to On order.</li>
        <li>When the shipment arrives, mark Received on the board to put it back On shelf.</li>
        <li>QR codes embed item details, so any phone can scan without sharing browser storage. Re-print labels after you edit a supply.</li>
      </ol>
    </div>
  `;

  document.querySelector("#saveSettings")?.addEventListener("click", () => {
    settings.notifyEmail = document.querySelector("#notifyEmail").value.trim();
    settings.teamName = document.querySelector("#teamName").value.trim() || "Ops";
    saveSettings();
    toast("Settings saved");
  });

  document.querySelector("#exportData")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ supplies: state.supplies, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `supply-kanban-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.querySelector("#importData")?.addEventListener("click", () => {
    document.querySelector("#importFile").click();
  });

  document.querySelector("#importFile")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.supplies)) throw new Error("Invalid file");
      state.supplies = data.supplies;
      if (data.settings) {
        settings = { ...settings, ...data.settings };
        saveSettings();
      }
      saveState();
      toast("Import complete");
      render();
    } catch {
      toast("Could not import that file");
    }
  });

  document.querySelector("#resetData")?.addEventListener("click", () => {
    if (!confirm("Replace all supplies with the sample set?")) return;
    state = { supplies: structuredClone(SEED) };
    saveState();
    toast("Sample data restored");
    render();
  });
}

function renderReorder(id, params = {}) {
  const { item, source } = resolveReorderItem(id, params);
  if (!item) {
    main.innerHTML = `
      <div class="reorder-view">
        <div class="reorder-card success-state">
          <h1>Supply not found</h1>
          <p>This QR has no catalog payload. Re-print the label from the Labels page after adding the supply.</p>
          <a class="button secondary" href="#/board">Open board</a>
        </div>
      </div>
    `;
    return;
  }

  if (source === "local" && item.status === "ordered") {
    main.innerHTML = `
      <div class="reorder-view">
        <div class="reorder-card">
          <div class="reorder-banner" style="background:linear-gradient(135deg,#1d5f8a,#154a6b)">
            <p class="eyebrow">${escapeHtml(settings.teamName)} · Already ordered</p>
            <h1>${escapeHtml(item.name)}</h1>
          </div>
          <div class="reorder-body">
            <p style="color:var(--ink-soft);margin:0 0 16px">This item is already on order. When it arrives, mark it received on the board.</p>
            <ul class="detail-list">
              <li><span>SKU</span><span>${escapeHtml(item.sku)}</span></li>
              <li><span>Qty on order</span><span>${escapeHtml(item.reorderQty)} ${escapeHtml(item.unit)}</span></li>
              <li><span>Vendor</span><span>${escapeHtml(item.vendor || "—")}</span></li>
            </ul>
            <div class="reorder-actions">
              <button type="button" class="button ok" id="markReceived">Mark received</button>
              <a class="button ghost" href="#/board">View board</a>
            </div>
          </div>
        </div>
      </div>
    `;
    document.querySelector("#markReceived")?.addEventListener("click", () => {
      setStatus(item.id, "shelf");
      toast("Back on shelf");
      location.hash = "#/board";
    });
    return;
  }

  main.innerHTML = `
    <div class="reorder-view">
      <div class="reorder-card" id="reorderCard">
        <div class="reorder-banner">
          <p class="eyebrow">${escapeHtml(settings.teamName)} · Scan to reorder</p>
          <h1>${escapeHtml(item.name)}</h1>
        </div>
        <div class="reorder-body">
          <ul class="detail-list">
            <li><span>SKU</span><span>${escapeHtml(item.sku)}</span></li>
            <li><span>Reorder qty</span><span>${escapeHtml(item.reorderQty)} ${escapeHtml(item.unit)}</span></li>
            <li><span>Location</span><span>${escapeHtml(item.location || "—")}</span></li>
            <li><span>Vendor</span><span>${escapeHtml(item.vendor || "—")}</span></li>
            ${item.notes ? `<li><span>Notes</span><span>${escapeHtml(item.notes)}</span></li>` : ""}
          </ul>
          <div class="reorder-actions">
            <button type="button" class="button primary" id="requestReorder">Request reorder</button>
            ${source === "local" ? `<button type="button" class="button ghost" id="flagOnly">Just flag on board</button>` : `<p style="margin:0;color:var(--muted);font-size:0.85rem;text-align:center">Opens an email draft to purchasing (set on the board device under Settings).</p>`}
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#requestReorder")?.addEventListener("click", () => {
    completeReorder(item, true, source);
  });
  document.querySelector("#flagOnly")?.addEventListener("click", () => {
    completeReorder(item, false, source);
  });
}

function openMailto(item) {
  const email = settings.notifyEmail || "";
  const subject = encodeURIComponent(`[Reorder] ${item.name} (${item.sku})`);
  const body = encodeURIComponent(
    [
      `Reorder request from ${settings.teamName}`,
      "",
      `Item: ${item.name}`,
      `SKU: ${item.sku}`,
      `Qty: ${item.reorderQty} ${item.unit}`,
      `Location: ${item.location || "n/a"}`,
      `Vendor: ${item.vendor || "n/a"}`,
      item.notes ? `Notes: ${item.notes}` : "",
      "",
      `Requested: ${new Date().toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("\n")
  );
  const href = email
    ? `mailto:${email}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function upsertFromScan(item) {
  const existing = findSupply(item.id);
  if (existing) {
    existing.status = "ordered";
    existing.updatedAt = Date.now();
  } else {
    state.supplies.push({
      ...item,
      status: "ordered",
      updatedAt: Date.now(),
    });
  }
  saveState();
}

function completeReorder(item, withEmail, source) {
  if (source === "local") {
    setStatus(item.id, "ordered");
  } else {
    upsertFromScan(item);
  }

  main.innerHTML = `
    <div class="reorder-view">
      <div class="reorder-card success-state">
        <div class="check" aria-hidden="true">✓</div>
        <h1>Reorder requested</h1>
        <p><strong>${escapeHtml(item.name)}</strong> — email draft ready for purchasing. On this device the board shows it as On order.</p>
        <div class="reorder-actions">
          ${withEmail ? `<button type="button" class="button primary" id="openMail">Open email draft</button>` : ""}
          <a class="button secondary" href="#/board">View board</a>
        </div>
      </div>
    </div>
  `;

  if (withEmail) {
    document.querySelector("#openMail")?.addEventListener("click", () => openMailto(item));
    openMailto(item);
  }
}

function openSupplyModal(id = null) {
  editingId = id;
  const item = id ? findSupply(id) : null;
  document.querySelector("#modalTitle").textContent = item ? "Edit supply" : "Add supply";
  document.querySelector("#fieldId").value = item?.id || "";
  document.querySelector("#fieldName").value = item?.name || "";
  document.querySelector("#fieldSku").value = item?.sku || "";
  document.querySelector("#fieldLocation").value = item?.location || "";
  document.querySelector("#fieldReorderQty").value = item?.reorderQty || 1;
  document.querySelector("#fieldUnit").value = item?.unit || "box";
  document.querySelector("#fieldVendor").value = item?.vendor || "";
  document.querySelector("#fieldNotes").value = item?.notes || "";
  supplyModal.showModal();
  document.querySelector("#fieldName").focus();
}

supplyForm.addEventListener("submit", (e) => {
  const submitter = e.submitter;
  if (submitter?.value === "cancel") {
    return;
  }
  e.preventDefault();
  const data = {
    name: document.querySelector("#fieldName").value.trim(),
    sku: document.querySelector("#fieldSku").value.trim(),
    location: document.querySelector("#fieldLocation").value.trim(),
    reorderQty: Number(document.querySelector("#fieldReorderQty").value) || 1,
    unit: document.querySelector("#fieldUnit").value.trim() || "unit",
    vendor: document.querySelector("#fieldVendor").value.trim(),
    notes: document.querySelector("#fieldNotes").value.trim(),
  };

  if (!data.name || !data.sku) return;

  if (editingId) {
    const item = findSupply(editingId);
    Object.assign(item, data, { updatedAt: Date.now() });
    toast("Supply updated");
  } else {
    state.supplies.push({
      id: uid(),
      ...data,
      status: "shelf",
      updatedAt: Date.now(),
    });
    toast("Supply added");
  }
  saveState();
  supplyModal.close();
  editingId = null;
  render();
});

addSupplyBtn.addEventListener("click", () => openSupplyModal());

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

if (!location.hash) {
  location.hash = "#/board";
} else {
  render();
}
