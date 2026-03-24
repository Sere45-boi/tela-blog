"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger";
  formAction?: string; // for server-action forms
}

interface RowActionsProps {
  actions: Action[];
}

/**
 * A click-toggled action dropdown — replaces hover-only CSS group/hover dropdowns.
 * Closes on outside click, Escape key, and after any action is triggered.
 */
export function RowActions({ actions }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // Compute fixed position when opening
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 200; // approximate max height

      if (spaceBelow < menuHeight) {
        // Open upward
        setMenuStyle({
          position: "fixed",
          right: window.innerWidth - rect.right,
          bottom: window.innerHeight - rect.top + 4,
        });
      } else {
        // Open downward
        setMenuStyle({
          position: "fixed",
          right: window.innerWidth - rect.right,
          top: rect.bottom + 4,
        });
      }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape and scroll
  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const scrollHandler = () => setOpen(false);
    document.addEventListener("keydown", escHandler);
    if (open) window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("keydown", escHandler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`p-2.5 rounded-xl transition-all ${
          open
            ? "text-[#093C15] bg-[#41cc00]/10"
            : "text-black/20 hover:text-[#093C15] hover:bg-black/5"
        }`}
        aria-label="Row actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          style={menuStyle}
          className="w-36 bg-white rounded-xl border border-black/5 shadow-2xl z-[9999] p-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {actions.map((action, i) => {
            const base =
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors text-left";
            const color =
              action.variant === "danger"
                ? "text-red-500 hover:bg-red-50"
                : "text-[#1d1d1f] hover:bg-[#41cc00]/10";

            if (action.href) {
              return (
                <a
                  key={i}
                  href={action.href}
                  className={`${base} ${color}`}
                  onClick={() => setOpen(false)}
                >
                  {action.icon}
                  {action.label}
                </a>
              );
            }

            if (action.formAction) {
              return (
                <form key={i} action={action.formAction} className="w-full">
                  <button type="submit" className={`${base} ${color}`} onClick={() => setOpen(false)}>
                    {action.icon}
                    {action.label}
                  </button>
                </form>
              );
            }

            return (
              <button
                key={i}
                type="button"
                className={`${base} ${color}`}
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
