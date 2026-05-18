import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { motion } from "framer-motion";

export default function ThemeToggle({ variant = "compact" }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  const isFull = variant === "full";

  return (
    <div
      className="flex items-center p-1 theme-toggle-container rounded-full w-fit relative transition-all duration-300 select-none shadow-xs border"
      role="radiogroup"
      aria-label="Application Theme"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            role="radio"
            aria-checked={isActive}
            className={`relative flex items-center justify-center gap-2 cursor-pointer rounded-full
              ${isFull ? "px-4 py-2 text-[9px] font-black uppercase tracking-widest" : "p-2 text-sm"}`}
            aria-label={`Switch to ${opt.label} theme`}
            title={`${opt.label} Theme`}
          >
            {isActive && (
              <motion.div
                layoutId={`activeThemeIndicator-${variant}`}
                className="absolute inset-0 theme-indicator-active rounded-full shadow-xs border border-slate-200/20"
                transition={{ type: "spring", stiffness: 500, damping: 50 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-20" />
            {isFull && (
              <span className="relative z-20 uppercase tracking-widest text-[9px] font-black">
                {opt.label}
              </span>
            )}
            {!isFull && <span className="sr-only">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
