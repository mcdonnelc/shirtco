(function initializeHatCoQuoteUX() {
  "use strict";

  const FORM_ID = 2;
  const DEFAULT_VISIBLE_COLORS = 12;
  const selectors = {
    wrapper: `#gform_wrapper_${FORM_ID}`,
    form: `#gform_${FORM_ID}`,
    colorGroup: ".wdac-form-products__quality-colors",
    color: ".js-wdac-form-color",
    colorInput: ".js-wdac-checkbox",
    colorName: ".wdac-form-tooltiptext",
    quantityInput: ".js-wdac-form-products-item-add",
    page: `.gform_page[id^="gform_page_${FORM_ID}_"]`
  };

  let scheduled = false;

  function addPromisePanel(wrapper) {
    if (wrapper.querySelector(".hatco-proof-promise")) {
      return;
    }

    const form = wrapper.querySelector(selectors.form);
    if (!form) {
      return;
    }

    const panel = document.createElement("section");
    panel.className = "hatco-proof-promise";
    panel.setAttribute("aria-label", "How artwork approval works");
    panel.innerHTML = `
      <div class="hatco-proof-promise__icon" aria-hidden="true">✓</div>
      <div>
        <h3>Simple choices now. A real proof before production.</h3>
        <p>No design tool needed. Choose your hats and upload whatever artwork you have. After you approve your quote and complete purchase, our art team will email a proof. Nothing is produced until you approve it.</p>
      </div>
    `;

    form.insertAdjacentElement("beforebegin", panel);
  }

  function addTrustStrip(wrapper) {
    if (wrapper.querySelector(".hatco-quote-trust")) {
      return;
    }

    const form = wrapper.querySelector(selectors.form);
    if (!form) {
      return;
    }

    const trust = document.createElement("ul");
    trust.className = "hatco-quote-trust";
    trust.setAttribute("aria-label", "Why order from Hat.co");
    trust.innerHTML = `
      <li><strong>5-day</strong><span>standard turnaround</span></li>
      <li><strong>685+</strong><span>five-star reviews</span></li>
      <li><strong>Human</strong><span>artwork review</span></li>
    `;

    form.insertAdjacentElement("afterend", trust);
  }

  function enhanceColor(color) {
    if (color.dataset.hatcoEnhanced === "true") {
      syncColorState(color);
      return;
    }

    const name = color.querySelector(selectors.colorName);
    const input = color.querySelector(selectors.colorInput);
    const label = name ? name.textContent.trim() : input?.name || "Color";
    const swatch = document.createElement("span");

    swatch.className = "hatco-color-chip";
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.setProperty(
      "--hatco-color",
      window.HatCoQuoteColors.swatchBackground(label)
    );

    color.insertBefore(swatch, color.firstChild);
    color.dataset.hatcoEnhanced = "true";

    if (input) {
      input.setAttribute("aria-label", `Select ${label}`);
      input.addEventListener("change", () => syncColorState(color));
    }

    syncColorState(color);
  }

  function syncColorState(color) {
    const input = color.querySelector(selectors.colorInput);
    color.setAttribute("aria-pressed", input?.checked ? "true" : "false");
  }

  function addColorDisclosure(group) {
    const colors = Array.from(group.querySelectorAll(selectors.color));
    colors.forEach(enhanceColor);

    if (colors.length <= DEFAULT_VISIBLE_COLORS || group.dataset.hatcoDisclosure === "true") {
      return;
    }

    colors.slice(DEFAULT_VISIBLE_COLORS).forEach((color) => {
      color.classList.add("hatco-color-overflow");
    });
    group.classList.add("hatco-colors-collapsed");
    group.dataset.hatcoDisclosure = "true";

    const button = document.createElement("button");
    button.className = "hatco-color-disclosure";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.textContent = `View all ${colors.length} colors`;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      group.classList.toggle("hatco-colors-collapsed", expanded);
      button.textContent = expanded
        ? `View all ${colors.length} colors`
        : "Show popular colors";
    });

    group.insertAdjacentElement("afterend", button);
  }

  function createQuantityButton(input, direction) {
    const button = document.createElement("button");
    const label = direction > 0 ? "Increase quantity" : "Decrease quantity";

    button.className = "hatco-quantity-button";
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.textContent = direction > 0 ? "+" : "−";
    button.addEventListener("click", () => {
      const current = Number.parseInt(input.value, 10) || 0;
      const step = Number.parseInt(input.step, 10) || 1;
      input.value = Math.max(0, current + direction * step);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    return button;
  }

  function enhanceQuantity(input) {
    if (input.dataset.hatcoEnhanced === "true") {
      return;
    }

    const wrapper = input.closest(".js-wdac-form-products-item-add-wrapper");
    if (!wrapper) {
      return;
    }

    wrapper.classList.add("hatco-quantity-control");
    wrapper.insertBefore(createQuantityButton(input, -1), input);
    wrapper.appendChild(createQuantityButton(input, 1));
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("min", "0");
    input.dataset.hatcoEnhanced = "true";
  }

  function addStepHeading(page) {
    if (page.querySelector(".hatco-step-heading")) {
      return;
    }

    const pageNumber = Number.parseInt(page.id.split("_").pop(), 10);
    const titles = {
      1: ["Choose your hats", "Pick styles, colors, and quantities. You can mix colors."],
      2: ["Artwork and decoration", "Upload what you have or ask our team for help."],
      3: ["Timing and delivery", "Tell us when and where you need your order."],
      4: ["Contact and review", "Review your choices and tell us where to send the quote."]
    };
    const content = titles[pageNumber];

    if (!content) {
      return;
    }

    const heading = document.createElement("header");
    heading.className = "hatco-step-heading";
    heading.innerHTML = `<span>Step ${pageNumber} of 4</span><h2>${content[0]}</h2><p>${content[1]}</p>`;
    page.insertBefore(heading, page.firstChild);
  }

  function enhance() {
    const wrapper = document.querySelector(selectors.wrapper);
    if (!wrapper || !window.HatCoQuoteColors) {
      return;
    }

    addPromisePanel(wrapper);
    addTrustStrip(wrapper);
    wrapper.querySelectorAll(selectors.colorGroup).forEach(addColorDisclosure);
    wrapper.querySelectorAll(selectors.quantityInput).forEach(enhanceQuantity);
    wrapper.querySelectorAll(selectors.page).forEach(addStepHeading);
  }

  function scheduleEnhance() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }

  document.addEventListener("gform_page_loaded", scheduleEnhance);
  document.addEventListener("gform/postRender", scheduleEnhance);

  if (window.jQuery) {
    window.jQuery(document).on(
      "gform_page_loaded gform_post_render",
      scheduleEnhance
    );
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      scheduleEnhance();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
