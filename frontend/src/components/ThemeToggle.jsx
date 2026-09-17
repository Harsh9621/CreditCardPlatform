import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

const modes = {
  system: {
    icon: "◐",
    label: "Default",
    next: "light",
  },

  light: {
    icon: "☀",
    label: "Light",
    next: "dark",
  },

  dark: {
    icon: "☾",
    label: "Dark",
    next: "system",
  },
};

export default function ThemeToggle() {
  const { mode, setTheme } = useTheme();

  const current = modes[mode] || modes.system;
  const nextMode = modes[current.next];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(current.next)}
      aria-label={`Current theme: ${current.label}. Switch to ${nextMode.label} theme`}
      title={`Theme: ${current.label}`}
    >
      <span className="theme-icon" aria-hidden="true">
        {current.icon}
      </span>

      <span className="theme-label">{current.label}</span>
    </button>
  );
}
