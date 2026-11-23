export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (key === "class") {
      el.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== false && value != null) {
      el.setAttribute(key, value === true ? "" : value);
    }
  }

  for (const child of children.flat()) {
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return el;
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" });

function badge(result) {
  if (!result) return h("span", { class: "badge idle" }, "Sin datos");
  if (result.ok) return h("span", { class: "badge ok" }, `OK ${result.status}`);
  if (result.status) return h("span", { class: "badge fail" }, `Error ${result.status}`);
  return h("span", { class: "badge fail" }, "Sin respuesta");
}

export function renderTargets(container, targets, history, actions, isRunning) {
  container.replaceChildren();

  if (!targets.length) {
    container.append(
      h("p", { class: "empty" }, "Aún no hay tareas. Crea la primera en el formulario.")
    );
    return;
  }

  for (const t of targets) {
    const last = history.find((r) => r.targetId === t.id);
    const running = isRunning(t.id);

    container.append(
      h(
        "article",
        { class: "task" },
        h("div", { class: "task-head" }, h("strong", {}, t.name), badge(last)),
        h("code", { class: "task-url" }, `${t.method} ${t.url}`),
        h(
          "p",
          { class: "task-meta" },
          `Cada ${t.intervalMin} min · `,
          running ? "▶ Activa en este panel" : "⏸ Pausada",
          last ? ` · último: ${fmtDate(last.at)} (${last.ms} ms)` : ""
        ),
        h(
          "div",
          { class: "task-actions" },
          h("button", { class: "btn", onClick: () => actions.pingNow(t) }, "Ping ahora"),
          h(
            "button",
            { class: "btn", onClick: () => actions.toggle(t) },
            running ? "Pausar" : "Iniciar"
          ),
          h("button", { class: "btn danger", onClick: () => actions.remove(t) }, "Eliminar")
        )
      )
    );
  }
}

export function renderHistory(tbody, history) {
  tbody.replaceChildren();

  if (!history.length) {
    tbody.append(
      h("tr", {}, h("td", { colspan: 6, class: "empty" }, "Sin registros todavía."))
    );
    return;
  }

  for (const r of history) {
    tbody.append(
      h(
        "tr",
        {},
        h("td", {}, fmtDate(r.at)),
        h("td", {}, r.name),
        h("td", {}, badge(r)),
        h("td", {}, r.status ?? "—"),
        h("td", {}, r.ms != null ? `${r.ms} ms` : "—"),
        h("td", { class: "err" }, r.error ?? "")
      )
    );
  }
}