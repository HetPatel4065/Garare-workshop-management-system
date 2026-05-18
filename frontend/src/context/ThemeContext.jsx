import React, { createContext, useState, useEffect, useMemo } from "react";

export const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  // Simplified setTheme—all DOM manipulation is safely offloaded to the useEffect
  const setTheme = (newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "system")
      return;
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateThemeDOM = () => {
      // 1. Freeze transitions across the whole page to protect frame rates
      root.classList.add("disable-transitions");

      // 2. Determine and apply correct class
      root.classList.remove("light", "dark");
      const isDarkNow =
        theme === "dark" || (theme === "system" && mediaQuery.matches);

      if (isDarkNow) {
        root.classList.add("dark");
      } else {
        root.classList.add("light"); // explicitly setting light can help style hooks
      }

      // 3. Force browser reflow to render the color swap instantly
      window.getComputedStyle(root).opacity;

      // 4. Safely unfreeze transitions for everyday elements/hovers
      root.classList.remove("disable-transitions");
    };

    // Run theme update on mount or whenever 'theme' state changes
    updateThemeDOM();

    // Listen to system preference changes if "system" is selected
    if (theme === "system") {
      mediaQuery.addEventListener("change", updateThemeDOM);
    }

    return () => {
      mediaQuery.removeEventListener("change", updateThemeDOM);
    };
  }, [theme]);

  // Sync theme changes across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme" && e.newValue) {
        setThemeState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = useMemo(() => {
    const mediaMatches =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    const isDark = theme === "dark" || (theme === "system" && mediaMatches);

    return {
      theme,
      setTheme,
      isDark,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
