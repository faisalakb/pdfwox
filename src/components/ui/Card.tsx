import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  as: Tag = "div",
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  variant?: "default" | "muted" | "outline";
}) {
  const styles =
    variant === "muted"
      ? "bg-[var(--color-surface-muted)] border border-transparent"
      : variant === "outline"
        ? "bg-transparent border border-[var(--color-line)]"
        : "bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-xs)]";
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] p-5 transition-shadow",
        styles,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
