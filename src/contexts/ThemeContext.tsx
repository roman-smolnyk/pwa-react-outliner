import log from 'loglevel';
import { createContext, useContext, useEffect, useState } from "react";
import localPreferencesManager from "../store/preferences";

type ThemeContextState = {
  theme: "system" | "light" | "dark";
  setTheme: (v: "system" | "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextState | null>(null);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  log.debug("ThemeContextProvider");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    localPreferencesManager.get("theme").then((theme) => {
      setTheme(theme);
    });
  }, []);

  useEffect(() => {
    function applyTheme() {
      const root = window.document.documentElement;
      //   const root = document.getElementById("root")!;
      const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
      } else {
        root.removeAttribute("data-theme");
        root.classList.remove("dark");
      }
    }

    applyTheme();
    localPreferencesManager.set("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeContext must be used inside ThemeContextProvider");
  return ctx;
}
