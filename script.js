const form = document.querySelector("#hatForm");
const steps = [...document.querySelectorAll(".form-step")];
const stepItems = [...document.querySelectorAll("#stepList li")];
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const submitBtn = document.querySelector("#submitBtn");
const addRunBtn = document.querySelector("#addRun");
const runList = document.querySelector("#runList");
const presetButtons = [...document.querySelectorAll(".preset")];
const patchToggle = document.querySelector("#patchToggle");
const patchOptions = document.querySelector("#patchOptions");
const shipFields = document.querySelector("#shipFields");
const pickupBox = document.querySelector("#pickupBox");
const demoDialog = document.querySelector("#demoDialog");
const closeDialog = document.querySelector("#closeDialog");
const progressFill = document.querySelector("#progressFill");
const progressCopy = document.querySelector("#progressCopy");

let activeStep = 0;

function setStep(index, shouldScroll = true) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === activeStep);
  });

  stepItems.forEach((item, stepIndex) => {
    item.classList.toggle("active", stepIndex === activeStep);
    item.classList.toggle("complete", stepIndex < activeStep);
  });

  prevBtn.disabled = activeStep === 0;
  nextBtn.hidden = activeStep === steps.length - 1;
  submitBtn.hidden = activeStep !== steps.length - 1;
  nextBtn.textContent = activeStep === steps.length - 2 ? "Review quote" : "Continue";
  progressFill.style.width = `${((activeStep + 1) / steps.length) * 100}%`;
  progressCopy.textContent = `Step ${activeStep + 1} of ${steps.length}`;
  if (shouldScroll) {
    document.querySelector("#builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function selectedValues(name) {
  return [...form.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);
}

function updateChoiceCards() {
  document.querySelectorAll(".choice-card").forEach((card) => {
    const inputs = [...card.querySelectorAll("input")];
    card.classList.toggle("selected", inputs.some((input) => input.checked));
  });
}

function updateConditionalFields() {
  patchOptions.hidden = !patchToggle.checked;
  const delivery = form.querySelector('[name="delivery"]:checked')?.value;
  const isPickup = delivery === "Pickup";
  shipFields.hidden = isPickup;
  pickupBox.hidden = !isPickup;
}

function updateSummary() {
  const style = form.querySelector('[name="hatStyle"]:checked')?.value || "Hat";
  const quantities = [...form.querySelectorAll('[name="quantity[]"]')].map((input) => Number(input.value) || 0);
  const total = quantities.reduce((sum, quantity) => sum + quantity, 0);
  const decorations = selectedValues("decor");
  const addons = selectedValues("addon");
  const art = form.querySelector('[name="artStatus"]:checked')?.value || "Not selected";
  const timeline = form.querySelector('[name="timeline"]:checked')?.value || "Not selected";
  const delivery = form.querySelector('[name="delivery"]:checked')?.value || "Not selected";
  const perHatLow = decorations.includes("Patch") ? 22 : 18;
  const perHatHigh = decorations.includes("Patch") ? 29 : 25;
  const addonLow = addons.length * 3;
  const addonHigh = addons.length * 6;
  const lowEstimate = total * (perHatLow + addonLow);
  const highEstimate = total * (perHatHigh + addonHigh);

  document.querySelector("#summaryStyle").textContent = `${style} hats`;
  document.querySelector("#summaryQty").textContent = total.toString();
  document.querySelector("#summaryDecor").textContent = [...decorations, ...addons].length ? [...decorations, ...addons].join(", ") : "Not selected";
  document.querySelector("#summaryArt").textContent = art;
  document.querySelector("#summaryTimeline").textContent = timeline;
  document.querySelector("#summaryDelivery").textContent = delivery;
  document.querySelector("#summaryEstimate").textContent = total > 0 ? `$${lowEstimate.toLocaleString()}-$${highEstimate.toLocaleString()}` : "TBD";
  document.querySelector("#setupBadge").textContent = total >= 96 ? "96+ best value" : total >= 48 ? "48+ premium setup" : total >= 24 ? "24+ hats" : total >= 12 ? "12+ hats" : "Starter order";
  document.querySelector("#conversionTip").textContent = conversionTip(total, decorations, addons);
  document.querySelector("#valueNote").textContent = conversionTip(total, decorations, addons);
  syncPresetState(total);
}

function conversionTip(total, decorations, addons) {
  if (total < 24) {
    return `Add ${24 - total} more hat${24 - total === 1 ? "" : "s"} to reach a stronger starter order.`;
  }

  if (total < 48) {
    return `Add ${48 - total} more hat${48 - total === 1 ? "" : "s"} to reach the recommended premium order level.`;
  }

  if (total >= 96 && !decorations.includes("Patch")) {
    return "At this quantity, a patch finish is worth considering for a more retail-ready hat.";
  }

  if (decorations.includes("Patch") && addons.length === 0) {
    return "Patch selected. Back or side stitching can add a premium branded detail.";
  }

  return "Great choice: this setup is ready for a high-confidence quote and art proof.";
}

function syncPresetState(total) {
  presetButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.qty) === total);
  });
}

function addHatRun() {
  const run = document.createElement("div");
  run.className = "hat-run";
  run.innerHTML = `
    <label class="field">
      <span>Color</span>
      <select name="color[]">
        <option>Black</option>
        <option>White</option>
        <option>Navy</option>
        <option>Charcoal</option>
        <option>Heather Gray</option>
        <option>Royal</option>
        <option>Red</option>
        <option>Forest</option>
        <option>Khaki</option>
        <option>Other / not sure</option>
      </select>
    </label>
    <label class="field">
      <span>Size</span>
      <select name="size[]">
        <option>Adjustable / OSFM</option>
        <option>S/M</option>
        <option>L/XL</option>
        <option>Youth</option>
        <option>Other / not sure</option>
      </select>
    </label>
    <label class="field qty-field">
      <span>Qty</span>
      <input name="quantity[]" type="number" min="0" value="12">
    </label>
  `;
  runList.append(run);
  updateSummary();
}

prevBtn.addEventListener("click", () => setStep(activeStep - 1));
nextBtn.addEventListener("click", () => setStep(activeStep + 1));
addRunBtn.addEventListener("click", addHatRun);

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const firstQty = form.querySelector('[name="quantity[]"]');
    firstQty.value = button.dataset.qty;
    updateSummary();
  });
});

form.addEventListener("input", () => {
  updateChoiceCards();
  updateConditionalFields();
  updateSummary();
});

form.addEventListener("change", () => {
  updateChoiceCards();
  updateConditionalFields();
  updateSummary();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (demoDialog.showModal) {
    demoDialog.showModal();
  }
});

closeDialog.addEventListener("click", () => demoDialog.close());

updateChoiceCards();
updateConditionalFields();
updateSummary();
setStep(0, false);
