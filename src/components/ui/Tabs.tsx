"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = React.useCallback(
    (v: string) => {
      if (controlled === undefined) setInternal(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange],
  );
  const idBase = React.useId();

  return (
    <TabsContext.Provider value={{ value, setValue, idBase }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value: tabValue,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>");
  const selected = ctx.value === tabValue;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`${ctx.idBase}-panel-${tabValue}`}
      id={`${ctx.idBase}-tab-${tabValue}`}
      onClick={() => ctx.setValue(tabValue)}
      className={cn(
        "focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-xs)]"
          : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value: tabValue,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>");
  if (ctx.value !== tabValue) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.idBase}-panel-${tabValue}`}
      aria-labelledby={`${ctx.idBase}-tab-${tabValue}`}
      className={className}
    >
      {children}
    </div>
  );
}
