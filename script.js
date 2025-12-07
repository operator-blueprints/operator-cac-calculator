document.addEventListener("DOMContentLoaded", () => {
  const timeUnitEl = document.getElementById("time-unit");
  const timeLabelEl = document.getElementById("time-label");
  const newCustomersEl = document.getElementById("new-customers");
  const paidSpendEl = document.getElementById("paid-spend");
  const otherSpendEl = document.getElementById("other-spend");
  const ltvEl = document.getElementById("ltv");

  const blendedCACEl = document.getElementById("blended-cac");
  const blendedCACSubEl = document.getElementById("blended-cac-sub");
  const paidCACEl = document.getElementById("paid-cac");
  const totalSpendEl = document.getElementById("total-spend");
  const totalSpendSubEl = document.getElementById("total-spend-sub");
  const customersOutEl = document.getElementById("customers-out");

  const summaryPeriodEl = document.getElementById("summary-period");
  const errorBannerEl = document.getElementById("error-banner");

  const ltvCACStatusEl = document.getElementById("ltv-cac-status");
  const ltvCACRatioEl = document.getElementById("ltv-cac-ratio");

  const formEl = document.getElementById("cac-form");
  const quickFillBtn = document.getElementById("quick-fill");

  function parseNumber(inputEl) {
    const raw = (inputEl.value || "").toString().trim();
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return "$0.00";
    return (
      "$" +
      value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "0";
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  }

  function formatRatio(value) {
    if (!Number.isFinite(value) || value <= 0) return "–";
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  function updateSummary(customers, totalSpend) {
    const unit = timeUnitEl.value || "Period";
    const label = timeLabelEl.value.trim();

    if (!customers && !totalSpend && !label) {
      summaryPeriodEl.textContent = "Waiting for inputs…";
      return;
    }

    const periodText = label ? `${label} (${unit})` : `This ${unit.toLowerCase()}`;
    summaryPeriodEl.textContent = `${formatNumber(customers)} new customers in ${periodText}.`;
  }

  function updateError(message) {
    if (message) {
      errorBannerEl.textContent = message;
      errorBannerEl.classList.add("visible");
    } else {
      errorBannerEl.textContent = "";
      errorBannerEl.classList.remove("visible");
    }
  }

  function updateLtvCAC(ltv, blendedCAC) {
    ltvCACStatusEl.classList.remove("good", "warn", "danger");

    if (!ltv || !blendedCAC || blendedCAC <= 0) {
      ltvCACStatusEl.textContent = "Add LTV";
      ltvCACRatioEl.textContent = "Add LTV to see your LTV:CAC ratio.";
      return;
    }

    const ratio = ltv / blendedCAC;
    const ratioText = formatRatio(ratio);

    if (ratio >= 3) {
      ltvCACStatusEl.textContent = "Healthy";
      ltvCACStatusEl.classList.add("good");
      ltvCACRatioEl.textContent = `Your LTV:CAC is ${ratioText}x – strong foundation for scaling.`;
    } else if (ratio >= 2) {
      ltvCACStatusEl.textContent = "Tight";
      ltvCACStatusEl.classList.add("warn");
      ltvCACRatioEl.textContent = `Your LTV:CAC is ${ratioText}x – workable but margin is tight.`;
    } else {
      ltvCACStatusEl.textContent = "Danger";
      ltvCACStatusEl.classList.add("danger");
      ltvCACRatioEl.textContent = `Your LTV:CAC is ${ratioText}x – acquisition is likely unprofitable.`;
    }
  }

  function calculate() {
    const customers = parseNumber(newCustomersEl);
    const paidSpend = parseNumber(paidSpendEl);
    const otherSpend = parseNumber(otherSpendEl);
    const ltv = parseNumber(ltvEl);

    const totalSpend = paidSpend + otherSpend;

    // Update high-level summary
    updateSummary(customers, totalSpend);

    // Validation for CAC math
    if (customers <= 0 && (paidSpend > 0 || otherSpend > 0)) {
      blendedCACEl.textContent = "$0.00";
      paidCACEl.textContent = "$0.00";
      totalSpendEl.textContent = formatCurrency(totalSpend);
      customersOutEl.textContent = "0";

      blendedCACSubEl.textContent =
        "Enter new customers > 0 to calculate CAC.";
      totalSpendSubEl.textContent = "Paid + other acquisition costs";

      updateError(
        "To calculate CAC, you need at least one new customer in the selected period."
      );
      updateLtvCAC(0, 0);
      return;
    }

    updateError("");

    // CAC calculations
    let paidCAC = 0;
    let blendedCAC = 0;

    if (customers > 0) {
      paidCAC = paidSpend / customers;
      blendedCAC = totalSpend / customers;
    }

    blendedCACEl.textContent = formatCurrency(blendedCAC);
    paidCACEl.textContent = formatCurrency(paidCAC);
    totalSpendEl.textContent = formatCurrency(totalSpend);
    customersOutEl.textContent = formatNumber(customers);

    blendedCACSubEl.textContent =
      "Total acquisition spend ÷ new customers";
    totalSpendSubEl.textContent =
      "Paid + other acquisition costs";

    updateLtvCAC(ltv, blendedCAC);
  }

  function applyQuickFill() {
    timeUnitEl.value = "Month";
    timeLabelEl.value = "November 2025";

    newCustomersEl.value = "320";
    paidSpendEl.value = "14800";
    otherSpendEl.value = "5200";
    ltvEl.value = "420";

    calculate();
  }

  // Wire up listeners
  [
    timeUnitEl,
    timeLabelEl,
    newCustomersEl,
    paidSpendEl,
    otherSpendEl,
    ltvEl,
  ].forEach((el) => {
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  if (quickFillBtn) {
    quickFillBtn.addEventListener("click", applyQuickFill);
  }

  formEl.addEventListener("reset", () => {
    // Allow default reset to clear inputs, then restore outputs
    window.setTimeout(() => {
      blendedCACEl.textContent = "$0.00";
      paidCACEl.textContent = "$0.00";
      totalSpendEl.textContent = "$0.00";
      customersOutEl.textContent = "0";
      summaryPeriodEl.textContent = "Waiting for inputs…";
      blendedCACSubEl.textContent =
        "Total acquisition spend ÷ new customers";
      totalSpendSubEl.textContent = "Paid + other acquisition costs";
      updateError("");
      updateLtvCAC(0, 0);
    }, 0);
  });

  // Initial render
  calculate();
});
