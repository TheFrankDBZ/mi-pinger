import { storage } from "./storage.js";
import { pingTarget, startTarget, stopTarget, isRunning } from "./pinger.js";
import { renderTargets, renderHistory } from "./ui.js";

const $ = (selector) => document.querySelector(selector);

const els = {
  form: $("#target-form"),
  formError: $("#form-error"),
  targets: $("#targets"),
  history: $("#history-body"),
  clear: $("#clear-history"),
  token: $("#panel-token"),
};

let targets = storage.getTargets();
let history = storage.getHistory();

function refresh() {
  renderTargets(els.targets, targets, history, actions, isRunning);
  renderHistory(els.history, history);
}

function record(result) {
  history = storage.addHistory(result);
  refresh();
}

const actions = {
  async pingNow(target) {
    record(await pingTarget(target));
  },

  toggle(target) {
    if (isRunning(target.id)) {
      stopTarget(target.id);
      target.active = false;
    } else {
      target.active = true;
      startTarget(target, record);
    }
    storage.saveTargets(targets);
    refresh();
  },

  remove(target) {
    stopTarget(target.id);
    targets = targets.filter((t) => t.id !== target.id);
    storage.saveTargets(targets);
    refresh();
  },
};

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  els.formError.textContent = "";

  const data = new FormData(els.form);

  let headers = {};
  const rawHeaders = String(data.get("headers") || "").trim();
  if (rawHeaders) {
    try {
      headers = JSON.parse(rawHeaders);
    } catch {
      els.formError.textContent = "Los headers no son un JSON válido.";
      return;
    }
  }

  const target = {
    id: crypto.randomUUID(),
    name: String(data.get("name")).trim(),
    url: String(data.get("url")).trim(),
    method: String(data.get("method")),
    headers,
    body: String(data.get("body") || "").trim() || null,
    intervalMin: Number(data.get("intervalMin")),
    active: data.get("autostart") === "on",
  };

  targets.push(target);
  storage.saveTargets(targets);

  if (target.active) startTarget(target, record);

  els.form.reset();
  refresh();
});

els.clear.addEventListener("click", () => {
  storage.clearHistory();
  history = [];
  refresh();
});

els.token.value = storage.getToken();
els.token.addEventListener("change", () => {
  storage.saveToken(els.token.value.trim());
});

// Al recargar la página, reanuda las tareas que estaban activas.
targets.filter((t) => t.active).forEach((t) => startTarget(t, record));

refresh();