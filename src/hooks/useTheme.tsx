"use client";
import { createThemes } from "@wrksz/themes/client";

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
