const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "data", "tasks.json");

function load() {
  const raw = fs.readFileSync(FILE, "utf8");
  const tasks = JSON.parse(raw);
  if (!Array.isArray(tasks)) {
    throw new Error("tasks.json must contain an array");
  }
  return tasks;
}

function save(tasks) {
  fs.writeFileSync(FILE, `${JSON.stringify(tasks, null, 2)}\n`);
}

function addTask({ course, title, due }) {
  const tasks = load();
  const task = {
    id: Date.now().toString(36),
    course: course.trim() || "CS 351",
    title: title.trim(),
    due: due.trim(),
    done: false,
  };
  tasks.unshift(task);
  save(tasks);
  return task;
}

function setDone(id, done) {
  const tasks = load();
  const task = tasks.find((item) => item.id === id);
  if (!task) return null;
  task.done = done;
  save(tasks);
  return task;
}

function removeTask(id) {
  const tasks = load();
  const next = tasks.filter((item) => item.id !== id);
  if (next.length === tasks.length) return false;
  save(next);
  return true;
}

module.exports = { load, addTask, setDone, removeTask };
