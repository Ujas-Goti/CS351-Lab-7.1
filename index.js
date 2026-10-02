const http = require("http");
const { load, addTask, setDone, removeTask } = require("./store");
const { renderPage } = require("./page");

const PORT = process.env.PORT || 3000;

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const filter = ["open", "done", "all"].includes(url.searchParams.get("filter"))
    ? url.searchParams.get("filter")
    : "open";

  if (req.method === "GET" && url.pathname === "/") {
    send(res, 200, renderPage(load(), { filter }), "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tasks") {
    send(res, 200, JSON.stringify(load(), null, 2), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "POST" && url.pathname === "/tasks") {
    const fields = new URLSearchParams(await readBody(req));
    const title = fields.get("title") || "";
    if (!title.trim()) {
      send(
        res,
        400,
        renderPage(load(), { filter: "open", notice: "Add a title before saving." }),
        "text/html; charset=utf-8"
      );
      return;
    }
    addTask({
      course: fields.get("course") || "",
      title,
      due: fields.get("due") || "",
    });
    redirect(res, "/?filter=open");
    return;
  }

  const toggle = url.pathname.match(/^\/tasks\/([^/]+)\/toggle$/);
  if (req.method === "POST" && toggle) {
    const tasks = load();
    const current = tasks.find((task) => task.id === decodeURIComponent(toggle[1]));
    if (!current) {
      send(res, 404, "Task not found", "text/plain; charset=utf-8");
      return;
    }
    setDone(current.id, !current.done);
    redirect(res, current.done ? "/?filter=open" : "/?filter=done");
    return;
  }

  const remove = url.pathname.match(/^\/tasks\/([^/]+)\/delete$/);
  if (req.method === "POST" && remove) {
    removeTask(decodeURIComponent(remove[1]));
    redirect(res, `/?filter=${filter}`);
    return;
  }

  send(res, 404, "Not found", "text/plain; charset=utf-8");
});

server.listen(PORT, () => {
  console.log(`Lab desk running at http://localhost:${PORT}`);
});
