"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Native <dialog>-based modal. Closes on Escape / backdrop-click / explicit close.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      className={cn(
        "backdrop:bg-black/40 backdrop:backdrop-blur-sm",
        "w-[calc(100%-2rem)] max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <header className="mb-4">
        <h2 className="font-display text-xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
      </header>
      {children}
    </dialog>
  );
}
