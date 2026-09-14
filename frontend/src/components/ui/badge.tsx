import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "tertiary" | "error" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-container text-slate-300 border-outline",
    primary: "bg-primary/10 text-primary border-primary/30",
    secondary: "bg-secondary/10 text-secondary border-secondary/30",
    tertiary: "bg-tertiary/10 text-tertiary border-tertiary/30",
    error: "bg-error/10 text-error border-error/30",
    outline: "bg-transparent text-slate-400 border-outline",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border specular-rim tracking-wide ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
