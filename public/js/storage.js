const KEY_TARGETS = "pinger.targets.v1";
const KEY_HISTORY = "pinger.history.v1";
const KEY_TOKEN = "pinger.token.v1";
const MAX_HISTORY = 200;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Si el navegador bloquea el almacenamiento, el panel sigue funcionando sin guardar.
  }
}

export const storage = {
  getTargets: () => read(KEY_TARGETS, []),
  saveTargets: (targets) => write(KEY_TARGETS, targets),

  getHistory: () => read(KEY_HISTORY, []),
  addHistory(entry) {
    const next = [entry, ...read(KEY_HISTORY, [])].slice(0, MAX_HISTORY);
    write(KEY_HISTORY, next);
    return next;
  },
  clearHistory: () => write(KEY_HISTORY, []),

  getToken: () => read(KEY_TOKEN, ""),
  saveToken: (token) => write(KEY_TOKEN, token),
};