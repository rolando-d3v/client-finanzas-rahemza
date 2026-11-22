const STORAGE_KEY = "theme-is";

export function resolveAgThemeMode(theme) {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const body = document.body;
  const html = document.documentElement;
  const agMode = resolveAgThemeMode(theme);

  if (theme === "dark") {
    body.setAttribute("data-theme", "dark");
    html.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    body.setAttribute("data-theme", "light");
    html.setAttribute("data-theme", "light");
  } else {
    body.removeAttribute("data-theme");
    html.removeAttribute("data-theme");
  }

  body.setAttribute("data-ag-theme-mode", agMode);
  html.setAttribute("data-ag-theme-mode", agMode);

  localStorage.setItem(STORAGE_KEY, theme);
}

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || "light";
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
