/* ---------- helpers ---------- */

function parseNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const raw = String(el.value || "").trim();
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "–";
  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatRatio(value) {
  if (!Number.isFinite(value) || value <= 0) return "–";
  return (
    value.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "x"
  );
}

function timeUnitLabel(unit, plural = true) {
  if (unit === "week") return plural ? "weeks" : "week";
  if (unit === "year") return plural ? "years" : "year";
  return plural ? "months" : "month";
}

/* ---------- core model ---------- */

function resetCACOutputs() {
  document.getElementById("blendedCACValue").textContent = "–";
  document.getElementById("paidCACValue").textContent = "–";
  document.getElementById("totalSpendValue").textContent = "–";
  document.getElementById("ltvCACValue").textContent = "–";

  document.getElementById("blendedCACTag").textContent =
    "Total acquisition spend ÷ new customers";
  document.getElementById("totalSpendTag").textContent =
    "Paid + other acquisition costs";
  document.getElementById("ltvCACTag").textContent =
    "Add LTV per customer to see LTV:CAC.";

  const summaryList = document.getElementById("summaryList");
  summaryList.innerHTML = "";
  const li = document.createElement("li");
  li.textContent =
    "Enter new customers and acquisition spend, then calculate CAC.";
  summaryList.appendChild(li);
}

function runCAC() {
  const timeUnit = document.getElementById("timeUnit").value || "month";
  const periodLabel =
    (document.getElementById("periodLabel").value || "").trim();

  const newCustomers = parseNumber("newCustomers");
  const paidSpend = parseNumber("paidSpend");
  const otherSpend = parseNumber("otherSpend");
  const ltvPerCustomer = parseNumber("ltvPerCustomer");

  if (!newCustomers || newCustomers <= 0) {
    resetCACOutputs();
    return;
  }

  const totalSpend = paidSpend + otherSpend;
  const blendedCAC = totalSpend > 0 ? totalSpend / newCustomers : 0;
  const paidCAC = paidSpend > 0 ? paidSpend / newCustomers : NaN;

  const ltvCAC = ltvPerCustomer > 0 && blendedCAC > 0
    ? ltvPerCustomer / blendedCAC
    : NaN;

  // KPIs
  document.getElementById("blendedCACValue").textContent =
    formatCurrency(blendedCAC);
  document.getElementById("paidCACValue").textContent =
    Number.isNaN(paidCAC) ? "–" : formatCurrency(paidCAC);
  document.getElementById("totalSpendValue").textContent =
    formatCurrency(totalSpend);
  document.getElementById("ltvCACValue").textContent = formatRatio(ltvCAC);

  const ltvTagEl = document.getElementById("ltvCACTag");
  if (ltvPerCustomer > 0 && blendedCAC > 0) {
    if (ltvCAC >= 3) {
      ltvTagEl.textContent = "Healthy: target is typically 3x+ LTV:CAC.";
    } else if (ltvCAC >= 2) {
      ltvTagEl.textContent =
        "Borderline: consider improving CAC or LTV to reach 3x+.";
    } else {
      ltvTagEl.textContent =
        "Weak: acquisition likely unprofitable unless strategic.";
    }
  } else {
    ltvTagEl.textContent = "Add LTV per customer to see LTV:CAC.";
  }

  // Summary
  const summaryList = document.getElementById("summaryList");
  summaryList.innerHTML = "";

  const periodText = periodLabel
    ? `${periodLabel} (${timeUnitLabel(timeUnit)})`
    : `this ${timeUnitLabel(timeUnit)}`;

  const li1 = document.createElement("li");
  li1.textContent = `For ${periodText}, you acquired ${newCustomers.toLocaleString(
    "en-US"
  )} new customers with total acquisition spend of ${formatCurrency(
    totalSpend
  )}.`;
  summaryList.appendChild(li1);

  const li2 = document.createElement("li");
  li2.textContent = `Your blended CAC is ${formatCurrency(
    blendedCAC
  )}, with paid CAC at ${
    Number.isNaN(paidCAC) ? "–" : formatCurrency(paidCAC)
  }.`;
  summaryList.appendChild(li2);

  if (ltvPerCustomer > 0 && blendedCAC > 0) {
    const li3 = document.createElement("li");
    li3.textContent = `With LTV per customer at ${formatCurrency(
      ltvPerCustomer
    )}, your LTV:CAC is ${formatRatio(
      ltvCAC
    )}. Aim for 3x+ to sustain aggressive acquisition.`;
    summaryList.appendChild(li3);
  }
}

/* ---------- reset & init ---------- */

function resetCACInputs() {
  const form = document.getElementById("cac-form");
  if (form) form.reset();

  document.getElementById("timeUnit").value = "month";
  document.getElementById("newCustomers").value = "250";
  document.getElementById("paidSpend").value = "12000";
  document.getElementById("otherSpend").value = "8000";
  document.getElementById("periodLabel").value = "";
  document.getElementById("ltvPerCustomer").value = "";

  resetCACOutputs();
}

document.addEventListener("DOMContentLoaded", () => {
  resetCACOutputs();
  runCAC();

  const watched = [
    "timeUnit",
    "periodLabel",
    "newCustomers",
    "paidSpend",
    "otherSpend",
    "ltvPerCustomer",
  ];

  watched.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => runCAC());
    el.addEventListener("change", () => runCAC());
  });
});
