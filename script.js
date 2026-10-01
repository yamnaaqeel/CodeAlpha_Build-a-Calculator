const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

let current = "0";     // number being typed
let previous = null;   // stored first operand
let operator = null;   // pending operator
let justEvaluated = false;

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function format(value) {
  if (value === "Error") return value;
  const [int, dec] = String(value).split(".");
  const withCommas = Number(int).toLocaleString("en-US");
  const sign = int === "-0" ? "-0" : withCommas;
  return dec !== undefined ? sign + "." + dec : sign;
}

function updateDisplay() {
  currentEl.textContent = format(current);
  historyEl.textContent =
    previous !== null && operator ? `${format(previous)} ${symbols[operator]}` : "";
}

function inputNumber(n) {
  if (current === "Error" || justEvaluated) { current = "0"; justEvaluated = false; }
  if (n === "." && current.includes(".")) return;
  if (current.replace(/[-.]/g, "").length >= 15) return;
  current = current === "0" && n !== "." ? n : current + n;
  updateDisplay();
}

function calculate(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  let result;
  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/": if (b === 0) return "Error"; result = a / b; break;
    case "%": result = a % b; break;
  }
  return String(parseFloat(result.toPrecision(12)));
}

function chooseOperator(op) {
  if (current === "Error") return;
  if (op === "%") {                      // percent of current value
    current = String(parseFloat(current) / 100);
    updateDisplay();
    return;
  }
  if (operator && previous !== null && !justEvaluated) {
    current = calculate(previous, current, operator);
  }
  previous = current;
  operator = op;
  justEvaluated = false;
  updateDisplay();
  current = current === "Error" ? "Error" : "0";
  if (previous === "Error") { previous = null; operator = null; currentEl.textContent = "Error"; }
}

function equals() {
  if (operator === null || previous === null) return;
  const expr = `${format(previous)} ${symbols[operator]} ${format(current)} =`;
  current = calculate(previous, current, operator);
  historyEl.textContent = expr;
  currentEl.textContent = format(current);
  previous = null;
  operator = null;
  justEvaluated = true;
}

function clearAll() {
  current = "0"; previous = null; operator = null; justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated || current === "Error") { clearAll(); return; }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  updateDisplay();
}

// Mouse / touch
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "equals") equals();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "delete") deleteLast();
});

// Keyboard support
function flash(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 120);
}

document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (/^[0-9]$/.test(k) || k === ".") { inputNumber(k); flash(`[data-num="${k}"]`); }
  else if (["+", "-", "*", "/", "%"].includes(k)) {
    e.preventDefault(); chooseOperator(k); flash(`[data-op="${k}"]`);
  }
  else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); flash('[data-action="equals"]'); }
  else if (k === "Backspace") { deleteLast(); flash('[data-action="delete"]'); }
  else if (k === "Escape" || k === "Delete") { clearAll(); flash('[data-action="clear"]'); }
});