import { useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { applyTheme, getStoredTheme } from "../../styles/theme";
import styles from "./toggle.module.css";

export default function ToggleTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = getStoredTheme();
    // Si es "system" o "dark", verificar si actualmente es dark
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // system → resolver según preferencia del SO
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    applyTheme(next);
  };

  return (
    <button
      className={styles.toggleBtn}
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <span className={`${styles.icon} ${isDark ? styles.iconHidden : styles.iconVisible}`}>
        <FiSun />
      </span>
      <span className={`${styles.icon} ${isDark ? styles.iconVisible : styles.iconHidden}`}>
        <FiMoon />
      </span>
    </button>
  );
}
