import * as React from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "focus-ring w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] disabled:opacity-50 transition-colors";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          fieldBase,
          "h-11",
          invalid && "border-[var(--color-danger)]",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        fieldBase,
        "min-h-28 py-3",
        invalid && "border-[var(--color-danger)]",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-sm font-medium text-[var(--color-ink)]",
        className,
      )}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export function HelpText({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <p
      className={cn(
        "mt-1.5 text-xs",
        tone === "error"
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-ink-muted)]",
      )}
    >
      {children}
    </p>
  );
}
