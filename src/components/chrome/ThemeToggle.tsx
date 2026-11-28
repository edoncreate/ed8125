"use client";

import { useState } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";

export function ThemeToggle({ className }: { className?: string }) {
  // Server renders dark; the head script may have switched it before hydration.
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ed8125-theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={["icon-btn", className].filter(Boolean).join(" ")}
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      suppressHydrationWarning
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
