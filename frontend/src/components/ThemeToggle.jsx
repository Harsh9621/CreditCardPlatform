import { useEffect, useState } from "react";
import "./ThemeToggle.css";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setDarkMode((previous) => !previous)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-icon">{darkMode ? "☀" : "☾"}</span>

      <span className="theme-label">{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeToggle;
