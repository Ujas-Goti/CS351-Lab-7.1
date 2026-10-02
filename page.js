function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDue(due) {
  if (!due) return "No due date";
  const [year, month, day] = due.split("-").map(Number);
  if (!year || !month || !day) return escapeHtml(due);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function renderPage(tasks, { filter = "open", notice = "" } = {}) {
  const today = todayISO();
  const open = tasks.filter((task) => !task.done);
  const finished = tasks.filter((task) => task.done);
  const visible =
    filter === "done" ? finished : filter === "all" ? tasks : open;
  const nextDue = open
    .filter((task) => task.due)
    .sort((a, b) => a.due.localeCompare(b.due))[0];

  const rows = visible.length
    ? visible
        .map((task) => {
          const overdue = !task.done && task.due && task.due < today;
          const state = task.done ? "done" : overdue ? "overdue" : "open";
          return `<article class="task ${state}">
            <div>
              <p class="course">${escapeHtml(task.course)}</p>
              <h2>${escapeHtml(task.title)}</h2>
              <p class="due">${overdue ? "Overdue · " : ""}${formatDue(task.due)}</p>
            </div>
            <div class="actions">
              <form method="post" action="/tasks/${escapeHtml(task.id)}/toggle">
                <button type="submit">${task.done ? "Reopen" : "Mark done"}</button>
              </form>
              <form method="post" action="/tasks/${escapeHtml(task.id)}/delete">
                <button class="danger" type="submit">Remove</button>
              </form>
            </div>
          </article>`;
        })
        .join("")
    : `<p class="empty">${
        filter === "done"
          ? "Nothing finished yet."
          : "Nothing open. Add an assignment above."
      }</p>`;

  const tab = (name, label, count) =>
    `<a class="${filter === name ? "active" : ""}" href="/?filter=${name}">${label} <span>${count}</span></a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lab 7.1 Desk</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1c1915;
      --muted: #6d645b;
      --line: #e4ddd4;
      --paper: #f6f1ea;
      --card: #fffdf9;
      --accent: #0f6e6b;
      --accent-ink: #ffffff;
      --warn: #9a3412;
      --danger: #8f2d2d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
      background: var(--paper);
      color: var(--ink);
    }
    main { width: min(760px, calc(100% - 32px)); margin: 40px auto 64px; }
    header h1 { margin: 0 0 6px; font-size: 2.4rem; letter-spacing: -0.03em; }
    header p { margin: 0; color: var(--muted); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 28px 0; }
    .stat { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }
    .stat span { display: block; color: var(--muted); font-size: 0.85rem; }
    .stat strong { font-size: 1.35rem; }
    form.add, .task, .notice {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
    }
    form.add { display: grid; grid-template-columns: 140px 1fr 160px auto; gap: 10px; padding: 14px; }
    label { display: grid; gap: 6px; font-size: 0.82rem; color: var(--muted); }
    input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      color: var(--ink);
      background: #fff;
    }
    button {
      border: 0;
      border-radius: 999px;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
      background: var(--accent);
      color: var(--accent-ink);
    }
    button.danger { background: transparent; color: var(--danger); border: 1px solid #e7c7c7; }
    .tabs { display: flex; gap: 8px; margin: 22px 0 12px; }
    .tabs a {
      color: var(--ink);
      text-decoration: none;
      border-radius: 999px;
      padding: 8px 12px;
      border: 1px solid transparent;
    }
    .tabs a.active { background: var(--card); border-color: var(--line); }
    .tabs span { color: var(--muted); }
    .task { display: flex; justify-content: space-between; gap: 16px; padding: 16px 18px; margin-bottom: 10px; }
    .task h2 { margin: 2px 0 6px; font-size: 1.2rem; }
    .course, .due, .empty { margin: 0; color: var(--muted); }
    .task.overdue .due { color: var(--warn); }
    .task.done h2 { text-decoration: line-through; color: var(--muted); }
    .actions { display: flex; gap: 8px; align-items: center; }
    .actions form { margin: 0; }
    .notice { padding: 12px 14px; margin-bottom: 12px; }
    .empty { padding: 8px 2px 16px; }
    footer { margin-top: 28px; color: var(--muted); font-size: 0.92rem; }
    footer a { color: var(--accent); }
    @media (max-width: 720px) {
      .stats, form.add { grid-template-columns: 1fr; }
      .task { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Lab desk</h1>
      <p>Assignments for this machine. Node saves them in <code>data/tasks.json</code>.</p>
    </header>
    <section class="stats">
      <div class="stat"><span>Open</span><strong>${open.length}</strong></div>
      <div class="stat"><span>Finished</span><strong>${finished.length}</strong></div>
      <div class="stat"><span>Next due</span><strong>${nextDue ? formatDue(nextDue.due) : "—"}</strong></div>
    </section>
    <form class="add" method="post" action="/tasks">
      <label>Course <input name="course" value="CS 351" required /></label>
      <label>Assignment <input name="title" placeholder="What do you need to finish?" required /></label>
      <label>Due <input name="due" type="date" /></label>
      <label>&nbsp;<button type="submit">Add</button></label>
    </form>
    <nav class="tabs">
      ${tab("open", "Open", open.length)}
      ${tab("done", "Done", finished.length)}
      ${tab("all", "All", tasks.length)}
    </nav>
    ${notice ? `<p class="notice">${escapeHtml(notice)}</p>` : ""}
    ${rows}
    <footer>JSON for the same list: <a href="/api/tasks">/api/tasks</a></footer>
  </main>
</body>
</html>`;
}

module.exports = { renderPage };
