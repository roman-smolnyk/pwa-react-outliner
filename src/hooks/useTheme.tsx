"use client";
import { createThemes } from "@wrksz/themes/client";
import { useMediaQuery } from "usehooks-ts";

export type Themes = "system" | "light" | "dark";

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

export function useIsThemeDark() {
  const { theme } = useTheme();

  const isSystemDark = useMediaQuery("(prefers-color-scheme: dark)");

  return theme === "dark" || (theme === "system" && isSystemDark);
}
