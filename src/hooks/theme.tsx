"use client";
import { createThemes } from "@wrksz/themes/client";

export const { ThemeProvider, useTheme, useThemeValue, useThemeEffect } = createThemes({
  themes: ["light", "dark", "zebra"] as const,
  defaultTheme: "system",
  storage: "localStorage",
  attribute: "class",
  enableColorScheme: false,
});
