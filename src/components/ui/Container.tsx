import * as React from "react";
import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  size = "lg",
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  as?: React.ElementType;
}) {
  const max = {
    sm: "max-w-[640px]",
    md: "max-w-[800px]",
    lg: "max-w-[1120px]",
    xl: "max-w-[1280px]",
  }[size];

  return (
    <Tag className={cn("container-px mx-auto w-full", max, className)}>
      {children}
    </Tag>
  );
}
