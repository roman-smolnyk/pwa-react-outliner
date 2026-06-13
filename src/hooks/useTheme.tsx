"use client";
import { createThemes } from "@wrksz/themes/client";
import { useEffect, useState } from "react";

export const THEMES = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const { ThemeProvider, useTheme, useThemeValue, useThemeEffect } = createThemes({
  themes: ["light", "dark"] as const,
  defaultTheme: "system",
  storage: "localStorage",
  attribute: "class",
  enableColorScheme: false,
});

export function useIsDarkTheme() {
  const { theme } = useTheme();

  const [isSystemDark, setIsSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (event: MediaQueryListEvent) => setIsSystemDark(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return theme === "dark" || (theme === "system" && isSystemDark);
}
