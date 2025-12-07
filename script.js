function num(id) {
  const v = document.getElementById(id).value;
  return v === "" ? null : Number(v);
}

function money(v) {
  return v == null ? "—" : "$" + v.toFixed(2);
}

function ratio(v) {
  return v == null ? "—" : v.toFixed(2) + "x";
}

function text(id, value) {
  document.getElementById(id).textContent = value;
}

function recalc() {
  const timeUnit = document.getElementById("timeUnit").value;
  const periodLabel = document.getElementById("periodLabel").value || "—";

  const paid = num("paidMediaSpend") || 0;
  const other = num("otherMarketingSpend") || 0;
  const salary = num("salarySpend") || 0;
  const overhead = num("overheadSpend") || 0;

  const newCust = num("newCustomers");
  const paidCust = num("paidCustomers");

  const ltv = num("ltv");
  const m = num("grossMargin");
  const aov = num("aov");

  const total = paid + other + salary + overhead;

  text("summaryTimeUnit", timeUnit);
  text("summaryPeriodLabel", periodLabel);
  text("summaryTotalSpend", money(total));
  text("summaryNewCustomers", newCust ?? "—");
  text("summaryPaidCustomers", paidCust ?? "—");

  let blended = null;
  if (newCust > 0) blended = total / newCust;
  text("blendedCacDisplay", money(blended));

  let paidCac = null;
  if (paidCust > 0) paidCac = paid / paidCust;
  text("paidCacDisplay", money(paidCac));

  let ltvCac = null;
  if (ltv > 0 && blended > 0) ltvCac = ltv / blended;
  text("ltvCacDisplay", ratio(ltvCac));

  let orders = null;
  if (aov > 0 && m > 0 && blended > 0) {
    const gp = aov * (m / 100);
    if (gp > 0) orders = blended / gp;
  }
  text("ordersToBreakEvenDisplay", orders == null ? "—" : orders.toFixed(2));

  document.getElementById("interpretationText").textContent =
    blended == null
      ? "Enter spend + customers."
      : ltvCac == null
      ? "Add LTV for LTV:CAC."
      : "CAC + LTV ready.";
}

function resetForm() {
  document.getElementById("cacForm").reset();
  recalc();
}

function copySummary() {
  const fields = [
    "summaryTimeUnit",
    "summaryPeriodLabel",
    "summaryTotalSpend",
    "summaryNewCustomers",
    "summaryPaidCustomers",
    "blendedCacDisplay",
    "paidCacDisplay",
    "ltvCacDisplay",
    "ordersToBreakEvenDisplay"
  ];

  let out = "Operator Blueprints — CAC Summary\n\n";
  fields.forEach((id) => {
    out += id + ": " + document.getElementById(id).textContent + "\n";
  });

  navigator.clipboard.writeText(out);
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("#cacForm input, #cacForm select")
    .forEach((el) => el.addEventListener("input", recalc));

  document.getElementById("resetButton").onclick = resetForm;
  document.getElementById("copyButton").onclick = copySummary;

  recalc();
});
