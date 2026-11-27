const STORAGE_KEY = "todo-app-tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const listFooter = document.getElementById("list-footer");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");

let tasks = loadTasks();

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage unavailable (e.g. private mode); keep working in memory.
  }
}

function render() {
  list.innerHTML = "";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task done");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, text, del);
    list.appendChild(li);
  }

  emptyState.hidden = tasks.length > 0;
  listFooter.hidden = tasks.length === 0;
  clearCompletedBtn.disabled = !tasks.some((t) => t.done);

  const openCount = tasks.filter((t) => !t.done).length;
  taskCount.textContent =
    openCount === 0 ? "All done! 🎉" : openCount === 1 ? "1 task left" : `${openCount} tasks left`;
}

function addTask(text) {
  tasks.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  const doneCount = tasks.filter((t) => t.done).length;
  if (doneCount === 0) return;

  const label = doneCount === 1 ? "1 completed task" : `${doneCount} completed tasks`;
  if (!confirm(`Delete ${label}? This can't be undone.`)) return;

  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

clearCompletedBtn.addEventListener("click", clearCompleted);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

// ---------- Dark mode ----------

const THEME_KEY = "todo-app-theme";
const themeToggle = document.getElementById("theme-toggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function currentTheme() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return systemDark.matches ? "dark" : "light";
}

function updateThemeToggle() {
  const isDark = currentTheme() === "dark";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.title = isDark ? "Light mode" : "Dark mode";
}

themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage unavailable; the theme still applies until the page is closed.
  }
  updateThemeToggle();
});

// If no theme has been picked, follow system changes live.
systemDark.addEventListener("change", updateThemeToggle);

updateThemeToggle();
render();
