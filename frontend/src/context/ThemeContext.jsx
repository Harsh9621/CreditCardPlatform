import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "cardwise-theme";

const THEMES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
};

function getStoredTheme() {
  if (typeof window === "undefined") {
    return THEMES.SYSTEM;
  }

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (
      savedTheme === THEMES.LIGHT ||
      savedTheme === THEMES.DARK ||
      savedTheme === THEMES.SYSTEM
    ) {
      return savedTheme;
    }
  } catch (error) {
    console.warn(
      "CardWise: unable to read saved theme.",
      error,
    );
  }

  return THEMES.SYSTEM;
}

function getSystemTheme() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia
  ) {
    return window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }

  return THEMES.LIGHT;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredTheme);

  const [systemTheme, setSystemTheme] = useState(
    getSystemTheme,
  );

  const activeTheme =
    mode === THEMES.SYSTEM ? systemTheme : mode;

  // ===================================================
  // SAVE THEME PREFERENCE
  // ===================================================

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.warn(
        "CardWise: unable to save theme preference.",
        error,
      );
    }
  }, [mode]);

  // ===================================================
  // WATCH SYSTEM THEME
  // ===================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleChange = (event) => {
      setSystemTheme(
        event.matches
          ? THEMES.DARK
          : THEMES.LIGHT,
      );
    };

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, []);

  // ===================================================
  // APPLY THEME
  // ===================================================

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = activeTheme;
    root.dataset.themeMode = mode;

    root.style.colorScheme = activeTheme;
  }, [activeTheme, mode]);

  // ===================================================
  // SET THEME
  // ===================================================

  const setTheme = useCallback((newMode) => {
    if (
      newMode !== THEMES.SYSTEM &&
      newMode !== THEMES.LIGHT &&
      newMode !== THEMES.DARK
    ) {
      console.warn(
        `CardWise: invalid theme "${newMode}".`,
      );

      return;
    }

    setMode(newMode);
  }, []);

  // ===================================================
  // TOGGLE THEME
  // ===================================================

  const toggleTheme = useCallback(() => {
    if (mode === THEMES.SYSTEM) {
      setTheme(
        activeTheme === THEMES.DARK
          ? THEMES.LIGHT
          : THEMES.DARK,
      );

      return;
    }

    if (mode === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
      return;
    }

    setTheme(THEMES.LIGHT);
  }, [mode, activeTheme, setTheme]);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      mode,

      theme: activeTheme,
      activeTheme,

      isDark: activeTheme === THEMES.DARK,
      isLight: activeTheme === THEMES.LIGHT,
      isSystem: mode === THEMES.SYSTEM,

      setTheme,
      toggleTheme,

      themes: THEMES,
    }),
    [
      mode,
      activeTheme,
      setTheme,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// =====================================================
// USE THEME
// =====================================================

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}

export default ThemeContext;