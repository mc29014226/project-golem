"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { resolvedTheme, toggleTheme, theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-14 items-center rounded-full
                           bg-secondary transition-colors duration-300
                           hover:bg-muted focus:outline-none focus:ring-2
                           focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                role="switch"
                aria-checked={resolvedTheme === "dark"}
                aria-label="Toggle dark mode"
            >
                {/* Sun icon */}
                <span
                    className={`absolute left-1 text-sm transition-opacity duration-300 ${
                        resolvedTheme === "light" ? "opacity-100" : "opacity-30"
                    }`}
                >
                    ☀️
                </span>
                {/* Moon icon */}
                <span
                    className={`absolute right-1 text-sm transition-opacity duration-300 ${
                        resolvedTheme === "dark" ? "opacity-100" : "opacity-30"
                    }`}
                >
                    🌙
                </span>
                {/* Toggle dot */}
                <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-foreground
                                shadow-lg transition-transform duration-300 ${
                        resolvedTheme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                    theme === "system"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Use system theme"
            >
                Auto
            </button>
        </div>
    );
}
