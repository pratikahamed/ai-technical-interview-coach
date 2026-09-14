import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}: BadgeProps) {
  const variantStyles = {
    primary:
      "bg-primary/10 text-primary border-primary/30",
    success:
      "bg-tertiary/10 text-tertiary border-tertiary/30",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/30",
    error:
      "bg-error/10 text-error border-error/30",
    neutral:
      "bg-surface-container text-on-surface-variant border-outline-variant",
  };

  const dotColors = {
    primary: "bg-primary",
    success: "bg-tertiary",
    warning: "bg-amber-400",
    error: "bg-error",
    neutral: "bg-outline",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-mono text-xs font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
