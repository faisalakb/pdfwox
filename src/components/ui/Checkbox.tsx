import * as React from "react";
import { cn } from "@/lib/cn";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Checkbox({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "focus-ring h-4.5 w-4.5 shrink-0 cursor-pointer appearance-none rounded-[var(--radius-xs)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] transition-colors checked:border-[var(--color-accent)] checked:bg-[var(--color-accent)]",
        "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22white%22><path d=%22M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z%22/></svg>')] checked:bg-[length:14px] checked:bg-center checked:bg-no-repeat",
        className,
      )}
      {...rest}
    />
  );
});

export const Radio = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Radio({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      type="radio"
      className={cn(
        "focus-ring h-4.5 w-4.5 shrink-0 cursor-pointer appearance-none rounded-[var(--radius-full)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] transition-colors",
        "checked:border-[5px] checked:border-[var(--color-accent)]",
        className,
      )}
      {...rest}
    />
  );
});
