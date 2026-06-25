"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
        </span>
      </span>
    </button>
  );
}
