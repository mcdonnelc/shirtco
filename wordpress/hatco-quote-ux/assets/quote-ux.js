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
    sizesWrapper: ".wdac-form-products__quality-sizes-wrapper",
    product: ".wdac-form-item[data-product-id]",
    quality: "[data-quality-select-id]",
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

    const field = input.closest(".js-wdac-form-products-item-add-wrapper");
    if (!field) {
      return;
    }

    field.classList.add("hatco-size-field");

    const control = document.createElement("div");
    control.className = "hatco-quantity-control";
    input.parentNode.insertBefore(control, input);
    control.appendChild(createQuantityButton(input, -1));
    control.appendChild(input);
    control.appendChild(createQuantityButton(input, 1));

    input.setAttribute("inputmode", "numeric");
    input.setAttribute("min", "0");
    input.dataset.hatcoEnhanced = "true";
  }

  function enhanceSizesWrapper(wrapper) {
    if (wrapper.dataset.hatcoSizes === "true") {
      return;
    }

    wrapper.dataset.hatcoSizes = "true";

    const sizes = wrapper.querySelectorAll(".wdac-form-products__size");
    if (sizes.length === 1) {
      wrapper.classList.add("hatco-single-size");
      const subtitle = wrapper.querySelector(".wdac-form-products__subtitle");
      if (subtitle) {
        subtitle.textContent = "How many do you need?";
      }
    }
  }

  function createSizeField(qualityId, size, index) {
    const field = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const inputId = `hatco-qty-${qualityId}-${index}`.replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    );

    field.className =
      "wdac-form-products__size js-wdac-proxy-focusable " +
      "js-wdac-form-products-item-add-wrapper js-wdac-form-size";

    label.className = "wdac-form-products__size-label";
    label.htmlFor = inputId;
    label.textContent = size;

    input.id = inputId;
    input.name = `${qualityId}|${size}`;
    input.type = "number";
    input.min = "0";
    input.placeholder = "0";
    input.className =
      "wdac-form-products__size-input js-wdac-form-products-item-add";

    const separator = qualityId.lastIndexOf("|");
    const productName = qualityId.slice(0, separator);
    const qualityName = qualityId.slice(separator + 1);
    const savedProduct = window.WdacProductsObject?.Products?.find(
      (product) =>
        product.name === productName && product.quality === qualityName
    );
    const savedQuantity = Number.parseInt(savedProduct?.sizes?.[size], 10) || 0;
    if (savedQuantity > 0) {
      input.value = String(savedQuantity);
      field.classList.add("active");
    }

    field.append(label, input);
    return field;
  }

  function createSizesWrapper(qualityId, product) {
    const wrapper = document.createElement("div");
    const heading = document.createElement("h4");
    const help = document.createElement("p");
    const fields = document.createElement("div");

    wrapper.className = "wdac-form-products__quality-sizes-wrapper";
    wrapper.dataset.qualityId = qualityId;
    wrapper.dataset.hatcoSupplier = product.supplier;

    heading.className = "wdac-h4 wdac-form-products__subtitle";
    heading.textContent = "Select your sizes";

    help.className = "wdac-text-semismall";
    help.textContent = `Available sizes verified with ${product.supplier}.`;

    fields.className = "wdac-form-products__quality-sizes";
    product.sizes.forEach((size, index) => {
      fields.appendChild(createSizeField(qualityId, size, index));
    });

    wrapper.append(heading, help, fields);
    return wrapper;
  }

  function syncVendorSizes(item) {
    if (item.dataset.hatcoSizesCatalog === "true") {
      return;
    }

    const qualities = Array.from(item.querySelectorAll(selectors.quality));
    const mappedQualities = qualities
      .map((quality) => {
        const styleElement = quality.querySelector(
          ".wdac-form-products__quality-sku"
        );
        const styleNumber = styleElement?.textContent
          .replace(/^(SKU|Style)\s*#?:?\s*/i, "")
          .trim();
        const product = window.HatCoQuoteSizes.get(styleNumber);

        if (!styleElement || !styleNumber || !product) {
          return null;
        }

        styleElement.textContent = `Style #${styleNumber}`;
        return {
          product,
          qualityId: quality.dataset.qualitySelectId,
          selected: quality.classList.contains("active")
        };
      })
      .filter(Boolean);

    if (!mappedQualities.length) {
      return;
    }

    item.querySelectorAll(".wdac-form-products__sizes").forEach((sizes) => {
      sizes.remove();
    });

    const sizesContainer = document.createElement("div");
    sizesContainer.className = "wdac-form-products__sizes";

    mappedQualities.forEach(({ product, qualityId, selected }) => {
      const wrapper = createSizesWrapper(qualityId, product);
      wrapper.classList.toggle("active", selected);
      sizesContainer.appendChild(wrapper);
    });

    const colors = item.querySelector(".wdac-form-products__colors");
    if (colors) {
      colors.insertAdjacentElement("afterend", sizesContainer);
    } else {
      item.appendChild(sizesContainer);
    }

    item.dataset.hatcoSizesCatalog = "true";
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
    if (
      !wrapper ||
      !window.HatCoQuoteColors ||
      !window.HatCoQuoteSizes
    ) {
      return;
    }

    addPromisePanel(wrapper);
    addTrustStrip(wrapper);
    wrapper.querySelectorAll(selectors.product).forEach(syncVendorSizes);
    wrapper.querySelectorAll(selectors.colorGroup).forEach(addColorDisclosure);
    wrapper.querySelectorAll(selectors.sizesWrapper).forEach(enhanceSizesWrapper);
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
