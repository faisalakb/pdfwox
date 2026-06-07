import * as React from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-muted)] px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mx-auto mb-3 h-10 w-10 text-[var(--color-ink-muted)]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-ink-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-5",
        className,
      )}
    >
      <p className="font-medium text-[var(--color-danger)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Stepper({
  current,
  steps,
  className,
}: {
  current: number;
  steps: string[];
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-3 text-sm", className)}>
      {steps.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending";
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                state === "active" &&
                  "bg-[var(--color-accent)] text-[var(--color-accent-ink)]",
                state === "done" &&
                  "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
                state === "pending" &&
                  "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]",
              )}
            >
              {state === "done" ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                state === "pending" && "text-[var(--color-ink-muted)]",
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="mx-1 h-px w-6 bg-[var(--color-line)]"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
